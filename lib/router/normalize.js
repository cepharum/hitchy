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
	const api = this;

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
	];

	const deferredApiProperties = [];

	return _routerNormalize;


	/**
	 * Normalizes response to support some assumed API.
	 *
	 * @param {HitchyRequestContext} requestContext
	 * @returns Promise<HitchyRequestContext>
	 */
	function _routerNormalize( requestContext ) {
		const request = requestContext.request;

		{
			// synchronously inject instantly available properties
			const props = instantApiProperties;
			const numProps = props.length;

			for ( let i = 0; i < numProps; i++ ) {
				const prop = props[i];
				const { name, apiName = name } = prop;

				if ( !( apiName in request ) ) {
					let mixin = require( "./normalize/" + name );

					if ( typeof mixin === "function" ) {
						mixin = mixin.bind( requestContext );
					}

					request[apiName] = prop.injectResult ? mixin() : mixin;
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
					( function( name, apiName, index, injectResult ) {
						loaders[index] = require( "./normalize/" + name ).call( requestContext )
							.then( result => {
								request[apiName] = injectResult && typeof result === "function" ? result() : result;
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
