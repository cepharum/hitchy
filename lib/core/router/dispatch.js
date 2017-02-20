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
	const api = this;

	const PolicyDispatcher  = require( "./dispatch/policies" );
	const RoutingDispatcher = require( "./dispatch/responder" );

	let requestCounter = 0;

	return _routerDispatch;


	/**
	 * Dispatches request according to configured routes.
	 *
	 * @param {HitchyRequestContext} requestContext
	 * @returns {Promise<HitchyRequestContext>}
	 */
	function _routerDispatch( requestContext ) {
		let request  = requestContext.request,
		    method   = request.method,
		    path     = request.path,
		    policies = api.router.policies,
		    routes   = api.router.routes;

		request.id = String( "000000" + String( ++requestCounter, 16 ) ).slice( -8 );


		Debug( `${request.id}: routing ${method} ${path}` );

		if ( !policies.hasOwnProperty( method ) && !policies.hasOwnProperty( "*" ) ) {
			// there are no policy -> don't waste time
			return RoutingDispatcher( requestContext, routes[method] || [], routes["*"] || [] )
				.then( function() {
					return requestContext;
				} );
		}


		return new Promise( function( resolve, reject ) {

			PolicyDispatcher( requestContext, policies[method] || [], policies["*"] || [] )
				.then( function() {
					// +debug
					Debug( `${request.id}: passed policy routing` );
					// -debug

					return RoutingDispatcher( requestContext, routes[method] || [], routes["*"] || [] )
				} )
				.then( function() {
					// +debug
					Debug( `${request.id}: passed responder routing` );
					// -debug

					resolve( requestContext );
				}, function( error ) {
					// +debug
					Debug( `${request.id}: routing failed: ${error.stack}` );
					// -debug

					reject( error );
				} );

		} );



	}
};
