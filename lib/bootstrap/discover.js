/**
 * (c) 2017 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

"use strict";

const Path = require( "path" );

/**
 * Provides implementation for first stage of bootstrapping hitchy instance by
 * discovering available plugins.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function():Promise.<HitchyPluginHandle[]>} function for discovering plugins
 */
module.exports = function( options ) {
	const that = this;
	const Log = that.log( "hitchy:bootstrap" );

	return _bootstrapDiscover;


	/**
	 * Discovers plugins available with core distribution of Hitchy as well as
	 * in locally installed npm packages.
	 *
	 * @returns {Promise.<HitchyPluginHandle[]>} lists descriptions of discovered plugins
	 * @private
	 */
	function _bootstrapDiscover() {
		if ( !options.projectFolder ) {
			throw new Error( "missing information on application root folder" );
		}

		options.projectFolder = Path.resolve( options.projectFolder );

		return require( "./discover/extensions" ).call( that, options )()
			.then( extensions => readMetaData( extensions ) )
			.then( dropPluginsWithoutMeta )
			.then( loadPluginAPIs )
			.then( dropPluginsWithoutRole )
			.then( sortByWeight )
			.then( promoteAPIs );
	}

	/**
	 * Reads package.json files of all detected plugin candidates.
	 *
	 * @param {string[]} pluginPathNames path names of plugin candidates
	 * @returns {Promise.<HitchyPluginHandle[]>} promises package data of all candidates
	 */
	function readMetaData( pluginPathNames ) {
		return Promise.all( pluginPathNames.map( function( pluginPathName ) {
			const name = Path.basename( pluginPathName ),
				handle = {
					name: name,
					staticRole: name,
					folder: pluginPathName,
					meta: {}
				};

			return that.utility.file.readMeta( [ handle.folder, "hitchy.json" ], { failIfMissing: true } )
				.catch( function( error ) {
					if ( error.code !== "ENOENT" ) {
						Log( "failed reading hitchy.json in folder %s", handle.folder );
					}
				} )
				.then( meta => {
					let _meta = meta;

					if ( _meta && typeof _meta === "object" ) {
						_meta.$valid = true;
					} else {
						_meta = {};
					}

					if ( _meta.role ) {
						handle.staticRole = _meta.role;
					}

					handle.meta = _meta;

					return handle;
				} );
		} ) );
	}

	/**
	 * Drops all plugin candidates that don't comply with properly describing
	 * a hitchy plugin.
	 *
	 * @param {HitchyPluginHandle[]} pluginHandles raw list of descriptions of discovered plugins
	 * @returns {HitchyPluginHandle[]} list of complying plugins' descriptions
	 */
	function dropPluginsWithoutMeta( pluginHandles ) {
		const length = pluginHandles.length;
		const filtered = new Array( length );
		let write = 0;

		for ( let read = 0; read < length; read++ ) {
			const handle = pluginHandles[read];

			if ( handle.meta.$valid ) {
				filtered[write++] = handle;
			}
		}

		filtered.splice( write, length - write );

		return filtered;
	}

	/**
	 * Loads all plugins in order of provided plugin handles.
	 *
	 * Achievements:
	 *  * Loads all discovered plugins.
	 *  * Fetches API of either plugin.
	 *  * Qualifies meta data and requested role per plugin.
	 *  * Detects plugins claiming to fill the same role.
	 *
	 * @param {HitchyPluginHandle[]} handles description of discovered plugins
	 * @return {Promise<HitchyPluginHandle[]>} same description as provided, extended by either plugins basically integrating API
	 */
	function loadPluginAPIs( handles ) {
		const allLoadedPluginsByName = {};

		handles.forEach( handle => {
			const name = handle.name;
			if ( allLoadedPluginsByName.hasOwnProperty( name ) ) {
				Log( `double discovery of plugin ${name}` );
			}

			allLoadedPluginsByName[name] = handle;
		} );

		return new Promise( ( resolve, reject ) => {
			loadPlugin( 0, handles.length );

			/**
			 * Loads another plugin from list of discovered plugins.
			 *
			 * @param {int} nextIndex index into list of plugin descriptions
			 * @param {int} count cached number of available plugin descriptions
			 * @returns {void}
			 * @private
			 */
			function loadPlugin( nextIndex, count ) {
				if ( nextIndex >= count ) {
					resolve( handles );
					return;
				}

				// load next plugin in list
				const handle = handles[nextIndex];


				that.loader( handle.folder, allLoadedPluginsByName, handle )
					.then( compilePluginIntegrationApi )
					.catch( _fail );


				/**
				 * Collects important elements from integrating API of loaded
				 * plugin.
				 *
				 * @param {object} api API exposed by loaded plugin's entry file
				 * @returns {void}
				 * @private
				 */
				function compilePluginIntegrationApi( api ) {
					let _api = api;
					if ( !_api ) {
						Log( `plugin ${handle.name} does not export any API` );
						_api = {};
					}

					const dynamicMeta = _api.$meta || {};
					const dynamicRole = dynamicMeta.role;

					// inject meta information qualified by obeying extra info
					// provided by plugin's code providing API itself
					_api.$meta = that.utility.object.merge( handle.meta, dynamicMeta );

					// inject name of plugin
					_api.$name = handle.name;

					// manage plugin's role
					if ( dynamicRole ) {
						// plugin dynamically declares to fill some role
						// -> revoke this role from any other plugin
						//    declaring it statically, only
						// -> ensure this plugin is only one declaring
						//    dynamically to fill this role
						const role = dynamicRole;

						for ( let i = 0, length = handles.length; i < length; i++ ) {
							const iter = handles[i];

							if ( iter.staticRole === role ) {
								Log( `revoking role ${role} from ${iter.name} for using static claim, only` );
								iter.staticRole = null;
							}

							if ( iter.api && role === iter.api.$role ) {
								reject( new Error( `multiple plugins claim to take role ${role}: affects ${iter.name} and ${handle.name}` ) );
								return;
							}
						}

						// expose role claimed to fill by plugin to approve it
						_api.$role = _api.$meta.role;
					}


					// track reference on plugin's API in handle as well
					handle.api = _api;

					// start loading next plugin in list (w/o wasting stack frames)
					process.nextTick( loadPlugin, nextIndex + 1, count );
				}

				/**
				 * Normalizes error message on failed loading a discovered
				 * plugin's integration API.
				 *
				 * @param {Error} error actually encountered error
				 * @returns {void}
				 * @private
				 */
				function _fail( error ) {
					// TODO add support for optionally keeping hitchy bootstrapping
					//      any other plugin (by invoking setTimeout() above instead of reject)
					Log( "Loading plugin %s failed: %s", handle.name, error );

					reject( new Error( `loading plugin ${handle.name} failed: ${String( error.message || error || "unknown error" )}` ) );
				}
			}
		} )
			.then( pluginHandles => {
				// make sure any plugin declaring undisputed role statically
				// is considered filling that role eventually
				pluginHandles.forEach( handle => {
					if ( !handle.api.$role && handle.staticRole ) {
						handle.api.$role = handle.staticRole;
					}
				} );

				// permit every plugin to handle final discovery of all
				// available plugins (now being able to access either plugin's
				// API e.g. to overload/extend it on replacing plugin).
				return that.utility.promise.each( pluginHandles, handle => {
					if ( handle.api.$role && typeof handle.api.onDiscovered === "function" ) {
						return handle.api.onDiscovered.call( that, options, allLoadedPluginsByName, handle );
					}

					return undefined;
				} );
			} );
	}

	/**
	 * Removes all discovered plugins fail to claim a role in Hitchy application.
	 *
	 * @note Every plugin is assumed to claim a role. Different plugins might
	 *       claim the same role, e.g. "odm" to indicate they compete with each
	 *       other in providing a particular API for an application.
	 *
	 * @param {HitchyPluginHandle[]} handles descriptions of discovered plugins
	 * @returns {HitchyPluginHandle[]} descriptions of plugins properly claiming a role
	 */
	function dropPluginsWithoutRole( handles ) {
		return handles.filter( handle => handle && handle.api.$role );
	}

	/**
	 * Sorts plugins according to dependencies provided by either plugin.
	 *
	 * @param {HitchyPluginHandle[]} handles descriptions of discovered plugins
	 * @return {Promise<HitchyPluginHandle[]>} descriptions of discovered plugins sorted in order of depending on each other
	 */
	function sortByWeight( handles ) {
		const index = {};
		let weights = {};

		// create map for addressing any API in provided list by its name
		handles.forEach( ( handle, i ) => {
			const role = handle.api.$role;

			if ( index.hasOwnProperty( role ) ) {
				const error = new Error( "multiple plugins are claiming to take same role: " + role );

				Log( error.message );

				throw error;
			}

			index[role] = i;
		} );

		// check project folder for meta data defining dependencies on plugins
		return that.utility.file.readMeta( [ options.projectFolder, "hitchy.json" ], { keepMissingDependencies: true } )
			.then( function _selectDependencies( meta ) {
				let enabledPlugins;

				if ( options.dependencies ) {
					if ( typeof options.dependencies === "string" ) {
						options.dependencies = [options.dependencies];
					}

					if ( Array.isArray( options.dependencies ) ) {
						meta.dependencies = options.dependencies;
					}
				}

				if ( Array.isArray( meta.dependencies ) ) {
					// -> map list of dependencies into handles selected by
					//    listed role
					enabledPlugins = _getHandlesOfRoles( meta.dependencies, "hitchy.json file of project" );
				} else {
					// enable all found plugins by considering them all being
					// dependencies of current project
					enabledPlugins = handles;
				}

				// recursively count dependencies of every enabled plugin
				// resulting in a list of either plugin's weights
				// (more weight = more plugins depend on it, so it must be
				// started as early as possible)
				enabledPlugins.forEach( handle => countRequests( handle.api ) );

				// extract any dependant defined in one of the enabled plugins
				let dependants = {};

				for ( let i = 0, length = handles.length; i < length; i++ ) {
					const list = handles[i].api.$meta.dependants;

					if ( list && Array.isArray( list ) ) {
						for ( let li = 0, lLength = list.length; li < lLength; li++ ) {
							dependants[list[li]] = true;
						}
					}
				}

				// reduce list by removing all enabled plugins
				dependants = Object.keys( dependants )
					.filter( function( role ) {
						const i = index[role];
						if ( isNaN( i ) ) {
							throw new Error( `missing plugin for role ${role} required as a dependant` );
						}

						return !weights[role];
					} );

				if ( dependants.length ) {
					// need to consider those dependants as if they were given
					// in project's hitchy.json file as dependencies of project
					enabledPlugins = enabledPlugins.concat( _getHandlesOfRoles( dependants ) );

					// need to restart counting dependencies
					weights = {};
					enabledPlugins.forEach( handle => countRequests( handle.api ) );
				}

				if ( options.debug ) {
					handles.forEach( function( handle ) {
						Log( `dependency weight of role ${handle.api.$role} filled by plugin ${handle.name} is ${weights[handle.api.$role]}` );
					} );
				}

				const sorted = handles
					// drop plugins w/o weight (not required by any enabled one)
					.filter( handle => Boolean( weights[handle.api.$role] ) )
					// sort left handles from high weight to low
					.sort( ( left, right ) => ( weights[right.api.$role] || 0 ) - ( weights[left.api.$role] || 0 ) );

				// inject index per handle enabling tests assessing sorting
				sorted.forEach( ( handle, i ) => ( handle.api.$index = i ) );

				return sorted;
			} );


		/**
		 * Counts immediate and mediate dependencies of a given plugin.
		 *
		 * @param {HitchyPlugin} plugin description of single plugin
		 * @param {string=} initial role of dependency counted before (used to
		 *        detect circular dependencies)
		 * @returns {void}
		 */
		function countRequests( plugin, initial ) {
			const role = plugin.$role;

			let dependencies = plugin.$meta.dependencies || [];

			if ( !Array.isArray( dependencies ) ) {
				dependencies = dependencies ? [dependencies] : [];
			}

			weights[role] = ( weights[role] || 0 ) + 1;

			dependencies
				.forEach( function( dependency ) {
					if ( !index.hasOwnProperty( dependency ) ) {
						Log( `ERROR: ${dependency} is missing, but required by ${plugin.$name}` );

						throw new Error( "unmet plugin dependency: " + plugin.$name + " depends on missing " + dependency );
					}

					if ( initial && dependency === initial ) {
						Log( `ERROR: circular dependencies between plugins ${plugin.$name} and ${dependency}` );

						throw new Error( "circular dependency on plugin " + plugin.$name + " depending on " + dependency + " which is also depending on the former" );
					}

					// put more weight on this dependency's dependencies
					countRequests( handles[index[dependency]].api, initial || plugin.$role );
				} );
		}

		/**
		 * Maps provided list of role names into handles selecting plugin for
		 * filling either role.
		 *
		 * @throws TypeError on list containing invalid name of role
		 * @throws Error on missing plugin filling some selected role
		 * @param {string[]} roles lists roles claimed in current setup
		 * @param {string} context name of plugin or role claiming dependency on a role
		 * @returns {HitchyPluginHandle[]} descriptions of plugins
		 * @private
		 */
		function _getHandlesOfRoles( roles, context ) {
			const length = roles.length;
			const result = new Array( length );

			for ( let i = 0; i < length; i++ ) {
				const role = roles[i];

				if ( typeof role !== "string" || !role ) {
					throw new TypeError( `invalid dependency in ${context}: ${role}` );
				}

				const idx = index[role];
				if ( isNaN( idx ) ) {
					throw new Error( `missing dependency in ${context}: ${role}` );
				}

				result[i] = handles[idx];
			}

			return result;
		}
	}

	/**
	 * Injects all finally available plugins in runtime section of Hitchy API.
	 *
	 * @param {HitchyPluginHandle[]} plugins descriptions of plugins
	 * @returns {HitchyPluginHandle[]} forwarded descriptions of plugins
	 */
	function promoteAPIs( plugins ) {
		plugins.forEach( plugin => {
			that.plugins[plugin.api.$role] = plugin.api;
		} );

		return plugins;
	}
};


