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

const FileUtils = require( "file-essentials" );


/**
 * Provides implementation of bootstrap stage gathering API elements to be
 * exposed.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(HitchyPluginHandle[]):Promise<HitchyPluginHandle[]>} function for collecting components per plugin
 */
module.exports = function( options ) {
	const that = this;
	const { utility: { promise, case: { kebabToPascal } } } = that;
	const Debug = that.log( "hitchy:debug" );

	return _bootstrapExpose;


	/**
	 * Collects components exposed by either discovered plugin.
	 *
	 * @param {HitchyPluginHandle[]} plugins descriptions of discovered plugins
	 * @returns {Promise<HitchyPluginHandle[]>} promises components of discovered plugins collected
	 * @private
	 */
	function _bootstrapExpose( plugins ) {
		return promise.each( plugins, plugin => {
			const fn = plugin.api.onExposing;
			if ( typeof fn === "function" ) {
				return fn.call( that, options, plugin );
			}

			// this plugin doesn't provide onExposing() -> skip
			return undefined;
		} )
			.then( _mergePluginElements )
			.then( _mergeApplicationElements )
			.then( () => promise.each( plugins, plugin => {
				const fn = plugin.api.onExposed;
				if ( typeof fn === "function" ) {
					return fn.call( that, options, plugin );
				}

				// this plugin doesn't provide onExposed() -> skip
				return undefined;
			} ) )
			.then( () => plugins );
	}

	/**
	 * Loads components provided by every discovered plugin and exposes them in
	 * either type's runtime section of Hitchy's API.
	 *
	 * @param {HitchyPluginHandle[]} plugins descriptions of discovered plugins
	 * @returns {Promise<HitchyPluginHandle[]>} promises components of plugins exposed
	 * @private
	 */
	function _mergePluginElements( plugins ) {
		return promise.each( plugins, plugin => _mergeElementsInFolder( Path.resolve( plugin.folder, "api" ), plugin ) );
	}

	/**
	 * Loads components found in current application and exposes them in runtime
	 * section of Hitchy's API.
	 *
	 * @returns {Promise} promises components of application exposed
	 * @private
	 */
	function _mergeApplicationElements() {
		return _mergeElementsInFolder( Path.resolve( options.projectFolder, "api" ) );
	}

	/**
	 * Loads components found in particular folder of a discovered plugin or
	 * current application and exposes them in runtime section of Hitchy's API.
	 *
	 * @param {string} folder pathname of folder containing components of a plugin or current application
	 * @param {?HitchyPluginHandle} pluginHandle handle of plugin, omitted when exposing components of application
	 * @returns {Promise} promises components of application exposed
	 * @private
	 */
	function _mergeElementsInFolder( folder, pluginHandle ) {
		const meta = pluginHandle ? pluginHandle.meta : that.meta;

		return loadComponents( meta, folder, "model", "models" )
			.then( () => loadComponents( meta, folder, "models", "models" ) )
			.then( () => loadComponents( meta, folder, "controller", "controllers" ) )
			.then( () => loadComponents( meta, folder, "controllers", "controllers" ) )
			.then( () => loadComponents( meta, folder, "policy", "policies" ) )
			.then( () => loadComponents( meta, folder, "policies", "policies" ) )
			.then( () => loadComponents( meta, folder, "service", "services" ) )
			.then( () => loadComponents( meta, folder, "services", "services" ) );

		/**
		 * Loads components in a particular folder exposing either component's
		 * API in a selected slot of runtime section of Hitchy's API.
		 *
		 * @param {object} config configuration of plugin/application regarding exposure of components
		 * @param {string} pathname pathname of base folder containing subfolders per kind of components
		 * @param {string} subFolder subfolder in base folder to be processed this time
		 * @param {string} slotName name of collection in runtime section of Hitchy's API for exposing found plugins
		 * @returns {Promise} promises having loaded and exposed all components in selected subfolder
		 * @private
		 */
		function loadComponents( config, pathname, subFolder, slotName ) {
			const slot = that.runtime[slotName];

			return FileUtils.find( Path.resolve( pathname, subFolder ), {
				filter( relName, absName, stats ) {
					if ( absName.charAt( absName.lastIndexOf( Path.sep ) + 1 ) === "." ) {
						return false;
					}

					if ( stats.isDirectory() ) {
						return config.deepComponents !== false;
					}

					return stats.isFile() && relName.endsWith( ".js" );
				},
				converter( relName, absName ) {
					return relName.endsWith( ".js" ) ? {
						relative: relName.replace( /\.js$/, "" ),
						absolute: absName,
					} : undefined;
				}
			} )
				.then( files => {
					const { sep } = Path;

					// sort all found modules alphabetically while keeping
					// depth-last result as provided by FileUtils.find()
					files.sort( ( l, r ) => {
						const left = l.relative;
						const right = r.relative;

						// find longest common prefix of path names
						let split = -1;

						for ( let candidate = left.indexOf( sep ); candidate > -1; candidate = left.indexOf( sep, candidate + 1 ) ) {
							const prefix = left.substring( 0, split );
							if ( right.startsWith( prefix ) && right.charAt( split ) === sep ) {
								split = candidate;
							} else {
								break;
							}
						}

						// get path names relative to longest matching prefix
						const lPath = left.substring( split + 1 );
						const rPath = right.substring( split + 1 );

						const lSplit = lPath.indexOf( sep );
						const rSplit = rPath.indexOf( sep );

						if ( lSplit > -1 ) {
							if ( rSplit > -1 ) {
								return lPath.substring( 0, lSplit ).localeCompare( rPath.substring( 0, rSplit ) );
							}

							return 1;
						}

						if ( rSplit > -1 ) {
							return -1;
						}

						return lPath.localeCompare( rPath );
					} );

					return promise.each( files, ( { relative, absolute } ) => {
						const segments = relative.split( Path.sep );
						const numSegments = segments.length;

						for ( let i = 0; i < numSegments; i++ ) {
							segments[i] = segments[i].replace( /^\d+[_-]?/, "" );
						}

						if ( config.appendFolders !== false ) {
							segments.reverse();
						}

						const baseName = kebabToPascal( segments.join( "-" ) );
						const instantApi = require( absolute );

						if ( typeof instantApi === "function" && instantApi.useCMP !== false ) {
							return Promise.resolve( instantApi.call( that, options, slot[baseName] || {} ) )
								.then( deferredApi => {
									that.utility.object.merge( slot, { [baseName]: deferredApi } );
								} );
						}

						Debug( `exposing ${slotName} component ${baseName} for ${pluginHandle ? "plugin " + pluginHandle.name : "application"}` );

						that.utility.object.merge( slot, { [baseName]: instantApi } );

						return undefined;
					} );
				} );
		}
	}
};
