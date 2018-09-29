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

const { PolicyRoute, TerminalRoute } = require( "./types/route" );
const { RoutesPerMethod } = require( "./types/list" );

const OrderedQueue = require( "../utility/ordered-queue" );


/**
 * Provides router processing some current request using configured routes.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Function}
 */
module.exports = function( options ) {
	const api = this;

	const Debug = api.log( "hitchy:debug" );

	const debug = options.debug;


	return _routingConfigure;



	/**
	 * Initializes sorted routing table from routes provided in configuration
	 *
	 * @param {HitchyComponentHandle[]} modules
	 * @param {HitchyRouteComponentTablesNormalized[]} policiesPerModule
	 * @param {HitchyRouteComponentTablesNormalized[]} terminalsPerModule
	 * @param {HitchyRouteDescriptorSet[]} blueprintsPerModule
	 * @param {HitchyRouteComponentTablesNormalized[]} customPolicies
	 * @param {HitchyRouteComponentTablesNormalized[]} customTerminals
	 */
	function _routingConfigure( modules, policiesPerModule, terminalsPerModule, blueprintsPerModule, customPolicies, customTerminals ) {
		// put all defined routes into proper order
		let { policies, terminals } = _sortDefinitions( modules, policiesPerModule, terminalsPerModule, blueprintsPerModule, customPolicies, customTerminals )

		// convert definitions into instances of Route grouped by method and by prefix
		policies = _compileRoutes( policies, PolicyRoute );
		terminals = _compileRoutes( terminals, TerminalRoute );

		if ( debug ) {
			Debug( `COLLECTED early policies:\n${policies.before.dump()}` );
			Debug( `COLLECTED early terminals:\n${terminals.before.dump()}` );
			Debug( `COLLECTED late terminals:\n${terminals.after.dump()}` );
			Debug( `COLLECTED late policies:\n${policies.after.dump()}` );
		}

		policies.before.optimizeByPrefix();
		policies.after.optimizeByPrefix();

		api.router.policies = policies;
		api.router.terminals = terminals.before.concat( terminals.after ).optimizeByPrefix();

		if ( debug ) {
			Debug( `CONFIGURED early policies:\n${api.router.policies.before.dump()}` );
			Debug( `CONFIGURED terminals:\n${api.router.terminals.dump()}` );
			Debug( `CONFIGURED late policies:\n${api.router.policies.after.dump()}` );
		}
	}

	/**
	 * Collects all provided definitions of routes sorted properly.
	 *
	 * @param {HitchyComponentHandle[]} modules
	 * @param {HitchyRouteComponentTablesNormalized[]} policiesPerModule
	 * @param {HitchyRouteComponentTablesNormalized[]} terminalsPerModule
	 * @param {HitchyRouteDescriptorSet[]} blueprintsPerModule
	 * @param {HitchyRouteComponentTablesNormalized[]} customPolicies
	 * @param {HitchyRouteComponentTablesNormalized[]} customTerminals
	 * @returns {{policies: OrderedQueue, terminals: OrderedQueue}}
	 * @private
	 */
	function _sortDefinitions( modules, policiesPerModule, terminalsPerModule, blueprintsPerModule, customPolicies, customTerminals ) {
		let moduleCount = modules.length;

		let policies = new OrderedQueue( moduleCount );
		let terminals = new OrderedQueue( moduleCount );

		for ( let i = 0; i < moduleCount; i++ ) {
			let policyMaps = policiesPerModule[i];
			let terminalMaps = terminalsPerModule[i];
			let blueprintMap = blueprintsPerModule[i];

			_mapTransfer( policies.getOnModule( i, "before", new Map() ), policyMaps.before );
			_mapTransfer( policies.getOnModule( i, "after", new Map() ), policyMaps.after );

			_mapTransfer( terminals.getOnModule( i, "before", new Map() ), terminalMaps.before );
			_mapTransfer( terminals.getOnModule( i, "after", new Map() ), terminalMaps.after );

			_mapTransfer( terminals.getInnerSlot( new Map() ), blueprintMap );
		}

		for ( let s = ["early", "before", "after", "late"], length = 4, i = 0; i < length; i++ ) {
			let stage = s[i];

			_mapTransfer( policies.getCustomSlot( stage, new Map() ), customPolicies[stage] );
			_mapTransfer( terminals.getCustomSlot( stage, new Map() ), customTerminals[stage] );
		}

		return {
			policies: policies.compact( _isNonEmptyMap ),
			terminals: terminals.compact( _isNonEmptyMap ),
		};
	}

	/**
	 * Copies all elements from source map to target map.
	 *
	 * @param {Map} target
	 * @param {Map} source
	 * @private
	 */
	function _mapTransfer( target, source ) {
		source.forEach( ( value, key ) => target.set( key, value ) );
	}

	/**
	 * Detects if provided item is a map with elements.
	 *
	 * @param {Map} map
	 * @returns {boolean}
	 * @private
	 */
	function _isNonEmptyMap( map ) {
		return map && map.size > 0;
	}

	/**
	 * Compiles route definitions into sorted lists of compiled routes grouped
	 * by HTTP method.
	 *
	 * @param {OrderedQueue} stages
	 * @param {Route} routeClass
	 * @returns {{before:RoutesPerMethod, after:RoutesPerMethod}}
	 * @private
	 */
	function _compileRoutes( stages, routeClass ) {
		let result = {
			before: new RoutesPerMethod(),
			after: new RoutesPerMethod(),
		};

		let defined = 0,
			valid = 0;

		for ( let names = [ "before", "after" ], n = 0; n < 2; n++ ) {
			let name = names[n];
			let maps = stages[name];

			for ( let length = maps.length, m = 0; m < length; m++ ) {
				let map = maps[m];

				for ( let [ source, target ] of map.entries() ) {
					defined++;

					let route = new routeClass( source, target, api );

					if ( route.warning ) {
						Debug( route.warning );
					}

					if ( route.isValid ) {
						valid++;

						result[name].append( route );
					}
				}
			}
		}

		if ( debug ) {
			Debug( `${valid} valid routes out of ${defined} defined ones` );
		}

		return result;
	}
};





