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

		let _response;

		switch ( request.method ) {
			case "HEAD" :
				_response = requestContext.response = disableResponse( response );
				break;

			default :
				_response = response;
		}

		if ( !_response._originalEnd ) {
			_response._originalEnd = _response.end;

			_response.end = function( ...args ) {
				_response._originalEnd.apply( this, args );

				Log( "%s %s %s %dms", request.method, request.url, _response.statusCode, Math.round( Date.now() - requestContext.startTime ) );
			};
		}

		return requestContext;
	}

	/**
	 * Wraps provided ServerResponse in a proxy that is preventing actions meant
	 * to describe some actual response sent back.
	 *
	 * @note This method is adjusting provided response object.
	 *
	 * @param {ServerResponse} response response to be disabled
	 * @returns {ServerResponse} disabled response
	 */
	function disableResponse( response ) {
		const end = response.end;
		response.end = () => end.call( response );

		const setHeader = response.setHeader;
		response.setHeader = ( name, value ) => {
			if ( !/^\s*content-type\s*$/i.test( name ) ) {
				setHeader.call( response, name, value );
			}
		};

		const writeHead = response.writeHead;
		response.writeHead = ( code, text, headers ) => {
			const hasText = headers != null || !text || typeof text !== "object";
			const copy = filterHeader( hasText ? headers : text );

			return hasText ? writeHead.call( response, code, text, copy ) : writeHead.call( response, code, copy );
		};

		const set = response.set;
		response.set = ( name, value ) => {
			if ( name && typeof name === "object" ) {
				set.call( response, filterHeader( name ) );
			} else if ( !/^\s*content-type\s*$/i.test( name ) ) {
				set.call( response, name, value );
			}

			return response;
		};

		response.json = response.send = () => {
			end.call( response );
			return response;
		};

		return response;

		/**
		 * Creates shallow copy of provided response headers with properties
		 * describing content removed.
		 *
		 * @param {object} headers original set of response headers
		 * @returns {object} copy of provided response headers omitting certain fields
		 */
		function filterHeader( headers ) {
			if ( !headers ) {
				return headers;
			}

			const names = Object.keys( headers );
			const numNames = names.length;
			const copy = {};

			for ( let i = 0; i < numNames; i++ ) {
				const key = names[i];

				if ( !/^\s*content-type\s*$/i.test( key ) ) {
					copy[key] = headers[key];
				}
			}

			return copy;
		}
	}
};
