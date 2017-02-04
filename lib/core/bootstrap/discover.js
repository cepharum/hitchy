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
const Log  = require( "debug" )( "bootstrap" );


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
		if ( !options.rootFolder ) {
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
			.then( sort )
			.then( load );
	}



	/**
	 * Reads package.json files of all detected hitchy extension candidates.
	 *
	 * @param {string[]} modulePathnames pathnames of hitchy extension candidates
	 * @returns {Promise.<HitchyComponentHandle[]>} promises package data of all candidates
	 */
	function readMetaData( modulePathnames ) {
		return Promise.all( modulePathnames.map( function( modulePathname ) {
			let file = {
				name: Path.basename( modulePathname ),
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

					if ( file.meta.name ) {
						file.name = file.meta.name;
					}

					resolve( file );
				} );
			} );
		} ) );
	}

	/**
	 * Drops all hitchy extension candidates not describing some hitchy extension
	 * actually.
	 *
	 * @param {HitchyComponentHandle[]} moduleHandles
	 * @returns {HitchyComponentHandle[]}
	 */
	function filter( moduleHandles ) {
		let read, write, handle,
		    length   = moduleHandles.length,
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
	 * Sorts extensions according to dependencies described in either extension.
	 *
	 * @param {HitchyComponentHandle[]} moduleHandles
	 * @return {HitchyComponentHandle[]}
	 */
	function sort( moduleHandles ) {
		let index   = {},
		    weights = {};

		moduleHandles
			.forEach( function( handle, i ) {
				let name = handle.name;

				if ( index.hasOwnProperty( name ) ) {
					throw new Error( "doubly defined hitchy component " + name );
				}

				index[name] = i;
			} );

		moduleHandles.forEach( ( handle, index ) => countRequests( handle ) );

		// finally sort all handles from most weight to least
		return moduleHandles
			.sort( function( left, right ) {
				// flip `left` and `right` if the latter has more weight
				return ( weights[right.name] || 0 ) - ( weights[left.name] || 0 );
			} );


		function countRequests( handle, initialName ) {
			let dependencies = handle.meta.dependencies || [];

			if ( !Array.isArray( dependencies ) ) {
				dependencies = [dependencies];
			}

			dependencies
				.forEach( function( dependencyName ) {
					if ( !index.hasOwnProperty( dependencyName ) ) {
						throw new Error( "unmet hitchy extension dependency: " + handle.name + " depends on missing " + dependencyName );
					}

					if ( initialName && dependencyName === initialName ) {
						throw new Error( "circular dependency on hitchy extension " + handle.name + " depending on " + dependencyName + " which is also depending on the former" );
					}

					weights[dependencyName]++;

					// recursively put more weight on current dependency's
					// dependencies
					countRequests( moduleHandles[index[dependencyName]], initialName || handle.name );
				} );
		}
	}

	/**
	 * Loads all extensions in order of provided extension handles.
	 *
	 * @param {HitchyComponentHandle[]} moduleHandles
	 * @return {Promise<HitchyComponent[]>}
	 */
	function load( moduleHandles ) {
		let queue = moduleHandles.slice( 0 );

		return new Promise( function( resolve, reject ) {
			loadNext();

			function loadNext() {
				let handle = queue.shift();
				if ( handle ) {
					Promise.resolve( require( handle.folder ).call( api, options ) )
						.then( function( api ) {
							api.$name = handle.meta;
							api.$meta = handle.meta;
							api.components[handle.name] = api;

							loadNext();
						}, function( cause ) {
							Log( "Loading module %s failed: %s", handle.name, cause );

							reject( new Error( "loading extension " + handle.name + " failed: " + String( cause.message || cause || "unknown error" ) ) );
						} );
				} else {
					resolve( moduleHandles );
				}
			}
		} );
	}
};



/**
 * @typedef {object} HitchyComponentHandle
 * @property {string} name name of component
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
 * @typedef {string} $name internally used name of component
 * @typedef {HitchyComponentMeta} $meta component's meta data as read from its hitchy.json
 * @typedef {?function(this:HitchyAPI, options:HitchyOptions, handle:HitchyComponentHandle)} configure qualifies configuration to suit needs of component
 * @typedef {?function(this:HitchyAPI, options:HitchyOptions, handle:HitchyComponentHandle)} initialize actually initializes component after all configuration has been qualified
 */