/**
 * Describes partially meta information provided by source parser for naming
 * and preprocessing parameters embedded into request path.
 *
 * @typedef {object} HitchyRouteParameterKey
 * @property {string} name name of parameter to use in `req.params`
 * @property {boolean} repeat true if related match might describe multiple
 *           values delimited by HitchyRouteParameterKeys#delimiter.
 * @property {string} delimiter delimiter for splitting repeated parameters
 */

/**
 * Describes routing tables as provided by modules discovered and loaded as
 * hitchy components.
 *
 * @typedef {object} HitchyRouteComponentTables
 * @property {HitchyRouteDescriptorSet} [before]
 * @property {HitchyRouteDescriptorSet} [after]
 * @property {HitchyRouteDescriptorSet} [early]
 * @property {HitchyRouteDescriptorSet} [late]
 */

/**
 * Describes normalized set of routing tables provided by modules discovered and
 * loaded as hitchy components.
 *
 * @typedef {object} HitchyRouteComponentTablesNormalized
 * @property {HitchyRouteDescriptorSet} before
 * @property {HitchyRouteDescriptorSet} after
 * @property {HitchyRouteDescriptorSet} [early]
 * @property {HitchyRouteDescriptorSet} [late]
 */

/**
 * Describes source of route.
 *
 * Every such source descriptor consists of URL path to be matched, optionally
 * preceded by HTTP method to be required for matching this route.
 *
 * * HTTP method might be omitted to match any method.
 * * URL path may use patterns for extracting named parameters embedded in URL.
 *
 * @typedef {string} HitchyRouteSourceDescriptor
 */

/**
 * Describes simple target selector.
 *
 * Simple selector strings contain name of controller and name of controller's
 * method separated by single period.
 *
 * @typedef {string} HitchyRouteTargetDescriptorSimple
 */

