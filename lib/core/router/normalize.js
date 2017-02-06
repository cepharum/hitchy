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

/**
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function(HitchyRequestContext):Promise<HitchyRequestContext>}
 */
module.exports = function( options ) {
	let api = this;

	let handlerNames = [ "=path", "=query" ];
	let delayedNames = [ "body" ];

	return _routerNormalize;


	/**
	 * Normalizes response to support some assumed API.
	 *
	 * @param {HitchyRequestContext} requestContext
	 * @returns Promise<HitchyRequestContext>
	 */
	function _routerNormalize( requestContext ) {
		let request = requestContext.request,
		    names   = handlerNames,
		    name, i, length, getValue;

		// first try to inejct as much stuff as possible synchronously
		// (to keep code from wasting time with handling unnecessary promises)
		for ( i = 0, length = names.length; i < length; i++ ) {
			name = names[i];

			getValue = ( name[0] == "=" );
			if ( getValue ) {
				name = name.slice( 1 );
			}

			if ( !( name in request ) ) {
				let mixin = require( "./normalize/" + name );
				if ( typeof mixin === "function" ) {
					mixin = mixin.bind( requestContext );
				}

				request[name] = getValue ? mixin() : mixin;
			}
		}

		// second inject more mixins requiring asynchronous processing now
		return api.utility.promise.each( delayedNames, function( name ) {
			if ( !( name in request ) ) {
				return require( "./normalize/" + name ).call( requestContext )
					.then( function( result ) {
						request[name] = result;
					} );
			}
		} )
			.then( function() {
				return requestContext;
			} );
	}
};
