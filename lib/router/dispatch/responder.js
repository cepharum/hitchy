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
 * Dispatches request into first matching responder route.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @param {HitchyRequestContext} context
 * @param {HitchyRouteSets} specificRoutes routes associated with requested HTTP method
 * @param {HitchyRouteSets} allRoutes routes not associated with any HTTP method
 * @returns {Promise}
 */
module.exports = function _routerDispatchResponder( options, context, specificRoutes, allRoutes ) {
	const api = this;

	const Debug = api.log( "debug" );

	let { request, response } = context;
	let { id, path } = request;

	const debug = options.debug;


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

		if ( debug ) {
			Debug( `${id}: testing responder routes in segment ${segmentIndex+1}/${numSegments}` );
		}

		for ( let slotIndex = 0; slotIndex < 2; slotIndex++ ) {

			/*
			 * On every component with routes process specially bound routes
			 * prior to processing those bound to all HTTP methods.
			 */

			let slot = segment[slotIndex];
			if ( !slot ) {
				continue;
			}

			if ( debug ) {
				Debug( `${id}: testing ${slotIndex ? "common" : "method-specific"} responder routes` );
			}

			for ( let prefixIndex = 0, numPrefixes = slot.length; prefixIndex < numPrefixes; prefixIndex++ ) {
				let group  = slot[prefixIndex] || [];
				let prefix = group.length ? group[0].prefix : null;

				if ( prefix !== null && path.startsWith( prefix ) ) {
					// this group's common prefix is matching prefix of current
					// request path -> need to check contained routes

					if ( debug ) {
						Debug( `${id}: match prefix "${prefix}" on path "${path}"` );
					}

					for ( let index = 0, numRoutes = group.length; index < numRoutes; index++ ) {
						let route = group[index];

						let match = route.pattern.exec( path );
						if ( match ) {
							// route is first matching one -> process it

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


							if ( debug ) {
								Debug( `${id}: MATCH responder route "${route.definition.source}" handled by ${route.definition.target} w/ parameters %O`, localParams );
							}


							// invoke routing target
							let saved = request.params;
							request.params = localParams;

							let result;

							try {
								result = route.target.call( context, request, response );
							} catch ( error ) {
								request.params = saved;
								return Promise.reject( error );
							}

							if ( result instanceof Promise ) {
								return result
									.then( function() {
										request.params = saved;
									}, function( cause ) {
										request.params = saved;
										throw cause;
									} );
							}

							request.params = saved;
							return Promise.resolve();
						}
					}
				}
			}
		}
	}

	return Promise.resolve();
};
