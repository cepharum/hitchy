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
 * Provides router processing some current request using configured routes.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Function}
 */
module.exports = function( options ) {
	const api = this;

	/**
	 * Refers to logging facility named "debug".
	 *
	 * @type {function(msg:string,...data:*)}
	 */
	const Debug = api.log( "debug" );

	/**
	 * Shortcuts reference on promise utilities.
	 *
	 * @type {HitchyUtilityPromiseAPI}
	 */
	const PromiseUtil = api.utility.promise;

	/**
	 * Internally counts processed requests assigning unique numeric ID to every
	 * request this way.
	 *
	 * This "ID" is primarily used in logging requests.
	 *
	 * @type {number}
	 */
	let requestCounter = 0;

	/**
	 * Caches information on whether debugging is enabled or not.
	 *
	 * @type {boolean}
	 */
	const debug = options.debug;



	return _routerDispatch;



	/**
	 * Dispatches request according to configured routes.
	 *
	 * @param {HitchyRequestContext} requestContext
	 * @returns {Promise<HitchyRequestContext>}
	 */
	function _routerDispatch( requestContext ) {
		let { request, response } = requestContext,
			{ method, path } = request,
			{ policies, terminals } = api.router;

		request.id = String( "000000" + String( ++requestCounter, 16 ) ).slice( -8 );


		if ( debug ) {
			Debug( `${request.id}: routing ${method} ${path}` );
		}


		return PromiseUtil.each( [
			{
				label: "early policy",
				isPolicy: true,
				prefixedRoutes: policies.before.onMethod( method )
			},
			{
				label: "responder",
				isPolicy: false,
				prefixedRoutes: terminals.onMethod( method )
			},
			{
				label: "late policy",
				isPolicy: true,
				prefixedRoutes: policies.after.onMethod( method )
			},
		], _findMatchingRoutes )
			.then( () => requestContext )
			.catch( function( error ) {
				Debug( `${request.id}: routing failed: ${debug ? error.stack : error.message}` );

				throw error;
			} );


		/**
		 *
		 * @param {string} label
		 * @param {RoutesPerPrefix} prefixedRoutes
		 * @param {boolean} isPolicy
		 * @returns {Promise}
		 * @private
		 */
		function _findMatchingRoutes( { label, isPolicy, prefixedRoutes } ) {
			let matching, write = 0;


			/**
			 * step 1: find all routes actually patching current request
			 */
			if ( prefixedRoutes ) {
				// got some routes related this request's method
				let routes = prefixedRoutes.onPrefix( path );
				let length = routes && routes.length;

				if ( length ) {
					// got some routes matching this request's path

					if ( debug ) {
						Debug( `${request.id}: using prefix "${prefixedRoutes.getLongestMatchingPrefix( path )}" on processing ${label} routing` );
					}

					matching = new Array( length );
					write = 0;

					for ( let i = 0; i < length; i++ ) {
						let route = routes[i];

						if ( debug ) {
							Debug( `${request.id}: CHECKING ${label} route "${route.source}" using pattern ${route.pattern}` );
						}

						let match = route.pattern.exec( path );
						if ( match ) {
							matching[write++] = { label, isPolicy, route, match };

							if ( debug ) {
								Debug( `${request.id}: OBEYING ${label} route "${route.source}" handled by ${route.target}` );
							}

							if ( !isPolicy ) {
								// processing terminal routes we need only the
								// first matching one
								break;
							}
						}
					}
				}
			}


			/**
			 * step 2: process routes found matching request before
			 */
			if ( write > 0 ) {
				if ( debug ) {
					Debug( `${request.id}: matching ${write} ${label} route(s)` );
				}

				matching.splice( write, matching.length - write );

				return PromiseUtil.each( matching, _processMatchingRoute )
					.then( () => {
						if ( debug ) {
							Debug( `${request.id}: passed ${label} routing` );
						}
					} );
			}
		}

		/**
		 *
		 * @param {string} label
		 * @param {boolean} isPolicy
		 * @param {Route} route
		 * @param {RegExp} match
		 * @private
		 */
		function _processMatchingRoute( { label, isPolicy, route, match } ) {
			// collect parameters passed to handler according to current route
			let localParams = {};

			for ( let keys = route.parameters, keyIndex = 0, keyCount = keys.length; keyIndex < keyCount; keyIndex++ ) {
				let key   = keys[keyIndex];
				let value = match[keyIndex+1];

				if ( value !== undefined ) {
					localParams[key.name] = key.repeat ? value.split( key.delimiter ).filter( i => i !== undefined ) : value;
				}
			}

			for ( let source = request.params, keys = Object.keys( source || {} ), keyIndex = 0, keyCount = keys.length; keyIndex < keyCount; keyIndex++ ) {
				let key = keys[keyIndex];

				if ( !localParams.hasOwnProperty( key ) ) {
					localParams[key] = source[key];
				}
			}


			if ( debug ) {
				Debug( `${request.id}: MATCH: ${label} route "${route.source}" handled by ${route.target} w/ parameters %O`, localParams );
			}


			// invoke routing target
			let saved = request.params;
			request.params = localParams;

			if ( isPolicy ) {
				return new Promise( function( resolve, reject ) {
					let result = route.handler.apply( requestContext, [ request, response, function ( error ) {
						request.params = saved;
						error ? reject( error ) : resolve();
					} ].concat( route.args ) );

					if ( result instanceof Promise ) {
						result.then( () => {
							request.params = saved;
							resolve();
						}, error => {
							request.params = saved;
							reject( error )
						} );
					}
				} );
			}

			let result = route.handler.apply( requestContext, [ request, response ].concat( route.args ) );
			if ( result instanceof Promise ) {
				return result
					.then( function() {
						request.params = saved;
					}, function( cause ) {
						request.params = saved;
						throw cause;
					} );
			} else {
				request.params = saved;
			}
		}
	}
};