/**
 * @typedef {object} HitchyPluginHandle
 * @property {string} name name of plugin (according to filename)
 * @property {?string} staticRole desired role of plugin, defaults to its name, but
 *           may be aliased e.g. to serve as replacement of another plugin
 * @property {string} folder absolute filename of plugin's package.json
 * @property {HitchyPluginMeta} meta meta data of hitchy plugin read from its hitchy.json file
 * @property {HitchyPlugin} api API provided by loaded plugin
 */

/**
 * @typedef {function(this:HitchyAPI, options:HitchyOptions, handle:HitchyPluginHandle)} HitchyPluginIntegrator
 *
 * Describes function included with API exposed by a Hitchy plugin for
 * integrating it with Hitchy core.
 */

/**
 * @typedef {object} HitchyPlugin
 * @property {string} $name name of plugin
 * @property {string} $role desired role of plugin
 * @property {int} $index index of plugin in sequence of bootstrapping
 * @property {HitchyPluginMeta} $meta meta data as read from its hitchy.json
 * @property {?HitchyPluginIntegrator} configure qualifies configuration to suit needs of plugin
 * @property {?HitchyPluginIntegrator} initialize actually initializes plugin after all configuration has been qualified
 * @property {?HitchyPluginIntegrator} routing provides routes handled by plugin
 */
