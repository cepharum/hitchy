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

const _ = require( "lodash" );

/**
 * Dispatches request into first matching responder route.
 *
 * @param {HitchyRequestContext} context
 * @param {HitchyRouteSets}specificRoutes
 * @param {HitchyRouteSets} allRoutes
 * @returns {Promise}
 */
module.exports = function _routerDispatchResponder( context, specificRoutes, allRoutes ) {
	let request  = context.request;
	let response = context.response;
	let path     = request.path;

	let policies = new Array( 20 );
	let write    = 0;


	// #1 collect all matching routes synchronously ...

	/*
	 * Traverse over slots.
	 *
	 * Each slot is associated with a loaded component. This way order
	 * of route processing is same as initializing components.
	 */

	let slotIndex, slotCount, slot;

	for ( slotIndex = 0, slotCount = Math.max( specificRoutes.length, allRoutes.length ); slotIndex < slotCount; slotIndex++ ) {

		/*
		 * Traverse over blocks of slot.
		 *
		 * Every slot has 2 blocks: one with routes explicitly bound to current
		 * HTTP method and one with routes "bound" to any HTTP method.
		 */

		slot = [ specificRoutes[slotIndex], allRoutes[slotIndex] ];

		let blockIndex, block;

		for ( blockIndex = 0; blockIndex < 2; blockIndex++ ) {

			/*
			 * On every component with routes process specially bound routes
			 * prior to processing those bound to all HTTP methods.
			 */

			block = slot[blockIndex];
			if ( !block ) {
				continue;
			}

			let groupIndex, groupCount, prefixGroup, prefix;

			for ( groupIndex = 0, groupCount = block.length; groupIndex < groupCount; groupIndex++ ) {
				prefixGroup = block[groupIndex];
				prefix      = prefixGroup[0].prefix;

				if ( prefix === path.slice( 0, prefix.length ) ) {
					// this group's common prefix is matching prefix of
					// current path -> need to check contained routes

					let routeIndex, routeCount, route;

					for ( routeIndex = 0, routeCount = prefixGroup.length; routeIndex < routeCount; routeIndex++ ) {
						route = prefixGroup[routeIndex];

						let match = route.pattern.exec( path );
						if ( match ) {
							// route is matching
							// -> collect now to be processed later
							policies[write++] = { route, match };
						}
					}
				}
			}
		}
	}


	// #2 asynchronously iterate over all found matches
	if ( write > 0 ) {
		policies.splice( write, policies.length - write );

		return context.api.utility.promise
			.each( policies, function( policy ) {
				let named = {},
				    keyIndex, keyCount, keys, key, value;

				for ( keys = policy.route.keys, keyIndex = 0, keyCount = keys.length; keyIndex < keyCount; keyIndex++ ) {
					key   = keys[keyIndex];
					value = policy.match[keyIndex+1];

					if ( value !== undefined ) {
						named[key.name] = key.repeat ? value.split( key.delimiter ).filter( i => i !== undefined ) : value;
					}
				}

				let origParams = request.params;
				request.params = _.extend( {}, origParams, named );

				let target = policy.route.target;
				if ( target.length >= 3 ) {
					return new Promise( function( resolve, reject ) {
						target.call( context, request, response, function( error ) {
							request.params = origParams;

							if ( error ) {
								return reject( error );
							}

							resolve();
						} );
					} );
				}

				let result = target.call( context, request, response );
				if ( result instanceof Promise ) {
					return result
						.then( function() {
							request.params = origParams;
						}, function( cause ) {
							request.params = origParams;
							throw cause;
						} );
				} else {
					request.params = origParams;
				}
			} );
	}
};
