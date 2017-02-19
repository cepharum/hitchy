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

const File = require( "fs" );
const Path = require( "path" );

const _ = require( "lodash" );

const Log = require( "debug" )( "bootstrap" );


/**
 * Provides implementation for first stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function():Promise.<HitchyComponentHandle[]>}
 */
module.exports = function( options ) {
	let api = this;

	return _bootstrapDiscover;


	/**
	 * Discovers all components distributed with hitchy framework as well as
	 * installed as npm packages.
	 *
	 * @returns {Promise.<HitchyComponentHandle[]>}
	 * @private
	 */
	function _bootstrapDiscover() {
		if ( !options.projectFolder ) {
			throw new Error( "missing information on application root folder" );
		}

		return Promise.all( [
			require( "./discover/core" ).call( api, options )(),
			require( "./discover/extensions" ).call( api, options )(),
		] )
			.then( function( [core, extensions] ) {
				let combined = ( core || [] ).concat( extensions || [] );

				return readMetaData( combined );
			} )
			.then( filter )
			.then( load )
			.then( dropNoRole )
			.then( sort )
			.then( integrate )
	}

	/**
	 * Reads package.json files of all detected hitchy component candidates.
	 *
	 * @param {string[]} modulePathnames pathnames of hitchy component candidates
	 * @returns {Promise.<HitchyComponentHandle[]>} promises package data of all candidates
	 */
	function readMetaData( modulePathnames ) {
		return Promise.all( modulePathnames.map( function( modulePathname ) {
			let name = Path.basename( modulePathname ),
				file = {
					name: name,
					role: name,
					folder: modulePathname,
					meta: {}
				};

			return new Promise( function( resolve ) {
				File.readFile( Path.resolve( file.folder, "hitchy.json" ), function( error, content ) {
					if ( error ) {
						switch ( error.code ) {
							case "ENOENT" :
								break;

							default :
								Log( "failed reading %s", file.folder );
						}
					} else {
						try {
							file.meta = JSON.parse( content.toString( "utf8" ) );
							if ( file.meta && typeof file.meta === "object" ) {
								file.meta.$valid = true;
							} else {
								file.meta = {};
							}
						} catch ( e ) {
							Log( "failed parsing %s", file.folder );
						}
					}

					if ( file.meta.role ) {
						file.role = file.meta.role;
					}

					resolve( file );
				} );
			} );
		} ) );
	}

	/**
	 * Drops all hitchy component candidates not describing some actual hitchy
	 * component obviously.
	 *
	 * @param {HitchyComponentHandle[]} moduleHandles
	 * @returns {HitchyComponentHandle[]}
	 */
	function filter( moduleHandles ) {
		let read, write, handle,
			length = moduleHandles.length,
			filtered = new Array( length );

		for ( read = write = 0; read < length; read++ ) {
			handle = moduleHandles[read];

			if ( handle.meta.$valid ) {
				filtered[write++] = handle;
			}
		}

		filtered.splice( write, length - write );

		return filtered;
	}

	/**
	 * Loads all components in order of provided component handles.
	 *
	 * Achievements:
	 *  * Loads all discovered modules.
	 *  * Fetches API of either module.
	 *  * Qualifies meta data and requested role per module.
	 *  * Detects module claiming to fill the same role.
	 *
	 * @param {HitchyComponentHandle[]} handles
	 * @return {Promise<HitchyComponentHandle[]>}
	 */
	function load( handles ) {
		let allLoadedComponentsByName = {};

		handles.forEach( function( handle ) {
			let name = handle.name;
			if ( allLoadedComponentsByName.hasOwnProperty( name ) ) {
				Log( `double discovery of hitchy component ${name}` );
			}

			allLoadedComponentsByName[name] = handle;
		} );

		return new Promise( function( resolve, reject ) {
			_loadModule( 0, handles.length );


			function _loadModule( nextIndex, count ) {
				if ( nextIndex >= count ) {
					resolve( handles );
					return;
				}


				// load next component in list
				let handle = handles[nextIndex];


				let loaded = _tryLoading( handle );
				if ( loaded instanceof Error ) {
					_fail( loaded );
				} else if ( loaded instanceof Promise ) {
					loaded.then( _collect, _fail );
				} else {
					_collect( loaded );
				}


				function _collect( api ) {
					// inject meta information qualified by obeying extra info
					// provided by component's code providing API itself
					api.$meta = _.extend( handle.meta, api.$meta || {} );

					// inject name of component
					api.$name = handle.name;

					// manage component's role
					if ( api.$role ) {
						// module claims to fill particular role explicitly
						// -> revoke this role from any other module
						let role = api.$role;

						handles.forEach( function( handle ) {
							if ( handle.role === role ) {
								if ( role === handle.api.$role ) {
									throw new Error( "multiple components claim to provide role ${role}: was ${handle.name} before, is ${api.$name} now" );
								}

								Log( `revoking role ${role} from ${handle.name} for using static claim, only` );
								handle.role = null;
							}
						} );

						// mark current component to fill role by dynamic claim
						handle.role = api.$role;
					} else {
						api.$role = handle.role;
					}


					// track reference on component's API in handle as well
					handle.api = api;

					// start loading next component in list (w/o wasting stack frames)
					setImmediate( _loadModule, nextIndex + 1, count );
				}

				function _fail( error ) {
					// TODO add support for optionally keeping hitchy bootstrapping any other component (by invoking setTimeout() above instead of reject)
					Log( "Loading module %s failed: %s", handle.name, error );

					reject( new Error( `loading component ${handle.name} failed: ${String( error.message || error || "unknown error")}` ) );
				}
			}

			function _tryLoading( handle ) {
				try {
					return require( handle.folder ).call( api, options, allLoadedComponentsByName, handle );
				} catch ( exception ) {
					return exception;
				}
			}
		} )
			.then( function( handles ) {
				return api.utility.promise.each( handles, function( handle ) {
					if ( handle.role && typeof handle.api.onDiscovered === "function" ) {
						return handle.api.onDiscovered.call( api, options, allLoadedComponentsByName, handle );
					}
				} );
			} );
	}

	/**
	 * Removes all list components with handle not selecting role anymore.
	 *
	 * @param {HitchyComponentHandle[]} handles
	 * @returns {HitchyComponentHandle[]}
	 */
	function dropNoRole( handles ) {
		return handles.filter( handle => handle && handle.role );
	}

	/**
	 * Sorts components according to dependencies provided by either component.
	 *
	 * @param {HitchyComponentHandle[]} handles
	 * @return {HitchyComponentHandle[]}
	 */
	function sort( handles ) {
		let index   = {},
			weights = {};


		// create map for addressing any API in provided list by its name
		handles.forEach( ( handle, i ) => {
			let role = handle.role;

			if ( index.hasOwnProperty( role ) ) {
				let error = new Error( "multiple components are promoting same role: " + role );

				Log( error.message );

				throw error;
			}

			index[role] = i;
		} );

		// recursively count dependencies of every loaded component
		handles.forEach( handle => countRequests( handle.api ) );

		// finally sort all handles from most weight to least
		return handles
			.sort( ( left, right ) => ( weights[right.role] || 0 ) - ( weights[left.role] || 0 ) );


		/**
		 * Counts immediate and mediate dependencies of a given component.
		 *
		 * @param {HitchyComponent} component
		 * @param {string=} initial role of dependency counted before (used to
		 *        detect circular dependencies)
		 */
		function countRequests( component, initial ) {
			let dependencies = component.$meta.dependencies || [];

			if ( !Array.isArray( dependencies ) ) {
				dependencies = dependencies ? [dependencies] : [];
			}

			dependencies
				.forEach( function( dependency ) {
					if ( !index.hasOwnProperty( dependency ) ) {
						Log( `ERROR: ${dependency} is missing, but required by ${component.$name}` );

						throw new Error( "unmet hitchy component dependency: " + component.$name + " depends on missing " + dependency );
					}

					if ( initial && dependency === initial ) {
						Log( `ERROR: circular dependencies between components ${component.$name} and ${dependency}` );

						throw new Error( "circular dependency on hitchy component " + component.$name + " depending on " + dependency + " which is also depending on the former" );
					}

					weights[dependency]++;

					// put even more weight on this dependency's dependencies
					countRequests( handles[index[dependency]].api, initial || component.role );
				} );
		}
	}

	/**
	 * Injects all components still filling a role into runtime environment.
	 *
	 * @params {HitchyComponentHandle[]} handles
	 * @returns {HitchyComponentHandle[]}
	 */
	function integrate( handles ) {
		handles.forEach( handle => {
			api.components[handle.role] = handle.api;
		} );

		return handles;
	}
};


/**
 * @typedef {object} HitchyComponentHandle
 * @property {string} name name of component (according to filename)
 * @property {?string} role desired role of component, defaults to its name, but
 *           may be aliased e.g. to serve as replacement of another component
 * @property {string} folder absolute filename of component module's package.json
 * @property {HitchyComponentMeta} meta meta data of hitchy component read from hitchy.json
 * @property {object} api API provided by loaded component
 */

/**
 * @typedef {object} HitchyComponentMeta
 * @property {boolean} $valid set true on discovering module
 * @property {?string} name name of component
 * @property {?string[]} dependencies names of components this one depends on
 */

/**
 * @typedef {object} HitchyComponent
 * @property {string} $name name of component
 * @property {string} $role desired role of component
 * @property {HitchyComponentMeta} $meta meta data as read from its hitchy.json
 * @property {?function(this:HitchyAPI, options:HitchyOptions, handle:HitchyComponentHandle)} configure qualifies configuration to suit needs of component
 * @property {?function(this:HitchyAPI, options:HitchyOptions, handle:HitchyComponentHandle)} initialize actually initializes component after all configuration has been qualified
 * @property {?function(this:HitchyAPI, options:HitchyOptions, handle:HitchyComponentHandle)} routing provides routes handled by component
 */
