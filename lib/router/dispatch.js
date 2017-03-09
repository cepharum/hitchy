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
	 * Implements policy-based routing of incoming requests.
	 *
	 * @type {function(this:HitchyAPI, options:HitchyOptions, context:HitchyRequestContext, specificRoutes:HitchyRouteSets, allRoutes:HitchyRouteSets):Promise}
	 */
	const PolicyDispatcher = require( "./dispatch/policies" );

	/**
	 * Implements controller-based routing of incoming requests.
	 *
	 * @type {function(this:HitchyAPI, options:HitchyOptions, context:HitchyRequestContext, specificRoutes:HitchyRouteSets, allRoutes:HitchyRouteSets):Promise}
	 */
	const RoutingDispatcher = require( "./dispatch/responder" );

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
		let { request } = requestContext,
			{ method, path } = request,
			{ policies, routes } = api.router,
			dispatch;

		request.id = String( "000000" + String( ++requestCounter, 16 ) ).slice( -8 );


		if ( debug ) {
			Debug( `${request.id}: routing ${method} ${path}` );
		}

		if ( !policies.hasOwnProperty( method ) && !policies.hasOwnProperty( "*" ) ) {
			// there are no policy -> don't waste time
			dispatch = RoutingDispatcher.call( api, options, requestContext, routes[method] || [], routes["*"] || [] );
		} else {
			// apply routing for policies and controllers
			dispatch = PolicyDispatcher.call( api, options, requestContext, policies[method] || [], policies["*"] || [] )
				.then( function() {
					if ( debug ) {
						Debug( `${request.id}: passed policy routing` );
					}

					return RoutingDispatcher.call( api, options, requestContext, routes[method] || [], routes["*"] || [] )
				} );
		}

		return dispatch
			.then( function() {
				if ( debug ) {
					Debug( `${request.id}: passed responder routing` );
				}

				return requestContext;
			}, function( error ) {
				if ( debug ) {
					Debug( `${request.id}: routing failed: ${error.stack}` );
				}

				throw error;
			} );

	}
};
