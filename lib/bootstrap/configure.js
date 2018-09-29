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
		return _readConfigurationFiles()
			.then( function() {
				return api.utility.promise.each( handles, function( handle ) {
					let fn = handle.api.configure;
					if ( typeof fn === "function" ) {
						return fn.call( api, options, handle );
					}

					// this module doesn't provide configure() -> skip
				} );
			} );
	}


	/**
	 * Reads all files found in <project>/config with extension ".js" and
	 * injects their exported API into api.runtime.config using name of file
	 * (excl. its path and extension).
	 *
	 * If any configuration file is exporting function instead of object this
	 * function is invoked according to the pattern used to load components etc.
	 * in hitchy expecting function to return object to be injected actually. On
	 * returning Promise injection is delayed until promise is resolved.
	 *
	 * @returns {Promise} promises completely read configuration
	 * @private
	 */
	function _readConfigurationFiles() {
		return new Promise( function( resolve, reject ) {
			let configFolder = Path.resolve( options.projectFolder, "config" );

			// shallowly search for configuration files in related folder
			File.readdir( configFolder, function( error, entries ) {
				if ( error ) {
					if ( error.code === "ENOENT" ) {
						// there is no configuration folder -> skip
						Log( "missing configuration folder, thus using empty configuration" );
						return resolve();
					}

					return reject( error );
				}

				// use simple tests to detect actual configuration files
				// (e.g. consider names of sub folders don't end with .js)
				entries = entries
					.filter( name => name && name[0] !== "." && name.slice( -3 ) === ".js" )
					.map( name => name.slice( 0, -3 ) );

				// make sure any config/local.js is processed last
				let localIndex = entries.indexOf( "local" );
				if ( localIndex > -1 ) {
					entries.splice( localIndex, 1 );
					entries.push( "local" );
				}

				api.utility.promise.each( entries, function( entry ) {
					let name = Path.basename( entry );

					return api.loader( Path.resolve( configFolder, entry ) )
						.then( config => _.assign( api.runtime.config, config || {} ) );
				} )
					.then( resolve, reject );
			} )
		} );
	}
};
