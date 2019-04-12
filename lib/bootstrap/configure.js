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

/**
 * Provides implementation for second stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function(modules:HitchyComponentHandle[]):Promise.<HitchyComponentHandle[]>}
 */
module.exports = function( options ) {
	const api = this;
	const Log = api.log( "hitchy:bootstrap" );

	return _bootstrapConfigure;


	function _bootstrapConfigure( handles ) {
		return api.utility.promise.each( handles, handle => {
			return _readConfigurationFiles( Path.resolve( handle.folder, "config" ), true );
		} )
			.then( () => _readConfigurationFiles( Path.resolve( options.projectFolder, "config" ), false ) )
			.then( () => api.utility.promise.each( handles, handle => {
				let fn = handle.api.configure;
				if ( typeof fn === "function" ) {
					return fn.call( api, options, handle );
				}

				// this module doesn't provide configure() -> skip
			} ) );
	}


	/**
	 * Reads all files with extension ".js" found in provided folder and injects
	 * their exported API into api.runtime.config.
	 *
	 * If any configuration file is exporting function instead of object this
	 * function is invoked according to the pattern used to load components etc.
	 * in hitchy expecting function to return object to be injected actually. On
	 * returning Promise injection is delayed until promise is resolved.
	 *
	 * @param {string} configFolder path name of folder containing files to be read
	 * @param {boolean} isExtension true if provided folder is part of some discovered extension
	 * @returns {Promise} promises completely read configuration
	 * @private
	 */
	function _readConfigurationFiles( configFolder, isExtension ) {
		return new Promise( ( resolve, reject ) => {
			// shallowly search for configuration files in related folder
			File.readdir( configFolder, ( error, entries ) => {
				if ( error ) {
					if ( error.code === "ENOENT" ) {
						// there is no configuration folder -> skip
						if ( !isExtension ) {
							Log( "missing configuration folder, thus using empty configuration" );
						}

						return resolve();
					}

					return reject( error );
				}


				// use simple tests to detect actual configuration files
				// (e.g. consider names of sub folders don't end with .js)
				const numEntries = entries.length;
				const filtered = new Array( numEntries );
				let write = 0;

				for ( let read = 0; read < numEntries; read++ ) {
					const name = entries[read];

					if ( name && name[0] !== "." && name.slice( -3 ) === ".js" ) {
						filtered[write++] = name.slice( 0, -3 );
					}
				}

				filtered.splice( write );


				// make sure any config/local.js is processed last
				let localIndex = filtered.indexOf( "local" );
				if ( localIndex > -1 ) {
					filtered.splice( localIndex, 1 );
					filtered.push( "local" );
				}


				api.utility.promise.each( filtered, name => {
					return api.loader( Path.resolve( configFolder, name ) )
						.then( config => {
							_.merge( api.runtime.config, config || {} );
						} );
				} )
					.then( resolve, reject );
			} )
		} );
	}
};
