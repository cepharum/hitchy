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
 * @property {HitchyRouteSource} source
 * @property {HitchyRouteTarget} target
 * @property {string} method
 * @property {string} prefix
 * @property {RegExp} pattern
 * @property {string[]} parameterNames
 * @property {function} handler
 * @property {Array} args
 * @property {boolean} isValid
 */
class Route {
	/**
	 * @param {HitchyRouteSource} source
	 * @param {HitchyRouteTarget} target
	 * @param {HitchyAPI} api API of context this route is applied to
	 */
	constructor( source, target, api ) {
		let compiledSource = this.constructor.parseSource( source );
		let compiledTarget = this.constructor.parseTarget( target, api );

		// expose indestructible information on resulting route
		Object.defineProperties( this, {
			source: { value: source },
			target: { value: target },
			method: { value: compiledSource.method },
			prefix: { value: compiledSource.prefix },
			pattern: { value: compiledSource.pattern },
			parameterNames: { value: compiledSource.parameters },
			handler: { value: compiledTarget.handler },
			args: { value: compiledTarget.args },
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
	 * Parses source definition of current route.
	 *
	 * @param {HitchyRouteSource} source
	 * @returns {HitchyRouteCompiledSource}
	 * @throws TypeError on providing invalid argument
	 */
	static parseSource( source ) {
		let type, url, definition;

		switch ( typeof source ) {
			case "string" :
				[, type, url] = /^(?:(\*|[a-z][-a-z]+)\s+)?(\/.*)$/i.exec( String( source || "" ).trim() ) || [];

				if ( url === undefined ) {
					throw new TypeError( Util.format( "invalid route %s", source ) );
				}

				if ( type === undefined ) {
					type = "GET";
				}

				definition = { type, url };
				break;

			case "object" :
				if ( source && typeof source.url === "string" && source.url.trim().length > 0 ) {
					if ( source.type === undefined ) {
						definition = { type: "GET", url: source.url };
					} else {
						if ( typeof source.type !== "string" ) {
							throw new TypeError( Util.format( "invalid type on route for URL %s", source.url ) );
						}

						definition = source;
					}
					break;
				}

			// falls through
			default :
				throw new TypeError( Util.format( "invalid route %s", source ) );
		}


		( { type, url } = definition );

		if ( typeof type !== "string" ) {
			throw new TypeError( Util.format( "route w/ invalid type %s", source ) );
		}

		if ( type === undefined || type === null ) {
			type = "*";
		} else {
			type = type.trim().toUpperCase();
			if ( !type.length || type === "ALL" ) {
				type = "*";
			}
		}

		if ( /^[^\/]|\/\/|\/:(?:\W|$)|\(\)/.test( url ) ) {
			throw new TypeError( "path of route must begin with a slash" );
		}


		let parameters = [];
		let pattern = Parser( url, parameters, {
			sensitive: true,    // match path case-sensitively
		} );

		// extract prefix to be part preceding any parameters, globbing or
		// regexp stuff
		let [, prefix] = /^([^*+?(:\[{]*)(.[*+?]|[(:\[{]|$)/.exec( url );
		prefix = prefix.replace( /\/$/, "" );


		return {
			method: type,
			pattern,
			parameters,
			prefix,
			render: Parser.compile( url )
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
				let match = /^([^.:#]+)(?:(?:\.|::|#)(.+))?$/.exec( target.trim() );
				if ( !match ) {
					throw new TypeError( Util.format( "invalid routing target selector %s", target ) );
				}

				target = {
					controller: match[1],
					method: match[2] || "index",
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

		// reduce optional suffix in name of controller selecting controller/policy
		target.controller = target.controller.replace( this.tailPattern, "" ).toLowerCase();

		// check if selected controller exists
		let implementations = api.runtime[this.collectionPluralName];
		if ( !implementations.hasOwnProperty( target.controller ) ) {
			throw new TypeError( Util.format( "invalid route to missing %s %s (to contain action %s)", this.collectionSingularName, target.controller, target.method ) );
		}

		// selected method must be provided by found controller
		let handler = implementations[target.controller][target.method];
		if ( typeof handler !== "function" ) {
			throw new TypeError( Util.format( "invalid route to missing %s action %s.%s", this.collectionSingularName, target.controller, target.method ) );
		}


		let args = [];
		if ( Array.isArray( target.args ) ) {
			args = target.args;
		} else if ( Array.isArray( target.args ) ) {
			args = target.args;
		}


		return { handler, args };
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
		super( source, target, api );
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
		super( source, target, api );
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



/**
 * Provides classes for handling single route descriptions and their compiled
 * instances.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {{Route,TerminalRoute,PolicyRoute}}
 */
module.exports = function( options ) {
	const api = this;

	return { Route, TerminalRoute, PolicyRoute };
};



/**
 * @typedef {string} HitchyRouteSourceAddress
 */

/**
 * @typedef {object} HitchyRouteSourceDescriptor
 * @property {string} [type] name of HTTP method this route applies to explicitly, set "ALL", "*" or omit to match any request
 * @property {string} url path name required to be matched by request for applying route
 */

/**
 * @typedef {HitchyRouteSourceAddress|HitchyRouteSourceDescriptor} HitchyRouteSource
 */

/**
 * @typedef {string} HitchyRouteTargetAddress
 */

/**
 * @typedef {object} HitchyRouteTargetDescriptor
 * @property {string} controller name of controller containing method to invoke as target of route
 * @property {string} method name of method exported by controller to invoke as target of route
 * @property {Array} [args] optional list of additional arguments to provide on invoking selected handler
 */

/**
 * @typedef {function(req:IncomingMessage, res:ServerResponse, next:function(error:Error=))} HitchyRouteTargetPolicyHandler
 */

/**
 * @typedef {function(req:IncomingMessage, res:ServerResponse)} HitchyRouteTargetTerminalHandler
 */

/**
 * @typedef {HitchyRouteTargetPolicyHandler|HitchyRouteTargetTerminalHandler} HitchyRouteTargetHandler
 */

/**
 * @typedef {HitchyRouteTargetAddress|HitchyRouteTargetDescriptor|HitchyRouteTargetHandler} HitchyRouteTarget
 */

/**
 * @typedef {object} HitchyRouteCompiledSource
 * @property {string} method HTTP method required for matching current route; might be asterisk "*" for matching on any HTTP method
 * @property {string} prefix provides static prefix of current route (to improve performance on request dispatching by omitting routes with mismatching prefix)
 * @property {RegExp} pattern prepared regular expression matching URLs considered matching this route
 * @property {HitchyRouteParameter[]} parameters lists name of parameters provided in positional submatches of pattern
 * @property {function(object<string,*>):string} render returns instance of current route definition with parameter name's replaced with given values
 */

/**
 * @typedef {object} HitchyRouteCompiledTarget
 * @property {HitchyRouteTargetHandler} handler
 * @property {Array} args additional arguments to pass when invoking handler on request dispatching
 */

/**
 * @see npm module path-to-regexp
 *
 * @typedef {object} HitchyRouteParameter
 * @property {string|int} name
 * @property {string} prefix
 * @property {string} delimiter
 * @property {boolean} optional
 * @property {boolean} repeat
 * @property {boolean} partial
 * @property {boolean} asterisk
 * @property {string} pattern string containing RegExp pattern for validating parameter's value
 */
