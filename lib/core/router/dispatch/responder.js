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

const Debug = require( "debug" )( "debug" );

/**
 * Dispatches request into first matching responder route.
 *
 * @param {HitchyRequestContext} context
 * @param {HitchyRouteSets} specificRoutes routes associated with requested HTTP method
 * @param {HitchyRouteSets} allRoutes routes not associated with any HTTP method
 * @returns {Promise}
 */
module.exports = function _routerDispatchResponder( context, specificRoutes, allRoutes ) {
	let { request, response } = context;
	let { id, path } = request;


	/*
	 * Traverse over segments of routes.
	 *
	 * Each segment is related to some loaded component, the routes of
	 * application or special blueprint routes. This way order of route
	 * processing is equivalent to the one detected at components's discovery.
	 */

	for ( let segmentIndex = 0, numSegments = Math.max( specificRoutes.length, allRoutes.length ); segmentIndex < numSegments; segmentIndex++ ) {

		/*
		 * Traverse over slots of segment.
		 *
		 * In every segment routes associated with current request method as
		 * well as all routes not associated with any request method have to be
		 * processed.
		 */
		let segment = [ specificRoutes[segmentIndex], allRoutes[segmentIndex] ];

		// +debug
		Debug( `${id}: testing responder routes in segment ${segmentIndex+1}/${numSegments}` );
		// -debug

		for ( let slotIndex = 0; slotIndex < 2; slotIndex++ ) {

			/*
			 * On every component with routes process specially bound routes
			 * prior to processing those bound to all HTTP methods.
			 */

			let slot = segment[slotIndex];
			if ( !slot ) {
				continue;
			}

			// +debug
			Debug( `${id}: testing ${slotIndex ? "common" : "method-specific"} responder routes` );
			// -debug

			for ( let prefixIndex = 0, numPrefixes = slot.length; prefixIndex < numPrefixes; prefixIndex++ ) {
				let group  = slot[prefixIndex] || [];
				let prefix = group.length ? group[0].prefix : null;

				// +debug
				Debug( `${id}: is path "${path}" matching prefix "${prefix}"?` );
				// -debug

				if ( prefix !== null && path.startsWith( prefix ) ) {
					// this group's common prefix is matching prefix of current
					// request path -> need to check contained routes

					// +debug
					Debug( `${id}: path "${path}" is matching prefix "${prefix}"?` );
					// -debug

					for ( let index = 0, numRoutes = group.length; index < numRoutes; index++ ) {
						let route = group[index];

						let match = route.pattern.exec( path );
						if ( match ) {
							// route is first matching one -> process it

							// +debug
							Debug( `${id}: matching route "${route.pattern}" w/ parameters ${route.keys.join( ", " )}?` );
							// -debug

							// inject local query parameters non-destructively
							let localParams = {};

							for ( let keys = route.keys, keyIndex = 0, keyCount = keys.length; keyIndex < keyCount; keyIndex++ ) {
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


							// invoke routing target
							let saved = request.params;
							request.params = localParams;

							let result = route.target.call( context, request, response );
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

								return Promise.resolve();
							}

							// never meet this point!
						}
					}
				}
			}
		}
	}

	return Promise.resolve();
};
