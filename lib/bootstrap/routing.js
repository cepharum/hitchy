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

const Normalize = require( "../router/normalize/definition" );

/**
 * Provides implementation of bootstrapping stage setting up router.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function(componentHandles:HitchyComponentHandle[]):Promise.<HitchyComponentHandle[]>}
 */
module.exports = function( options ) {
	const api = this;

	return _bootstrapRouting;


	/**
	 * Sets up router according to configuration gathered from components, from
	 * application and due to blueprint routing.
	 *
	 * @param {HitchyComponentHandle[]} componentHandles
	 * @returns {Promise.<HitchyComponentHandle[]>}
	 * @private
	 */
	function _bootstrapRouting( componentHandles ) {
		return Promise.all( [
			api.utility.promise.map( componentHandles, createGetter( "policies" ) ),
			api.utility.promise.map( componentHandles, createGetter( "routes" ) ),
			api.utility.promise.map( componentHandles, createGetter( "blueprints" ) ),
		] )
			.then( function( [policies, routing, blueprints] ) {
				// finally configure routing including all routes provided above
				api.router.configure( componentHandles, policies, routing, blueprints );

				return componentHandles;
			} );
	}

	/**
	 * Generates getter for commonly fetching routing configuration per module.
	 *
	 * @param {string} propertyName name of module's API property containing
	 *        definition of routes to process
	 * @returns {function(handle:HitchyComponentHandle):(HitchyRouteComponentTables|HitchyRouteDescriptorSet)}
	 */
	function createGetter( propertyName ) {
		return function( handle ) {
			let routerMap = handle.api[propertyName];
			if ( typeof routerMap === "function" ) {
				return routerMap.call( api, options, handle ).then( Normalize );
			}

			return Normalize( routerMap );
		};
	}
};
