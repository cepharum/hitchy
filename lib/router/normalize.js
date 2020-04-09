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
 * Injects functions into request description mostly to provide some assumed API.
 *
 * @this HitchyAPI
 * @returns {function(HitchyRequestContext):Promise<HitchyRequestContext>} promises extended request context
 */
module.exports = function() {
	const instantApiProperties = [
		{
			name: "path",
			injectResult: true,
		},
		{
			name: "query",
			injectResult: true,
		},
		{
			name: "body",
			apiName: "fetchBody",
			injectResult: true,
		},
		{
			header: "accept",
			name: "accept",
			injectResult: true,
			fallback: [],
		},
		{
			name: "is",
			injectResult: false,
		},
	];

	const deferredApiProperties = [];

	return _routerNormalize;


	/**
	 * Injects additional functions and information into provided request
	 * descriptor.
	 *
	 * @param {HitchyRequestContext} requestContext some request's descriptor (usually exposed as `req` in a request handler)
	 * @returns {Promise<HitchyRequestContext>} promises additional features injected into given request descriptor
	 */
	function _routerNormalize( requestContext ) {
		const request = requestContext.request;
		const { headers } = request;

		{
			// synchronously inject instantly available properties
			const props = instantApiProperties;
			const numProps = props.length;

			for ( let i = 0; i < numProps; i++ ) {
				const prop = props[i];
				const { header, name, apiName = name, fallback } = prop;

				if ( !( apiName in request ) ) {
					if ( !header || header in headers ) {
						let mixin = require( "./normalize/" + name );

						if ( typeof mixin === "function" ) {
							mixin = mixin.bind( requestContext );
						}

						request[apiName] = prop.injectResult ? mixin() : mixin;
					} else if ( Array.isArray( fallback ) ) {
						request[apiName] = fallback.slice();
					} else if ( fallback != null ) {
						request[apiName] = fallback;
					}
				}
			}
		}

		{
			// asynchronously inject properties that aren't available instantly
			const props = deferredApiProperties;
			const numProps = props.length;
			const loaders = new Array( numProps );
			let write = 0;

			for ( let i = 0; i < numProps; i++ ) {
				const prop = props[i];
				const { name, apiName = name } = prop;

				if ( !( apiName in request ) ) {
					( function( _name, _apiName, index, injectResult ) {
						loaders[index] = require( "./normalize/" + _name ).call( requestContext )
							.then( result => {
								request[_apiName] = injectResult && typeof result === "function" ? result() : result;
							} );
					} )( name, apiName, write++, prop.injectResult );
				}
			}

			loaders.splice( write );

			return Promise.all( loaders )
				.then( () => requestContext );
		}
	}
};
