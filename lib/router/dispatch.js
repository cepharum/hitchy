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

const PromiseUtils = require( "promise-essentials" );
const { regexpToFunction: matcher } = require( "path-to-regexp" );


/**
 * Provides router processing some current request using configured routes.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(HitchyRequestContext):Promise} function promising described request being dispatched and handled
 */
module.exports = function( options ) {
	const that = this;

	/**
	 * Refers to logging facility named "debug".
	 *
	 * @type {function(msg:string,...data:*)}
	 */
	const logDebug = that.log( "hitchy:router:debug" );

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
	 * @param {HitchyRequestContext} requestContext description of current request's context
	 * @returns {Promise<HitchyRequestContext>} promises request dispatched and handled
	 */
	function _routerDispatch( requestContext ) {
		const { request, response } = requestContext,
			{ method, path } = request,
			{ policies, terminals } = that.router;

		request.id = String( "000000" + String( ++requestCounter, 16 ) ).slice( -8 );
		request.context = requestContext;
		request.hitchy = requestContext.api;


		if ( debug ) {
			logDebug( `${request.id}: routing ${method} ${path}` );
		}


		return PromiseUtils.each( [
			{
				label: "early policy",
				isPolicy: true,
				late: false,
				prefixedRoutes: policies.before.onMethod( method )
			},
			{
				label: "responder",
				isPolicy: false,
				late: false,
				prefixedRoutes: terminals.onMethod( method )
			},
			{
				label: "late policy",
				isPolicy: true,
				late: true,
				prefixedRoutes: policies.after.onMethod( method )
			},
		], _findMatchingRoutes )
			.then( () => requestContext )
			.catch( error => {
				logDebug( `${request.id}: routing failed: ${error.statusCode ? error.message : error.stack}` );

				throw error;
			} );


		/**
		 * Looks up routing stage for matching route(s).
		 *
		 * @param {string} label label of routing stage
		 * @param {boolean} isPolicy indicates whether set of routes describes policy routes instead of terminal ones
		 * @param {boolean} late indicates whether routes belong to late processing or not
		 * @param {RoutesPerPrefix} prefixedRoutes set of defined routes to be tested for matching request
		 * @returns {Promise|undefined} promises having processed some matching routes, undefined if there are no matching routes in current stage
		 * @private
		 */
		function _findMatchingRoutes( { label, isPolicy, late, prefixedRoutes } ) {
			let matching, write = 0;


			/**
			 * step 1: find all routes actually patching current request
			 */
			if ( prefixedRoutes ) {
				// got some routes related this request's method
				const routes = prefixedRoutes.onPrefix( path );
				const length = routes.length;

				if ( length > 0 ) {
					// got some routes matching this request's path

					if ( debug ) {
						logDebug( `${request.id}: using prefix "${prefixedRoutes.getLongestMatchingPrefix( path )}" on processing ${label} routing` );
					}

					matching = new Array( length );
					write = 0;

					for ( let i = 0; i < length; i++ ) {
						const route = routes[i];

						if ( debug ) {
							logDebug( `${request.id}: CHECKING ${label} route "${route.source}" using pattern ${route.pattern}` );
						}

						const match = matcher( route.pattern, route.parameters, { decode: decodeURIComponent } )( path );
						if ( match ) {
							matching[write++] = {
								label,
								isPolicy,
								late,
								route,
								match
							};

							if ( debug ) {
								logDebug( `${request.id}: OBEYING ${label} route "${route.source}" handled by ${String( route.target ).replace( /\s+/g, " " ).replace( /^(.{120}).+$/, "$1..." )}` );
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
					logDebug( `${request.id}: matching ${write} ${label} route(s)` );
				}

				matching.splice( write, matching.length - write );

				return PromiseUtils.each( matching, _processMatchingRoute )
					.then( () => {
						if ( debug ) {
							logDebug( `${request.id}: passed ${label} routing` );
						}
					} );
			}

			return undefined;
		}

		/**
		 * Invokes single matching route.
		 *
		 * @param {string} label human-readable label of routing stage this route belongs to
		 * @param {boolean} isPolicy true if current route is a policy
		 * @param {boolean} late indicates whether routes belong to late processing or not
		 * @param {Route} route route to be invoked
		 * @param {object} match result of matching some pattern on current request
		 * @returns {Promise|undefined} promises end of delaying request handler or undefined if handler finished synchronously
		 * @private
		 */
		function _processMatchingRoute( { label, isPolicy, late, route, match } ) {
			// collect parameters passed to handler according to current route
			const localParams = match.params;
			const hasProperty = {}.hasOwnProperty;

			for ( let source = request.params, names = Object.keys( source || {} ), index = 0, max = names.length; index < max; index++ ) {
				const name = names[index];

				if ( !hasProperty.call( localParams, name ) ) {
					localParams[name] = source[name];
				}
			}

			if ( debug ) {
				logDebug( `${request.id}: MATCH: ${label} route "${route.source}" handled by ${String( route.target ).replace( /\s+/g, " " ).replace( /^(.{120}).+$/, "$1..." )} w/ parameters %j`, localParams );
			}


			// wrap proxy around request object for injecting some route-specific properties
			const proxy = new Proxy( request, {
				get: ( target, prop ) => {
					switch ( prop ) {
						case "params" :
							return localParams;

						case "api" :
							return target[prop] || that;

						default :
							return target[prop];
					}
				}
			} );

			if ( isPolicy ) {
				if ( late ) {
					requestContext.consumed.byPolicy = true;
				}

				return new Promise( ( resolve, reject ) => {
					const result = route.handler.call( requestContext, proxy, response, error => {
						if ( error ) {
							reject( error );
						} else {
							resolve();
						}
					}, ...route.args );

					if ( result instanceof Promise ) {
						result.then( resolve ).catch( reject );
					}
				} );
			}

			requestContext.consumed.byTerminal = true;

			const result = route.handler.call( requestContext, proxy, response, ...route.args );
			if ( result instanceof Promise ) {
				return result;
			}

			return undefined;
		}
	}
};
