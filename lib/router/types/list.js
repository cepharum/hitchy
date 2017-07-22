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


const { Route, PolicyRoute } = require( "./route" );


/**
 * Implements route collector managing separate sorted lists of routes per
 * method either set of routes are bound to.
 *
 * @name RoutesPerMethod
 * @property {object.<string,(Route[]|RoutesPerPrefix)>} methods maps name of method into sorted list of routes bound to it
 * @property {boolean} isAdjustable indicates if further routes may be added or not
 */
class RoutesPerMethod {
	constructor() {
		Object.defineProperties( this, {
			methods: { value: {} },
			isAdjustable: { value: true, configurable: true },
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

		if ( !this.isAdjustable ) {
			throw new Error( "must not append route to write-protected collector" );
		}


		let lists = this.methods;
		let method = route.method.trim().toUpperCase();

		if ( method === "*" ) {
			method = "ALL";
		}


		if ( !lists.hasOwnProperty( method ) ) {
			// got some new method -> always initialize with all previously
			// collected routes to be used with every method
			lists[method] = ( lists.ALL || [] ).slice( 0 );
		}

		lists[method].push( route );


		if ( method === "ALL" ) {
			// got a route not bound to any particular request method
			// -> bind this route to every other method's list of routes as well
			for ( let methodName in this.methods ) {
				if ( methodName !== "ALL" && this.methods.hasOwnProperty( methodName ) ) {
					this.methods[methodName].push( route );
				}
			}
		}


		return route;
	}

	/**
	 * Concatenates routes of provided instances to current instance.
	 *
	 * @param {RoutesPerMethod} remote
	 * @returns {RoutesPerMethod} fluent interface
	 */
	concat( remote ) {
		if ( remote instanceof RoutesPerMethod ) {
			if ( !remote.isAdjustable ) {
				throw new TypeError( "remote instance has been optimized before" );
			}

			if ( !this.isAdjustable ) {
				throw new TypeError( "can't concatenate to write-protected instance" );
			}


			for ( let methodName in remote.methods ) {
				if ( remote.methods.hasOwnProperty( methodName ) ) {
					let routes = remote.methods[methodName];

					for ( let i = 0, length = routes.length; i < length; i++ ) {
						this.append( routes[i] );
					}
				}
			}
		}

		return this;
	}

	/**
	 * Retrieves list of all previously appended routes matching provided HTTP
	 * method.
	 *
	 * @note This method implicitly invokes optimizeByPrefix() if current
	 *       instance is still adjustable making it non-adjustable afterwards.
	 *
	 * @param {string} method name of HTTP method
	 * @returns {?RoutesPerPrefix} all previously appended routes to be obeyed on processing selected HTTP method
	 */
	onMethod( method ) {
		if ( this.isAdjustable ) {
			this.optimizeByPrefix();
		}

		method = method.toUpperCase();

		switch ( method ) {
			case "*" :
				method = "ALL";

			// falls through
			default :
				return this.methods[method] || this.methods.ALL || null;
		}
	}

	/**
	 * Replaces routes of every previously collected method with sets of routes
	 * grouped by prefix.
	 *
	 * @returns {RoutesPerMethod}
	 */
	optimizeByPrefix() {
		if ( this.isAdjustable ) {
			for ( let methodName in this.methods ) {
				if ( this.methods.hasOwnProperty( methodName ) ) {
					let source = this.methods[methodName];
					let target = new RoutesPerPrefix( this._getPrefixes( source ) );

					for ( let i = 0, length = source.length; i < length; i++ ) {
						target.append( source[i] );
					}

					this.methods[methodName] = target;
				}
			}

			Object.defineProperties( this, {
				isAdjustable: { value: false },
			} );
		}

		return this;
	}

	_getPrefixes( routes ) {
		let prefixes = {};

		if ( Array.isArray( routes ) ) {
			routes.forEach( route => prefixes[route.prefix] = true );
		}

		return Object.keys( prefixes );
	}

	dump() {
		let set = this.methods;
		let fix = !this.isAdjustable;

		return Object.keys( set )
			.sort()
			.map( name => {
				let prefix = `on ${name} requests (${fix ? "optimized" : "adjustable"}):\n`;

				if ( fix ) {
					return prefix + set[name].dump();
				}

				return prefix + set[name].map( route => ` - ${route.path}` ).join( "\n" );
			} )
			.join( "\n" );
	}
}


/**
 * @name RoutesPerPrefix
 * @property {boolean} extensible true if appending routes is probably extending prefixes
 * @property {object<string,Route[]>} prefixes
 */
class RoutesPerPrefix {
	constructor( prefixes = null ) {
		let value = {};

		if ( Array.isArray( prefixes ) ) {
			prefixes.forEach( name => value[name.length ? name : "/"] = [] );
		}

		Object.defineProperties( this, {
			extensible: { value: !Array.isArray( prefixes ) },
			prefixes: { value: value },
		} );
	}

	/**
	 *
	 * @param prefix
	 * @returns {*}
	 */
	getLongestMatchingPrefix( prefix ) {
		let prefixLength = prefix.length;

		let longestLength = 0;
		let longest = null;

		for ( let item in this.prefixes ) {
			if ( this.prefixes.hasOwnProperty( item ) ) {
				let itemLength = item.length;

				if ( itemLength <= prefixLength ) {
					if ( itemLength > longestLength ) {
						if ( prefix.substr( 0, itemLength ) === item ) {
							longestLength = itemLength;
							longest = item;

							if ( itemLength === prefixLength ) {
								break;
							}
						}
					}
				}
			}
		}

		return longest;
	}

	/**
	 *
	 * @param {Route} route
	 * @return {RoutesPerPrefix}
	 */
	append( route ) {
		let routePrefix = route.prefix;
		let routePrefixLength = routePrefix.length;
		let collectedExactly = false;

		if ( !routePrefixLength ) {
			routePrefix = "/";
			routePrefixLength = 1;
		}

		let routeVariants = route.generateExamples( {}, { fixValue: "*" } )
			.map( variant => variant.split( "/" ) );


		// iterate over all existing prefix-bound collections to find the one(s)
		// matching current route's prefix ...
		// - ... exactly or
		// - ... by being more specific than a previously collected one
		for ( let collectedPrefix in this.prefixes ) {
			if ( this.prefixes.hasOwnProperty( collectedPrefix ) ) {
				let collectedPrefixLength = collectedPrefix.length;


				// obey this route if any of its probable variants matches
				// current collection's prefix
				let match = false;
				let collectedSegments = collectedPrefix.split( "/" );
				let segmentsCount = collectedSegments.length;

				for ( let ri = 0, rl = routeVariants.length; !match && ri < rl; ri++ ) {
					let variant = routeVariants[ri];
					if ( variant.length >= segmentsCount ) {
						variant = variant.slice( 0, segmentsCount );

						for ( let vi = 0, vl = segmentsCount; vi < vl; vi++ ) {
							let segment = variant[vi];
							if ( segment === "*" ) {
								variant[vi] = collectedSegments[vi];
							}
						}

						if ( route instanceof PolicyRoute ) {
							variant = variant.join( "/" );
							match = ( variant === collectedPrefix.substr( 0, variant.length ) );
						} else {
							match = ( variant.join( "/" ) === collectedPrefix );
						}
					}
				}

				if ( match ) {
					// at least one variant of route is matching current collection's prefix
					this.prefixes[collectedPrefix].push( route );

					collectedExactly = ( routePrefix === collectedPrefix );
				}
			}
		}

		if ( !collectedExactly && !this.extensible ) {
			// didn't encounter exact match on prefix this time
			// -> start another collection
			this.prefixes[routePrefix] = [route];
		}

		return this;
	}

	dump() {
		let set = this.prefixes;

		return Object.keys( set )
			.sort()
			.map( name => `- ${name} includes:\n` +
			              set[name].map( route => `  - ${route.path}` ).join( "\n" )
			)
			.join( "\n" );
	}
}


module.exports = { RoutesPerMethod, RoutesPerPrefix };
