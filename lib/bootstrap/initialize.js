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

const { cmp } = require( "../../tools/library" );


/**
 * Provides implementation for third stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(HitchyPluginHandle[]):Promise<HitchyPluginHandle[]>} function initializing every discovered plugin's API
 */
module.exports = function( options ) {
	const that = this;

	return _bootstrapInitialize;

	/**
	 * Invokes either discovered plugin's optionally provided function for
	 * initializing either plugin's API.
	 *
	 * @param {HitchyPluginHandle[]} plugins descriptions of discovered plugins
	 * @returns {Promise<HitchyPluginHandle[]>} promises initialization of every discovered plugin's API
	 * @private
	 */
	function _bootstrapInitialize( plugins ) {
		const setupFile = Path.resolve( options.projectFolder, "initialize.js" );

		return that.utility.promise.each( plugins, handle => {
			const fn = handle.api.initialize;
			if ( typeof fn === "function" ) {
				return fn.call( that, options, handle );
			}

			// this plugin doesn't provide initialize() -> skip
			return undefined;
		} )
			.then( () => that.utility.file.stat( setupFile ) )
			.catch( error => {
				if ( error.code === "ENOENT" ) {
					return undefined;
				}

				throw error;
			} )
			.then( info => ( info && info.isFile() ? cmp( that, options, setupFile ) : undefined ) )
			.then( () => plugins );
	}
};
