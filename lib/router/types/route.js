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

const Parser = require( "path-to-regexp" );
const Util = require( "util" );


/**
 * Implements generic code for handling route definition and the resulting route
 * information required for efficiently processing it on request dispatching.
 *
 * @name Route
 * @property {HitchyRouteSource} source refers to unparsed definition of route's source
 * @property {HitchyRouteTarget} target refers to unparsed definition of route's target
 * @property {string} method HTTP method route is bound to (might be ALL)
 * @property {string} path path name pattern as provided in route's definition
 * @property {string} prefix static mandatory prefix of current route
 * @property {RegExp} pattern pattern matching path names to be handled
 * @property {HitchyRouteParameter[]} parameters descriptions of parameters defined in route's source
 * @property {?function} handler refers to function to be invoked on processing
 *           route, might be null on a route addressing missing target
 * @property {Array} args arguments defined to be passed in addition to regular signature (req,res,[next]) on invoking route's handler
 * @property {boolean} isValid set true if route is valid
 * @property {?string} warning describes warning regarding current route
 * @property {function(object<string,{string|array)>):string} compile creates example path matching current route's source using some provided data
 */
class Route {
	/**
	 * @param {HitchyRouteSource} source
	 * @param {HitchyRouteTarget} [target]
	 * @param {HitchyAPI} api API of context this route is applied to
	 * @param {boolean} isMatchingPrefix if true route is matching prefixes of request URLs, otherwise whole URL must be matching
	 */
	constructor( source, target, api, { isMatchingPrefix = false } = {} ) {
		if ( arguments.length < 3 ) {
			api = target;
			target = source;
		}

		let compiledSource = this.constructor.parseSource( source, isMatchingPrefix );
		let compiledTarget = this.constructor.parseTarget( target, api );

		// expose indestructible information on resulting route
		Object.defineProperties( this, {
			source: { value: source },
			target: { value: target },
			method: { value: compiledSource.method },
			path: { value: compiledSource.definition },
			prefix: { value: compiledSource.prefix },
			pattern: { value: compiledSource.pattern },
			parameters: { value: compiledSource.parameters },
			compile: { value: compiledSource.render },
			handler: { value: compiledTarget.handler },
			args: { value: compiledTarget.args },
			warning: { value: compiledTarget.warning || null },
		} );

		// detach definition of isValid so its implementation can rely on
		// properties defined before
		Object.defineProperties( this, {
			isValid: { value: this._isValid() },
		} );
	}

	/**
	 * Indicates if current route is considered valid and may be processed for
	 * request dispatching.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	_isValid() {
		return typeof this.handler === "function";
	}

	/**
	 * Parses and validates provided definition of a route's source.
	 *
	 * @param {HitchyRouteSource} definition
	 * @returns {{type: string, url: string, prefix: boolean, exact: boolean}}
	 */
	static preparseSource( definition ) {
		let type, url;

		switch ( typeof definition ) {
			case "string" :
				[, type, url] = /^(?:(\*|[a-z][-a-z]+)\s+)?([=~]?\/.*?)(?:\s*=>.+)?$/i.exec( String( definition || "" ).trim() ) || [];

				if ( type === undefined ) {
					type = "ALL";
				}

				break;

			case "object" :
				if ( definition && typeof definition.url === "string" && definition.url.trim().length > 0 ) {
					switch ( typeof definition.type ) {
						case "undefined" :
						case "string" :
							break;

						default :
							throw new TypeError( Util.format( "invalid type on route for URL %s", definition.url ) );
					}

					type = definition.hasOwnProperty( "type" ) ? definition.type : "ALL";
					url = definition.url;

					break;
				}

			// falls through
			default :
				throw new TypeError( Util.format( "invalid route %s", definition ) );
		}


		if ( typeof type !== "string" ) {
			throw new TypeError( Util.format( "route w/ invalid type %s", definition ) );
		}

		if ( type === undefined || type === null ) {
			type = "ALL";
		} else {
			type = type.trim().toUpperCase();
			if ( !type.length || type === "*" ) {
				type = "ALL";
			}
		}


		if ( typeof url !== "string" ) {
			throw new TypeError( Util.format( "invalid URL in route %s", definition ) );
		}

		const exact = ( url[0] === "=" );
		const prefix = ( url[0] === "~" );

		if ( exact || prefix ) {
			url = url.slice( 1 ).trim();
		}

		if ( /^[^\/]|\/\/|\/:(?:\W|$)|\(\)/.test( url ) ) {
			throw new TypeError( "path of route must begin with a slash" );
		}


		return { type, url, prefix, exact };
	}

