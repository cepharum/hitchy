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

const Debug = require( "debug" )( "debug" );

/**
 * Provides router processing some current request using configured routes.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Function}
 */
module.exports = function( options ) {
	let api = this;

	return _routerDispatch;


	/**
	 * Dispatches request according to configured routes.
	 *
	 * @param {HitchyRequestContext} requestContext
	 * @returns {Promise<HitchyRequestContext>}
	 */
	function _routerDispatch( requestContext ) {
		let request = requestContext.request,
		    method  = request.method,
		    path    = request.path,
		    routes  = api.router.map[method],
		    pindex, plength, pgroup, prefix,
		    rindex, rlength, route, match,
		    kindex, klength, keys;

		Debug( "routing %s %s", method, path );

		if ( routes ) {
			for ( pindex = 0, plength = routes.length; pindex < plength; pindex++ ) {
				pgroup = routes[pindex];

				prefix = pgroup[0].prefix;
				if ( prefix === path.slice( 0, prefix.length ) ) {
					for ( rindex = 0, rlength = pgroup.length; rindex < rlength; rindex++ ) {
						route = pgroup[rindex];

						match = route.pattern.exec( path );
						if ( match ) {
							let named = {};

							for ( keys = route.keys, kindex = 0, klength = keys.length; kindex < klength; kindex++ ) {
								named[keys[kindex]] = match[kindex+1];
							}

							request.params = named;

							return Promise.resolve( route.target.call( requestContext, request, requestContext.response ) )
								.then( function() {
									return requestContext;
								} );
						}
					}
				}
			}
		}

		return Promise.resolve( requestContext );
	}
};