/**
 * Describes method of controller to be invoked on matching some route.
 *
 * @typedef {object} HitchyRouteTargetDescriptorComplex
 * @property {string} controller name of controller
 * @property {string} method name of controller's method to invoke on matching route
 */

/**
 * Describes some method to invoked on matching route using reference on
 * function itself.
 *
 * @typedef {HitchyRouteTargetFilter|HitchyRouteTargetResponder} HitchyRouteTargetDescriptorReference
 */

/**
 * Combines all sorts of probable route target descriptors.
 *
 * @typedef {HitchyRouteTargetDescriptorSimple|HitchyRouteTargetDescriptorComplex|HitchyRouteTargetDescriptorReference|Route} HitchyRouteTargetDescriptor
 */

/**
 * Maps descriptions of route sources into related targets to be invoked on
 * matching source.
 *
 * @typedef {object<HitchyRouteSourceDescriptor,HitchyRouteTargetDescriptor>|HitchyRoute[]} HitchyRouteDescriptorSet
 */

/**
 * Maps descriptions of route sources into related targets to be invoked on
 * matching source.
 *
 * @typedef {Map<HitchyRouteSourceDescriptor,HitchyRouteTargetDescriptor>} HitchyRouteDescriptorSetNormalized
 */

// --- parsed route types ---

/**
 * Describes part of route to be matched against some actual URL path for
 * choosing related route on match.
 *
 * @typedef {object} HitchyRouteSource
 * @property {string} method HTTP method route is bound to (might be ALL or *)
 * @property {string} prefix initial static part of URL path to match
 * @property {RegExp} pattern pattern to test actual URL path for match
 * @property {HitchyRouteParameterKey[]} keys
 * @property {{source:HitchyRouteSourceDescriptor, target:HitchyRouteTargetDescriptor}} definition
 */

/**
 * Describes function to be invoked on matching some related route source to
 * preprocess or filter some request prior to processing target.
 *
 * @typedef {function(this:HitchyRequestContext, request:IncomingMessage, response:ServerResponse, next:function(error:Error=)=):?Promise} HitchyRouteTargetFilter
 */

/**
 * Describes function to be invoked on matching some related route source.
 *
 * @typedef {function(this:HitchyRequestContext, request:IncomingMessage, response:ServerResponse):?Promise} HitchyRouteTargetResponder
 */

/**
 * Combines a source to be tested on some actual URL path with function to be
 * invoked on matching for preprocessing matching request.
 *
 * @typedef {object} HitchyRouteFilter
 * @extends {HitchyRouteSource}
 * @property {HitchyRouteTargetFilter} target
 */

/**
 * Combines a source to be tested on some actual URL path with function to be
 * invoked on matching for responding eventually to matching request.
 *
 * @typedef {object} HitchyRouteResponder
 * @extends {HitchyRouteSource}
 * @property {HitchyRouteTargetResponder} target
 */

/**
 * Describes single route prepared for improved processing.
 *
 * @typedef {HitchyRouteFilter|HitchyRouteResponder} HitchyRoute
 */

/**
 * Described ordered set of prepared routes.
 *
 * @typedef {HitchyRoute[]} HitchyRouteSet
 */

/**
 * Described set of ordered sets of prepared routes.
 *
 * @typedef {HitchyRouteSet[]} HitchyRouteSets
 */

/**
 * Described map of HTTP method into one or more sets each consisting of a set
 * of prepared routes.
 *
 * @typedef {object<string,HitchyRouteSets>} HitchyRouteSetsPerMethod
 */

/**
 * Provides context information for processing routing definitions.
 *
 * @typedef {object} HitchyRouteParserContext
 * @property {boolean} isPolicyRouting true if policy-related routes are parsed
 * @property {string} collectionName name of configuration to use and of routing table resulting routes are written to
 * @property {string} singularName singular name of folders providing routes for context
 * @property {string} pluralName singular name of folders providing routes for context
 * @property {RegExp} tailPattern pattern matching (optional) tail of filenames/classes implementing targets for parsed routes
 */