	/**
	 * Parses source definition of current route.
	 *
	 * @param {HitchyRouteSource} source
	 * @param {boolean} isMatchingPrefix set true to get pattern matching prefix of request URL instead of whole URL
	 * @returns {HitchyRouteCompiledSource}
	 * @throws TypeError on providing invalid argument
	 */
	static parseSource( source, isMatchingPrefix = false ) {
		let { type, url, exact, prefix: matchPrefix } = this.preparseSource( source );

		let end = !isMatchingPrefix;
		if ( matchPrefix ) {
			end = false;
		}
		if ( exact ) {
			end = true;
		}
		console.error( source + " = " + url + ": " + end );

		let parameters = [];
		let pattern = Parser( url, parameters, {
			sensitive: true,    // match path case-sensitively
			end,
		} );

		// extract prefix to be part preceding any parameters, globbing or
		// regexp stuff
		let [, prefix] = /^([^*+?(:\[{]*)(.[*+?]|[(:\[{]|$)/.exec( url );

		// trim final slash
		prefix = prefix.replace( /\/$/, "" );
		if ( !prefix.length ) {
			prefix = "/";
		}


		return {
			method: type,
			definition: url,
			pattern,
			parameters,
			prefix,
			render: Parser.compile( url ),
		};
	}

	/**
	 * Selects function address as target of route in its target definition.
	 *
	 * @param {HitchyRouteTarget} target
	 * @param {HitchyAPI} api API target of route is used with
	 * @returns {?HitchyRouteCompiledTarget}
	 */
	static parseTarget( target, api ) {
		if ( !api || typeof api !== "object" || !api.runtime ) {
			throw new TypeError( "invalid type of API" );
		}

		switch ( typeof target ) {
			case "string" :
				// target might be given as string
				// -> convert to object selecting controller and its method by name
				let [ , controller, method ] = /^(?:.+?=>\s*)?([^.:#]+)(?:(?:\.|::|#)(.+))?$/.exec( target.trim() );

				if ( !controller ) {
					throw new TypeError( Util.format( "invalid routing target selector %s", target ) );
				}

				target = {
					controller,
					method: method || "index",
				};
				break;

			case "function" :
				// target might be given as function reference to invoke as-is
				return {
					handler: target,
					args: []
				};

			case "object" :
				// target is object selecting controller and its method by name
				if ( target && target.controller && target.method ) {
					break;
				}

			// falls through
			default :
				throw new TypeError( Util.format( "invalid routing target descriptor %s", target ) );
		}

		// at this point there is an object describing controller and method
		// of routing target

		let result = {
			handler: null,
			args: [],
			warning: null,
		};

		// reduce optional suffix in name of controller selecting controller/policy
		target.controller = target.controller.replace( this.tailPattern, "" ).toLowerCase();

		// check if selected controller exists
		let implementations = api.runtime[this.collectionPluralName];

		let implementation = implementations[target.controller];
		if ( !implementation ) {
			result.warning = Util.format( "invalid route to missing %s %s (to contain action %s)", this.collectionSingularName, target.controller, target.method );
		} else {
			// selected method must be provided by found controller
			result.handler = implementation[target.method];
			if ( typeof result.handler !== "function" ) {
				result.warning = Util.format( "invalid route to missing %s action %s.%s", this.collectionSingularName, target.controller, target.method );
			} else {
				if ( Array.isArray( target.args ) ) {
					result.args = target.args.slice();
				} else if ( target.hasOwnProperty( "args" ) ) {
					result.args = [ target.args ];
				}
			}
		}


		return result;
	}

	/**
	 * Generates random examples for path names considered matching current
	 * route's source.
	 *
	 * @param {object<(int|string),string>} customValues contains custom
	 *        values to use per parameter instead of random values
	 * @param {string|string[]} fixValue value to use on every parameter instead of random or any custom value
	 * @param {boolean} useNames set true to use proper parameter definitions instead of custom or random values
	 * @param {boolean} minLengthOnly set true to get single example with minimum number of required values, only
	 * @param {boolean} maxLengthOnly set true to get single example with maximum number of required values, only (though repeating characters are considered max with 3 values each)
	 * @return {string[]}
	 */
	generateExamples( customValues = {}, { fixValue = null, useNames = false, minLengthOnly = false, maxLengthOnly = false } = {} ) {
		let parameters = this.parameters;
		let length = parameters.length;

		let count = 1;
		let countsPerParameter = new Array( length );

		// pre-calculate size of resulting list of examples
		for ( let i = 0; i < length; i++ ) {
			let parameter = parameters[i];
			let name = parameter.name;

			let hasCustom = useNames || fixValue || customValues.hasOwnProperty( name );
			let value;

			if ( hasCustom ) {
				if ( useNames ) {
					value = typeof name === "string" ? `:${name}` : `:numbered${name}*`;
				} else {
					value = fixValue || customValues[name];
				}
			}

			let min = 1;
			let max = 1;

			if ( parameter.optional && ( !hasCustom || !value || useNames || fixValue ) ) {
				min = 0;
			}

			if ( parameter.repeat ) {
				if ( hasCustom && Array.isArray( value ) ) {
					max = value.length;
				} else {
					// provide examples covering up to three different repetitions
					max = 3;
				}
			}

			if ( minLengthOnly ) {
				max = min;
			} else if ( maxLengthOnly ) {
				min = max;
			}

			count *= ( max - min + 1 );
			countsPerParameter[i] = {
				name,
				next: min,
				min,
				max,
				hasCustom,
				custom: hasCustom ? value : null,
				repeat: parameter.repeat,
			};
		}

		countsPerParameter = countsPerParameter.reverse();

		// create detected number fo examples
		let examples = new Array( count );

		for ( let i = 0; i < count; i++ ) {
			let values = {};

			// compile example according to current state of counters per parameter
			for ( let ci = 0; ci < length; ci++ ) {
				let info = countsPerParameter[ci];

				if ( info.next ) {
					// there has to be at least one value for current parameter
					let name = info.name;
					let value;

					if ( info.hasCustom ) {
						// use explicitly provided custom value
						value = info.custom;
					} else {
						// generate list of random values
						value = new Array( info.next );

						for ( let vi = 0; vi < info.next; vi++ ) {
							let s = "";

							for ( let ci = 0, cl = Math.floor( 3 + 15 * Math.random() ); ci < cl; ci++ ) {
								s += String.fromCodePoint( 32 + Math.floor( 96 * Math.random() ) );
							}

							value[vi] = s;
						}
					}

					// prepare to include value in proper format
					if ( info.repeat && Array.isArray( value ) ) {
						values[name] = value;
					} else {
						value = typeof value === "string" ? value : String( value );
						values[name] = info.repeat ? [ value ] : value;
					}
				}
			}

			// compile and collect example path name
			examples[i] = this.compile( values );


			// choose next case by updating counters
			for ( let ci = 0, overflow = true; ci < length; ci++ ) {
				let info = countsPerParameter[ci];

				if ( overflow ) {
					info.next++;
					overflow = false;
				}

				if ( info.next > info.max ) {
					info.next = info.min;
					overflow = true;
				}
			}
		}

		return examples;
	}

	static get MATCH_PARTIAL() { return 1; }
	static get MATCH_FULL() { return 2; }

	/**
	 * Retrieves all of given prefixes considered probably covered by current
	 * route.
	 *
	 * @example cases of probably covering routes:
	 *  - `/test` probably covers `/test/name`
	 *  - `/te` probably covers `/test/name`
	 *  - `/` probably covers `/test/name`
	 *  - `/test?` probably covers `/test/name`
	 *  - `/test*` probably covers `/test/name`
	 *  - `/test+` probably covers `/test/name`
	 *  - `/(test)?` probably covers `/test/name`
	 *  - `/(test)*` probably covers `/test/name`
	 *  - `/(test)+` probably covers `/test/name`
	 *  - `/(test)?/test/name/` probably covers `/test/name`
	 *  - `/(test)+/name` probably covers `/test/name`
	 *  - `/test/:minor` probably covers `/test/name`
	 *  - `/:major/name` probably covers `/test/name`
	 *  - `/:major?/name` probably covers `/test/name`
	 *  - `/:major+/name` probably covers `/test/name`
	 *  - `/:major/:minor` probably covers `/test/name`
	 *  - `/test/:minor?/name` probably covers `/test/name`
	 *  - `/test/:minor*` probably covers `/test/name`
	 *  - `/test/:minor+` probably covers `/test/name`
	 *  - `/:major*` probably covers `/test/name`
	 *  - `/:major+` probably covers `/test/name`
	 *
	 * @example cases of non-covering routes:
	 *  - `/teste` does not cover `/test/name`
	 *  - `/tee` does not cover `/test/name`
	 *  - `/s` does not cover `/test/name`
	 *  - `/tas?s` does not cover `/test/name`
	 *  - `/tas*` does not cover `/test/name`
	 *  - `/tas+` does not cover `/test/name`
	 *  - `/(tast)?` does not cover `/test/name`
	 *  - `/(tast)*` does not cover `/test/name`
	 *  - `/(tast)+` does not cover `/test/name`
	 *  - `/tast/:minor` does not cover `/test/name`
	 *  - `/:major/neme` does not cover `/test/name`
	 *
	 * @param {string[]} options
	 * @returns {object<string,int>}
	 */
	selectProbablyCoveredPrefixes( options ) {
		if ( !Array.isArray( options ) || options.some( i => typeof i !== "string" || i.trim().length < 1 ) ) {
			throw new TypeError( "invalid set of options to filter" );
		}

		let covered = {};
		let dummy = [];
		let myPattern = Parser( this.path, dummy, {
			sensitive: true,
			strict: false,
		} );

		myPattern = new RegExp( myPattern.source.replace( /\$$/, "" ) );

		// iterate over all existing prefix-bound collections to find the one(s)
		// matching current route's prefix ...
		// - ... exactly or
		// - ... by being more specific than a previously collected one
		for ( let oi = 0, ol = options.length; oi < ol; oi++ ) {
			let optionPrefix = options[oi];

			let match = myPattern.exec( optionPrefix );
			if ( match ) {
				covered[optionPrefix] = match[0] === optionPrefix ? Route.MATCH_FULL : Route.MATCH_PARTIAL;
			}
		}

		return covered;
	}

	/**
	 * Provides pattern matching suffix supported in name of module in a route's
	 * target.
	 *
	 * This is used to drop "Controller" in a module name like "UserController" to
	 * select the basic name of module in related collection.
	 *
	 * @type {RegExp}
	 */
	static get tailPattern() {
		return /Controller$/i;
	}

	/**
	 * Names singular of collection exposing modules this route is capable of
	 * addressing.
	 *
	 * @type {string}
	 */
	static get collectionSingularName() {
		return "";
	}

	/**
	 * Names collection exposing modules this route is capable of addressing
	 * (expecting plural form).
	 *
	 * @type {string}
	 */
	static get collectionPluralName() {
		return "";
	}
}

/**
 * Implements wrapper for compiling and providing description of a
 * controller-based terminal route.
 */
class TerminalRoute extends Route {
	/** @inheritDoc */
	constructor( source, target, api ) {
		super( source, target, api, { isMatchingPrefix: false } );
	}

	/** @inheritDoc */
	static get tailPattern() {
		return /Controller$/i;
	}

	/** @inheritDoc */
	static get collectionSingularName() {
		return "controller";
	}

	/** @inheritDoc */
	static get collectionPluralName() {
		return "controllers";
	}
}

/**
 * Implements wrapper for compiling and providing description of a
 * policy-based non-terminal route.
 */
class PolicyRoute extends Route {
	/** @inheritDoc */
	constructor( source, target, api ) {
		super( source, target, api, { isMatchingPrefix: true } );
	}

	/** @inheritDoc */
	static get tailPattern() {
		return /Policy$/i;
	}

	/** @inheritDoc */
	static get collectionSingularName() {
		return "policy";
	}

	/** @inheritDoc */
	static get collectionPluralName() {
		return "policies";
	}
}



module.exports = { Route, TerminalRoute, PolicyRoute };



/**
 * Describes single source of a route consisting of a URL pattern and optional
 * name of HTTP method to be matched against incoming request.
 *
 * Any string complying with this type consists of a URL pattern optionally
 * preceded by name of HTTP method using whitespace as separator. Special names
 * for HTTP method are `*` and `ALL` declaring to match any request. This is the
 * default on omitting explicit provision of HTTP method.
 *
 * @example
 *    * `* /`
 *    * `ALL /` (same as before)
 *    * `/` (same as before)
 *    * `POST /user/create`
 *    * `GET /user(/list)?`
 *    * `GET /user/:id`
 *
 * @typedef {string} HitchyRouteSourceAddress
 */

/**
 * Describes single source of a route using dedicated properties of an object to
 * given URL pattern and optional HTTP method to be matched against incoming
 * request. Special names for HTTP method are `*` and `ALL` declaring to match
 * any request. This is the default on omitting property `type`.
 *
 * @note Property selecting HTTP method wasn't named `method` but `type` due to
 *       supporting provision of route source and target in a single object with
 *       target using property `method` selecting function of an implementation
 *       to invoke on matching route. @see HitchyRouteTargetDescriptor
 *
 * @example
 *    * `{ type: "*", url: "/" }`
 *    * `{ type: "ALL", url: "/" }`
 *    * `{ url: "/" }` (same as before)
 *    * `{ type: "POST", url: "/user/create" }`
 *    * `{ type: "GET", url: "/user(/list)?" }`
 *    * `{ type: "GET", url: "/user/:id" }`
 *
 * @typedef {object} HitchyRouteSourceDescriptor
 * @property {string} [type] name of HTTP method this route applies to explicitly, set "ALL", "*" or omit to match any request
 * @property {string} url path name required to be matched by request for applying route
 * @property {?boolean} exact true if source is explicitly defined to match URL exactly (excludes `prefix`)
 * @property {?boolean} prefix true if source is explicitly defined to match beginning of URL (excludes `exact`)
 */

/**
 * Describes combination of all types supported for defining source of a route.
 *
 * @typedef {HitchyRouteSourceAddress|HitchyRouteSourceDescriptor} HitchyRouteSource
 */

/**
 * Describes target of a route by addressing a method to be invoked on processing
 * incoming request matching source of that route.
 *
 * Any information complying with this type is combining name of a controller or
 * policy class with name of a static method exposed by that class using double
 * colon as separator. Method name might be omitted defaulting to `index`. Name
 * of class is case-insensitive.
 *
 * @example
 *    * `UserController::create`
 *    * `User::create`
 *    * `User::index()`
 *    * `User::index` (same as before)
 *    * `User` (same as before)
 *    * `user` (same as before)
 *
 * @typedef {string} HitchyRouteTargetAddress
 */

/**
 * Describes target of a route by addressing a method to be invoked on processing
 * incoming request matching source of that route.
 *
 * Target address is provided in dedicated properties of an object. This covers
 * case-insensitive name of a class in `controller` and name of a method exposed
 * by that class in `method`. Provision of `method` is optional defaulting to
 * `index`. In addition there may be property `args` providing static arguments
 * to pass every time on invoking selected method.
 *
 * @example
 *    * `UserController::create`
 *    * `User::create`
 *    * `User::index()`
 *    * `User::index` (same as before)
 *    * `User` (same as before)
 *    * `user` (same as before)
 *
 * @typedef {object} HitchyRouteTargetDescriptor
 * @property {string} controller name of controller containing method to invoke as target of route
 * @property {string} [method] name of method exported by controller to invoke as target of route
 * @property {Array} [args] optional list of additional arguments to provide on invoking selected handler
 */

/**
 * Describes immediate reference on function to be invoked on request matching
 * some filtering policy route.
 *
 * @typedef {function(req:IncomingMessage, res:ServerResponse, next:function(error:Error=))} HitchyRouteTargetPolicyHandler
 */

/**
 * Describes immediate reference on function to be invoked on request matching
 * some terminal responder route.
 *
 * @typedef {function(req:IncomingMessage, res:ServerResponse)} HitchyRouteTargetTerminalHandler
 */

/**
 * Commonly describes immediate reference on function to be invoked on request
 * matching some route.
 *
 * @typedef {HitchyRouteTargetPolicyHandler|HitchyRouteTargetTerminalHandler} HitchyRouteTargetHandler
 */

/**
 * Combines all supported ways of describing target of a route.
 *
 * @typedef {HitchyRouteTargetAddress|HitchyRouteTargetDescriptor|HitchyRouteTargetHandler} HitchyRouteTarget
 */

/**
 * Describes normalized and validated description of a route's source.
 *
 * @typedef {object} HitchyRouteCompiledSource
 * @property {string} method HTTP method required for matching current route; might be asterisk "*" for matching on any HTTP method
 * @property {string} prefix provides static prefix of current route (to improve performance on request dispatching by omitting routes with mismatching prefix)
 * @property {RegExp} pattern prepared regular expression matching URLs considered matching this route
 * @property {HitchyRouteParameter[]} parameters lists name of parameters provided in positional submatches of pattern
 * @property {function(object<string,*>):string} render returns instance of current route definition with parameter name's replaced with given values
 */

/**
 * Describes normalized and validated description of a route's target.
 *
 * @typedef {object} HitchyRouteCompiledTarget
 * @property {HitchyRouteTargetHandler} handler
 * @property {Array} args additional arguments to pass when invoking handler on request dispatching
 */

/**
 * @see npm module path-to-regexp
 *
 * Describes single parameter detected in a path name considered matching route.
 *
 * @typedef {object} HitchyRouteParameter
 * @property {string|int} name name of (named) parameter or index of (unnamed) parameter
 * @property {string} prefix prefix character of segment
 * @property {string} delimiter delimiter of segment (same as `prefix` or `/`)
 * @property {boolean} optional marks if parameter is optional
 * @property {boolean} repeat marks if parameter may cover multiple values
 * @property {boolean} partial marks if parameter covers part of path segment, only
 * @property {string} pattern RegExp pattern used to match this token
 * @property {boolean} asterisk marks if parameter is a `*` match
 */
