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

const Parser = require( "path-to-regexp" );
const Debug = require( "debug" )( "debug" );

const prefixPtn = /^([^:(*]*)(.*)$/;

/**
 * Provides router processing some current request using configured routes.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Function}
 */
module.exports = function( options ) {
	let api = this;

	return _routerConfigure;


	/**
	 * Initializes sorted routing table from routes provided in configuration
	 *
	 * @param {HitchyComponentHandle[]} modules
	 * @param {HitchyRouteSets} moduleRoutes
	 */
	function _routerConfigure( modules, moduleRoutes ) {
		let methods = {};
		let sequence;

		sequence = _combineIntoList( moduleRoutes );
		sequence = _normalizeList( sequence, modules, methods );

		api.router.map = _groupByMethod( sequence, methods );
	}

	function _combineIntoList( routesPerModule ) {
		let length = routesPerModule.length;
		let merged = new Array( length * 2 + 2 );
		let beforeIndex = 0;
		let afterIndex = length + 2;

		for ( ; beforeIndex < length; beforeIndex++, afterIndex++ ) {
			let routes = routesPerModule[beforeIndex] || {};

			merged[beforeIndex] = routes.before || {};
			merged[afterIndex] = routes.after || {};
		}

		merged[beforeIndex++] = api.runtime.config.routes || {};
		merged[beforeIndex++] = api.components.model && api.components.model.routes() || {};

		return merged;
	}

	function _normalizeList( segments, modules, methods ) {
		let sindex, slength, segment,
		    rindex, rlength, routes, route,
		    method, listed, write;

		let routePtn  = /^(?:(\S+)\s+)?(\/.*)$/;
		let prefixPtn = /^([^*(:]*)/;

		let names = modules.map( module => module.name );

		names = names.concat( "<project>", "<blueprint>" ).concat( names );

		for ( sindex = 0, slength = segments.length; sindex < slength; sindex++ ) {
			segment = segments[sindex];

			routes  = Object.keys( segment );
			rlength = routes.length;
			listed  = new Array( rlength );

			for ( rindex = 0, write = 0; rindex < rlength; rindex++ ) {
				route = routes[rindex];

				let record = _compilePattern( route );
				if ( record ) {
					record.target = _compileTarget( segment[route], record.keys );
					if ( record.target ) {
						listed[write++] = record;
					}
				}
			}

			listed.splice( write, rlength - write );

			segments[sindex] = listed;
		}

		return segments;


		function _compilePattern( pattern ) {
			let match = routePtn.exec( String( pattern || "" ).trim() );
			if ( !match ) {
				Debug( "ignoring invalid route %s at %d@%s", pattern, sindex, rindex, names[sindex] );
				return;
			}

			// extract method selected in route
			if ( match[1] ) {
				method = match[1].toUpperCase();
			} else {
				method = "GET";
			}

			// track all methods used in routes
			methods[method] = true;

			let record = {
				method: method,
			};

			record.keys = [];
			record.pattern = Parser( match[2], record.keys );

			match = prefixPtn.exec( match[2] );
			record.prefix = match[1];

			if ( record.prefix[record.prefix.length-1] === "/" ) {
				record.prefix = record.prefix.slice( 0, -1 );
			}

			return record;
		}

		function _compileTarget( target, parameters ) {
			if ( typeof target === "string" ) {
				let match = /^([^.]+)\.(.+)$/.exec( target.trim() );
				if ( !match ) {
					Debug( "invalid target selector %s on route %s of %d@%s", target, route, rindex, names[sindex] );
					return;
				}

				target = {
					controller: match[1],
					method:     match[2],
				};
			}

			if ( !target || typeof target !== "object" || !target.controller || !target.method ) {
				Debug( "invalid target descriptor on route %s of at %d@%s", target, route, rindex, names[sindex] );
				return;
			}

			target.controller = target.controller.replace( /controller$/i, "" ).toLowerCase();

			if ( !api.runtime.controllers.hasOwnProperty( target.controller ) ) {
				Debug( "ignoring route to missing controller %s (%s of %d@%s)", target.controller, route, rindex, names[sindex] );
				return;
			}

			let action = api.runtime.controllers[target.controller][target.method];
			if ( typeof action !== "function" ) {
				Debug( "ignoring route to missing action %s.%s (%s of %d@%s)", target.controller, target.method, route, rindex, names[sindex] );
				return;
			}

			return action;
		}
	}

	function _groupByMethod( segments, methods ) {
		let groups      = {},
		    localGroups = {},
		    mindex, mlength, method,
		    sindex, slength, segment,
		    rindex, rlength, route;

		// collect all actually used HTTP methods and prepare groups accordingly
		let allMethods = Object.keys( methods )
			.filter( name => name !== "*" && name !== "ALL" );

		allMethods.forEach( name => groups[name] = [] );

		mlength = allMethods.length;


		for ( sindex = 0, slength = segments.length; sindex < slength; sindex++ ) {
			segment = segments[sindex];

			localGroups = {};

			for ( rindex = 0, rlength = segment.length; rindex < rlength; rindex++ ) {
				route = segment[rindex];

				if ( route.method === "*" || route.method === "ALL" ) {
					for ( mindex = 0; mindex < mlength; mindex++ ) {
						method = allMethods[mindex];

						if ( !Array.isArray( localGroups[method] ) ) {
							localGroups[method] = [];
						}

						localGroups[method].push( route );
					}
				} else {
					if ( !Array.isArray( localGroups[route.method] ) ) {
						localGroups[route.method] = [];
					}

					localGroups[route.method].push( route );
				}
			}


			for ( let lgindex = 0, lg = Object.keys( localGroups ), lglength = lg.length; lgindex < lglength; lgindex++ ) {
				method = lg[lgindex];

				groups[method] = groups[method].concat( _groupByPrefix( localGroups[method] ) );
			}
		}

		return groups;


		function _groupByPrefix( routes ) {
			let groups   = [],
				group    = null,
				previous = null;

			routes
				.sort( function( l, r ) {
					let ll = l.prefix.length;
					let rl = r.prefix.length;

					if ( rl != ll ) {
						return rl - ll;
					}

					return l.prefix.toLowerCase().localeCompare( r.prefix.toLowerCase() );
				} )
				.forEach( function( route ) {
					let prefix = route.prefix;
					if ( prefix !== previous ) {
						previous = prefix;

						group = [];
						groups.push( group );
					}

					group.push( route );
				} );

			return groups;
		}
	}
};


/**
 * @typedef {object} HitchyRouteSets
 * @typedef {HitchyRouteSet} before
 * @typedef {HitchyRouteSet} after
 */

/**
 * @typedef {object<string,*>} HitchyRouteSet
 */
