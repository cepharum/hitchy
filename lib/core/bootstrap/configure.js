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
 * Provides implementation for second stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function(modules:HitchyComponentHandle[]):Promise.<HitchyComponentHandle[]>}
 */
module.exports = function( options ) {
	let api = this;

	return _bootstrapConfigure;


	function _bootstrapConfigure( modules ) {
		let each = api.utility.promise.each;

		// merge all files in <project>/config in HitchyAPI.config
		return new Promise( function( resolve, reject ) {
			let configFolder = Path.resolve( options.rootFolder, "config" );

			File.readdir( configFolder, function( error, entries ) {
				if ( error ) {
					if ( error.code === "ENOENT" ) {
						// there is no configuration folder -> skip
						Log( "missing configuration folder, thus using empty configuration" );
						return resolve();
					}

					return reject( error );
				}

				entries = entries.filter( name => name && name[0] !== "." && name.slice( -3 ) == ".js" );

				each( entries, function( entry ) {
					let name   = Path.basename( entry );
					let module = require( Path.resolve( configFolder, entry ) );

					if ( typeof module === "function" ) {
						return Promise.resolve( module.call( api, options ) )
							.then( function( config ) {
								api.config[name] = config || {};
							} );
					}

					api.config[name] = module || {};
				} )
					.then( resolve, reject );
			} )
		} )
			.then( function() {
				// invoke every component's configure() so it might adjust
				// merged configuration as desired
				return each( modules, function( handle ) {
					let fn = handle.api.configure;
					if ( typeof fn === "function" ) {
						return fn.call( api, options, handle );
					}

					// this module doesn't provide configure() -> skip
				} );
			} );
	}
};
