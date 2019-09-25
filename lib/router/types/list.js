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
	/** */
	constructor() {
		Object.defineProperties( this, {
			methods: { value: {} },
			isAdjustable: { value: true, configurable: true },
		} );
	}

	/**
	 * Adds route to proper lists according to the route's method.
	 *
	 * @param {Route} route route to be appended
	 * @returns {Route} provided route
	 */
	append( route ) {
		if ( !( route instanceof Route ) ) {
			throw new TypeError( "invalid route to be added" );
		}

		if ( !this.isAdjustable ) {
			throw new Error( "must not append route to write-protected collector" );
		}


		const lists = this.methods;
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
			for ( const methodName in this.methods ) {
				if ( methodName !== "ALL" && this.methods.hasOwnProperty( methodName ) ) {
					this.methods[methodName].push( route );
				}
			}
		}


		return route;
	}

	/**
	 * Appends all routes managed in provided instance.
	 *
	 * @param {RoutesPerMethod} remote grouped routes to be merged into current set
	 * @returns {RoutesPerMethod} fluent interface
	 */
	concat( remote ) {
		if ( !( remote instanceof RoutesPerMethod ) ) {
			throw new TypeError( "invalid set of routes per method" );
		}

		if ( !remote.isAdjustable ) {
			throw new TypeError( "remote instance has been optimized before" );
		}

		if ( !this.isAdjustable ) {
			throw new TypeError( "can't concatenate to write-protected instance" );
		}


		const sources = remote.methods;
		const targets = this.methods;

		for ( const methodName in sources ) {
			if ( sources.hasOwnProperty( methodName ) ) {
				if ( !targets.hasOwnProperty( methodName ) ) {
					// got some new method -> always initialize with all previously
					// collected routes to be used with every method
					targets[methodName] = ( targets.ALL || [] ).slice( 0 );
				}

				targets[methodName] = targets[methodName].concat( sources[methodName] );
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
		if ( typeof method !== "string" || method.trim().length < 1 ) {
			throw new TypeError( "invalid method to look up" );
		}

		if ( this.isAdjustable ) {
			this.optimizeByPrefix();
		}

		let _method = method.toUpperCase();

		switch ( _method ) {
			case "*" :
				_method = "ALL";

			// falls through
			default :
				return this.methods[_method] || this.methods.ALL || null;
		}
	}

	/**
	 * Replaces routes of every previously collected method with sets of routes
	 * grouped by prefix.
	 *
	 * @param {boolean} reverse set true to optimize routes for processing in reverse order
	 * @returns {RoutesPerMethod} fluent interface
	 */
	optimizeByPrefix( reverse = false ) {
		if ( this.isAdjustable ) {
			for ( const methodName in this.methods ) {
				if ( this.methods.hasOwnProperty( methodName ) ) {
					const source = this.methods[methodName];
					const target = new RoutesPerPrefix( this._getPrefixes( source ) );

					for ( let i = 0, length = source.length; i < length; i++ ) {
						target.append( source[i] );
					}

					target.sortPerPrefix( reverse );

					this.methods[methodName] = target;
				}
			}

			Object.defineProperties( this, {
				isAdjustable: { value: false },
			} );
		}

		return this;
	}

	/**
	 * Extracts unique set of prefixes from provided list of routes.
	 *
	 * @param {Route[]} routes list of routes
	 * @returns {string[]} unique list of prefixes used in  provided routes
	 * @private
	 */
	_getPrefixes( routes ) {
		const prefixes = {};

		if ( Array.isArray( routes ) ) {
			routes.forEach( route => ( prefixes[route.prefix] = true ) );
		}

		return Object.keys( prefixes );
	}

	/**
	 * Returns description of currently managed groups of routes for debugging.
	 *
	 * @returns {string} description of currently collected routes
	 */
	dump() {
		const set = this.methods;
		const fix = !this.isAdjustable;

		return Object.keys( set )
			.sort()
			.map( name => {
				const prefix = `on ${name} requests (${fix ? "optimized" : "adjustable"}):\n`;

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
	/**
	 * @param {string[]} prefixes set of prefixes for initializing internally managed groups of routes per prefix
	 */
	constructor( prefixes = null ) {
		const value = {};

		if ( Array.isArray( prefixes ) ) {
			prefixes.forEach( name => ( value[name.length ? name : "/"] = [] ) );
		}

		Object.defineProperties( this, {
			extensible: { value: !Array.isArray( prefixes ) },
			prefixes: { value: value },
		} );
	}

	/**
	 * Fetches longest prefix of internally managed prefixes matching given
	 * prefix.
	 *
	 * @param {string} prefix prefix to be matched
	 * @returns {?string} longest prefix of locally managed groups sharing start with provided one
	 */
	getLongestMatchingPrefix( prefix ) {
		if ( typeof prefix !== "string" || prefix.trim().length < 1 ) {
			throw new TypeError( "invalid prefix to look up" );
		}

		const prefixLength = prefix.length;

		let longestLength = 0;
		let longest = null;

		for ( const item in this.prefixes ) {
			if ( this.prefixes.hasOwnProperty( item ) ) {
				const itemLength = item.length;

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
	 * Collects provided route in all prefix-related groups covering this route.
	 *
	 * @param {Route} route route to be collected
	 * @return {RoutesPerPrefix} fluent interface
	 */
	append( route ) {
		if ( !( route instanceof Route ) ) {
			throw new TypeError( "invalid route to append" );
		}

		const isPolicy = route instanceof PolicyRoute;
		const coveredPrefixes = route.selectProbablyCoveredPrefixes( Object.keys( this.prefixes ) );

		for ( const prefix in coveredPrefixes ) {
			if ( coveredPrefixes.hasOwnProperty( prefix ) ) {
				const prefixList = this.prefixes[prefix];
				let found = false;

				if ( !isPolicy ) {
					// in dispatching routes only first one matching certain
					// pattern is obeyed
					// -> don't add multiple routes using exactly same pattern
					const numExisting = prefixList.length;

					for ( let i = 0; !found && i < numExisting; i++ ) {
						if ( prefixList[i].pattern.toString() === route.pattern.toString() ) {
							found = true;
						}
					}
				}

				if ( !found && ( isPolicy || coveredPrefixes[prefix] === Route.MATCH_FULL ) ) {
					prefixList.push( route );
				}
			}
		}


		const prefix = route.prefix;

		if ( !this.prefixes.hasOwnProperty( prefix ) ) {
			if ( this.extensible ) {
				this.prefixes[prefix] = [route];
			}
		} else if ( !coveredPrefixes[prefix] ) {
			this.prefixes[prefix].push( route );
		}

		return this;
	}

	/**
	 * Iterates over all groups of prefixes sorting each group from routes
	 * matching generic routes to those matching more specific ones.
	 *
	 * @param {boolean} preferSpecificRoutes set true to sort routes per prefix in reverse order preferring specific prefixes over generic ones
	 * @returns {void}
	 */
	sortPerPrefix( preferSpecificRoutes = false ) {
		const prefixes = Object.keys( this.prefixes );
		const numPrefixes = prefixes.length;

		for ( let p = 0; p < numPrefixes; p++ ) {
			const prefix = prefixes[p];
			const routes = this.prefixes[prefix];
			const numRoutes = routes.length;

			const sources = [];
			for ( let r = 0; r < numRoutes; r++ ) {
				const route = routes[r];
				const source = route.source;
				const split = source.lastIndexOf( "/" );
				const parent = split > -1 ? source.slice( 0, split === source.length - 1 ? split : split + 1 ) : "";

				if ( sources.indexOf( parent ) < 0 ) {
					sources.push( parent );
				}
			}

			if ( preferSpecificRoutes ) {
				sources.sort( ( l, r ) => r.length - l.length );
			} else {
				sources.sort( ( l, r ) => l.length - r.length );
			}

			const numSources = sources.length;
			const sorted = new Array( sources.length );

			for ( let s = 0; s < numSources; s++ ) {
				sorted[s] = [];
			}

			for ( let r = 0; r < numRoutes; r++ ) {
				const route = routes[r];
				const source = route.source;
				const split = source.lastIndexOf( "/" );
				const parent = split > -1 ? source.slice( 0, split === source.length - 1 ? split : split + 1 ) : "";

				sorted[sources.indexOf( parent )].push( route );
			}

			this.prefixes[prefix] = [].concat( ...sorted );
		}
	}

	/**
	 * Fetches set of routes bound to longest prefix matching (by means of
	 * "covering" or "including") provided one.
	 *
	 * @param {string} prefix prefix to be covered by delivered routes
	 * @returns {Array<Route>} lists routes covering provided prefix
	 */
	onPrefix( prefix ) {
		const longestMatching = this.getLongestMatchingPrefix( prefix );
		if ( longestMatching !== null ) {
			return this.prefixes[longestMatching];
		}

		return [];
	}

	/**
	 * Retrieves description of current instance for debugging purposes.
	 *
	 * @returns {string} description of current instance
	 */
	dump() {
		const set = this.prefixes;

		return Object.keys( set )
			.sort()
			.map( name => `- ${name} includes:\n` +
			              set[name].map( route => `  - ${route.path}` ).join( "\n" )
			)
			.join( "\n" );
	}
}


module.exports = { RoutesPerMethod, RoutesPerPrefix };
