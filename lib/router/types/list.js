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


const Route = require( "./route" ).Route;



/**
 * Implements route collector managing separate sorted lists of routes per
 * method either set of routes are bound to.
 *
 * @property {object.<string,Route[]>} methods maps name of method into sorted list of routes bound to it
 */
class RoutesPerMethod {
	constructor() {
		Object.defineProperties( this, {
			methods: { value: {} }
		} );
	}

	/**
	 * Adds route to proper lists according to the route's method.
	 *
	 * @param {Route} route
	 * @returns {Route} provided route
	 */
	append( route ) {
		if ( !( route instanceof Route ) ) {
			throw new TypeError( "invalid route to be added" );
		}

		let lists = this.methods;
		let method = route.method;

		if ( !lists.hasOwnProperty( method ) ) {
			lists[method] = [];
		}

		lists[method].push( route );

		if ( method !== "ALL" ) {
			// always append route bound to single HTTP method to list of
			// unbound routes, too
			if ( !lists.hasOwnProperty( "ALL" ) ) {
				lists.ALL = [];
			}

			lists.ALL.push( route );
		}

		return route;
	}
}


module.exports = { RoutesPerMethod };
