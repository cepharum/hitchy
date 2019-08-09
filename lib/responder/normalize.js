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

/**
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(HitchyRequestContext):HitchyRequestContext} function extending features of response manager
 */
module.exports = function( options ) { // eslint-disable-line no-unused-vars
	const that = this;
	const Log = that.log( "hitchy:request" );
	const handlerNames = [ "format", "json", "redirect", "send", "set", "status", "type" ];

	return _responderNormalize;


	/**
	 * Extends response manager to provide some assumed API at least.
	 *
	 * @param {HitchyRequestContext} requestContext context of request to be handled
	 * @returns {HitchyRequestContext} provided request context with contained response manager extended
	 */
	function _responderNormalize( requestContext ) {
		const { request, response } = requestContext;
		const names = handlerNames;
		const length = names.length;

		for ( let i = 0; i < length; i++ ) {
			const name = names[i];

			if ( !( name in response ) ) {
				let mixin = require( "./normalize/" + name );
				if ( typeof mixin === "function" ) {
					mixin = mixin.bind( requestContext );
				}

				response[name] = mixin;
			}
		}

		if ( !response._originalEnd ) {
			response._originalEnd = response.end;

			response.end = function( ...args ) {
				response._originalEnd.apply( this, args );

				Log( "%s %s %s %dms", request.method, request.url, response.statusCode, Math.round( Date.now() - requestContext.startTime ) );
			};
		}

		return requestContext;
	}
};
