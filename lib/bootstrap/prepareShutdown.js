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

const PromiseUtils = require( "promise-essentials" );

const { cmp } = require( "../../tools/library" );


/**
 * Provides implementation for shutting down hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(HitchyPluginHandle[]):Promise<HitchyPluginHandle[]>} factory for shutdown function
 */
module.exports = function( options ) {
	const api = this;

	const logDebug = api.log( "hitchy:bootstrap:debug" );
	const logError = api.log( "hitchy:bootstrap:error" );

	return _bootstrapPrepareShutdown;

	/**
	 * Creates function suitable for gracefully shutting all discovered plugins
	 * by calling either one's shutdown function.
	 *
	 * @param {HitchyPluginHandle[]} plugins descriptions of discovered plugins
	 * @returns {function():Promise} function shutting down all discovered plugins
	 * @private
	 */
	function _bootstrapPrepareShutdown( plugins ) {
		const teardownFile = Path.resolve( options.projectFolder, "shutdown.js" );
		let shuttingDown = null;

		return _bootstrapShutdown;

		/**
		 * Triggers shutdown of current Hitchy-based application.
		 *
		 * @return {Promise<*>} promises Hitchy-based application shut down
		 * @private
		 */
		function _bootstrapShutdown() {
			if ( !shuttingDown ) {
				logDebug( "entering shutdown stage" );

				shuttingDown = api.utility.file.stat( teardownFile )
					.catch( error => {
						if ( error.code === "ENOENT" ) {
							return undefined;
						}

						throw error;
					} )
					.then( info => {
						if ( info && info.isFile() ) {
							logDebug( "shutting down application code" );

							return cmp( api, options, teardownFile );
						}

						return undefined;
					} )
					.then( () => PromiseUtils.each( plugins.reverse(), handle => {
						const fn = handle.api.shutdown;
						if ( typeof fn === "function" ) {
							logDebug( "shutting down plugin %s", handle.name );

							return fn.call( api, options, handle );
						}

						// this plugin doesn't provide shutdown() -> skip
						return undefined;
					} ) )
					.then( () => {
						logDebug( "shutdown complete" );

						api.emit( "close" );
					} )
					.catch( error => {
						logError( "shutdown failed: %s", error.stack );

						api.emit( "error", error );

						throw error;
					} );
			}

			return shuttingDown;
		}
	}
};
