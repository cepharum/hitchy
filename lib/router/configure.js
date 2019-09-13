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

const { PolicyRoute, TerminalRoute } = require( "./types/route" );
const { RoutesPerMethod } = require( "./types/list" );

const OrderedQueue = require( "../utility/ordered-queue" );


/**
 * Implements bootstrap stage collecting routing configuration from discovered
 * plugins and current application for compiling it into optimized routing tables.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {Function} function for collecting and compiling routing configuration
 */
module.exports = function( options ) {
	const that = this;
	const Debug = that.log( "hitchy:debug" );
	const debug = options.debug;

	return _routingConfigure;



	/**
	 * Initializes sorted routing table from routes provided in configuration
	 *
	 * @param {HitchyPluginHandle[]} plugins lists discovered plugins
	 * @param {HitchyRoutePluginTablesNormalized[]} policiesPerPlugin lists defined policy routings per plugin
	 * @param {HitchyRoutePluginTablesNormalized[]} terminalsPerPlugin lists defined terminal routings per plugin
	 * @param {HitchyRouteDescriptorSet[]} blueprintsPerPlugin lists defined blueprint routings per plugin
	 * @param {HitchyRoutePluginTablesNormalized[]} customPolicies lists policy routings of current application
	 * @param {HitchyRoutePluginTablesNormalized[]} customTerminals lists terminal routings of current application
	 * @returns {void}
	 */
	function _routingConfigure( plugins, policiesPerPlugin, terminalsPerPlugin, blueprintsPerPlugin, customPolicies, customTerminals ) {
		// put all defined routes into proper order
		let { policies, terminals } = _sortDefinitions( plugins, policiesPerPlugin, terminalsPerPlugin, blueprintsPerPlugin, customPolicies, customTerminals );

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
		policies.after.optimizeByPrefix( true );

		that.router.policies = policies;
		that.router.terminals = terminals.before.concat( terminals.after ).optimizeByPrefix();

		if ( debug ) {
			Debug( `CONFIGURED early policies:\n${that.router.policies.before.dump()}` );
			Debug( `CONFIGURED terminals:\n${that.router.terminals.dump()}` );
			Debug( `CONFIGURED late policies:\n${that.router.policies.after.dump()}` );
		}
	}

	/**
	 * Collects all provided definitions of routes sorted properly.
	 *
	 * @param {HitchyPluginHandle[]} plugins lists discovered plugins
	 * @param {HitchyRoutePluginTablesNormalized[]} policiesPerPlugin lists defined policy routings per plugin
	 * @param {HitchyRoutePluginTablesNormalized[]} terminalsPerPlugin lists defined terminal routings per plugin
	 * @param {HitchyRouteDescriptorSet[]} blueprintsPerPlugin lists defined blueprint routings per plugin
	 * @param {HitchyRoutePluginTablesNormalized[]} customPolicies lists policy routings of current application
	 * @param {HitchyRoutePluginTablesNormalized[]} customTerminals lists terminal routings of current application
	 * @returns {{policies: OrderedQueue, terminals: OrderedQueue}} grouped and sorted definitions of policy and terminal routings
	 * @private
	 */
	function _sortDefinitions( plugins, policiesPerPlugin, terminalsPerPlugin, blueprintsPerPlugin, customPolicies, customTerminals ) {
		const pluginCount = plugins.length;

		const policies = new OrderedQueue( pluginCount );
		const terminals = new OrderedQueue( pluginCount );

		for ( let i = 0; i < pluginCount; i++ ) {
			const policyMaps = policiesPerPlugin[i];
			const terminalMaps = terminalsPerPlugin[i];
			const blueprintMap = blueprintsPerPlugin[i];

			_mapTransfer( policies.getOnPlugin( i, "before", new Map() ), policyMaps.before );
			_mapTransfer( policies.getOnPlugin( i, "after", new Map() ), policyMaps.after );

			_mapTransfer( terminals.getOnPlugin( i, "before", new Map() ), terminalMaps.before );
			_mapTransfer( terminals.getOnPlugin( i, "after", new Map() ), terminalMaps.after );

			_mapTransfer( terminals.getInnerSlot( new Map() ), blueprintMap );
		}

		for ( let s = [ "early", "before", "after", "late" ], length = 4, i = 0; i < length; i++ ) {
			const stage = s[i];

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
	 * @param {Map} target target map
	 * @param {Map} source source map
	 * @returns {void}
	 * @private
	 */
	function _mapTransfer( target, source ) {
		source.forEach( ( value, key ) => target.set( key, value ) );
	}

	/**
	 * Detects if provided item is a map with elements.
	 *
	 * @param {Map} map map to inspect
	 * @returns {boolean} true if map isn't empty
	 * @private
	 */
	function _isNonEmptyMap( map ) {
		return map && map.size > 0;
	}

	/**
	 * Compiles route definitions into sorted lists of compiled routes grouped
	 * by HTTP method.
	 *
	 * @param {OrderedQueue} stages routing tables managers per routing stage
	 * @param {class<Route>} RouteClass class of routes to compile
	 * @returns {{before:RoutesPerMethod, after:RoutesPerMethod}} routes grouped per method and split into stages accordingly
	 * @private
	 */
	function _compileRoutes( stages, RouteClass ) {
		const result = {
			before: new RoutesPerMethod(),
			after: new RoutesPerMethod(),
		};

		let defined = 0,
			valid = 0;

		for ( let names = [ "before", "after" ], n = 0; n < 2; n++ ) {
			const name = names[n];
			const maps = stages[name];

			for ( let length = maps.length, m = 0; m < length; m++ ) {
				const map = maps[m];

				for ( const [ source, target ] of map.entries() ) {
					const isList = Array.isArray( target );
					const targets = isList ? target : [target];
					const numTargets = targets.length;

					if ( RouteClass === TerminalRoute && numTargets > 1 ) {
						throw new TypeError( "invalid definition of multiple targets for single terminal route" );
					}

					for ( let k = 0; k < numTargets; k++ ) {
						const currentTarget = targets[k];

						defined++;

						const route = new RouteClass( source, currentTarget, that );

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
 * Describes routing tables as provided by discovered plugins.
 *
 * @typedef {object} HitchyRoutePluginTables
 * @property {HitchyRouteDescriptorSet} [before]
 * @property {HitchyRouteDescriptorSet} [after]
 * @property {HitchyRouteDescriptorSet} [early]
 * @property {HitchyRouteDescriptorSet} [late]
 */

/**
 * Describes normalized set of routing tables provided by plugins.
 *
 * @typedef {object} HitchyRoutePluginTablesNormalized
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

/* eslint-disable max-len */
/**
 * Describes function to be invoked on matching some related route source to
 * preprocess or filter some request prior to processing target.
 *
 * @typedef {function(this:HitchyRequestContext, request:IncomingMessage, response:ServerResponse, next:function(error:Error=)=):?Promise} HitchyRouteTargetFilter
 */
/* eslint-enable max-len */

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
