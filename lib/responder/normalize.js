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
 * @param {HitchyOptions} options
 * @returns {function(HitchyRequestContext):HitchyRequestContext}
 */
module.exports = function( options ) {
	const api = this;

	const Log = api.log( "hitchy:request" );

	const handlerNames = [ "format", "json", "redirect", "send", "set", "status", "type" ];

	return _responderNormalize;


	/**
	 * Normalizes response to support some assumed API.
	 *
	 * @param {HitchyRequestContext} requestContext
	 * @returns HitchyRequestContext
	 */
	function _responderNormalize( requestContext ) {
		let response = requestContext.response,
		    names = handlerNames,
		    name, i, length;

		for ( i = 0, length = names.length; i < length; i++ ) {
			name = names[i];

			if ( !( name in response ) ) {
				let mixin = require( "./normalize/" + name );
				if ( typeof mixin === "function" ) {
					mixin = mixin.bind( requestContext );
				}

				response[name] = mixin;
			}
		}

		_injectLogger( requestContext );

		return requestContext;
	}

	function _injectLogger( requestContext ) {
		const req = requestContext.request;
		const res = requestContext.response;

		if ( !res._originalEnd ) {
			res._originalEnd = res.end;

			res.end = function() {
				res._originalEnd.apply( this, arguments );

				Log( "%s %s %s %dms", req.method, req.url, res.statusCode, Math.round( Date.now() - requestContext.startTime ) );
			};
		}
	}
};
