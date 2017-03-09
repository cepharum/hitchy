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

const Path = require( "path" );

const Promises = require( "../tools/promise" );

/**
 * Loads hitchy framework incl. all discoverable extensions and initializes core
 * and all found extensions prior to delivering API for using framework finally.
 *
 * @param {HitchyOptions=} options options for customizing hitchy
 * @returns {Promise<HitchyAPI>} promises API of initialized hitchy web framework
 */
module.exports = function( options ) {
	if ( !options ) {
		options = {};
	}

	/** @type HitchyAPI */
	let Api = {
		runtime: {
			config: {},
			models: {},
			controllers: {},
			services: {},
			policies: {}
		},
		components: {},
		loader: _commonModulePatternLoader
	};


	// load some core components explicitly
	const Libs = ["utility", "bootstrap", "responder", "router"];

	return Promises.each( Libs, function( moduleName ) {
		return Promise.resolve( require( "./" + moduleName ).call( Api, options ) )
			.then( function( moduleApi ) {
				Object.defineProperty( Api, moduleName, {
					value: Object.seal( moduleApi ),
					enumerable: true,
				} );

				if ( moduleName === "utility" ) {
					// provide shortcut for accessing logger factory
					Object.defineProperty( Api, "log", {
						value: Api.utility.logger.get,
						enumerable: true,
					} );
				}
			} );
	} )
		// detect context framework is running in
		.then( function() {
			return Api.bootstrap.triangulate()
				// discover all further core components as well as extensions
				.then( Api.bootstrap.discover )
				// configure all components
				.then( Api.bootstrap.configure )
				// gather application API to be exposed
				.then( Api.bootstrap.expose )
				// initialize components
				.then( Api.bootstrap.initialize )
				// collect all finally desired routes
				.then( Api.bootstrap.routing )
				// finally seal and provide API
				.then( function( moduleHandles ) {
					// inject bootstrap method for shutting down properly
					Api.bootstrap.shutdown = Api.bootstrap.prepareShutdown( moduleHandles );

					return deepSeal( Api );

					function deepSeal( object ) {
						if ( object && typeof object === "object" ) {
							Object.keys( object || {} )
								.forEach( function( name ) {
									deepSeal( object[name] );
								} );

							Object.seal( object );
						}

						return object;
					}
				} );
		} )
		.catch( function( error ) {
			require( "debug" )( "bootstrap" )( "ERROR: bootstrap failed:", error );

			// keep rejecting promise chain with original error
			throw error;
		} );


	/**
	 * Loads component of current project obeying support for common module
	 * pattern (CMP).
	 *
	 * @param {string} pathname name of module to load, considered relative to
	 *        project folder, but may be absolute pathname, too
	 * @param {*[]} moduleArguments arguments to provide on support for CMP
	 * @returns {Promise<*>} promises API of loaded component
	 * @private
	 */
	function _commonModulePatternLoader( pathname, moduleArguments = [] ) {
		return new Promise( function( resolve ) {
			let moduleApi = require( Path.resolve( options.projectFolder, pathname ) );

			if ( typeof moduleApi === "function" ) {
				moduleApi = moduleApi.apply( Api, [ options ].concat( moduleArguments ) );
			}

			resolve( moduleApi );
		} );
	}
};

/**
 * @typedef {object} HitchyAPI
 * @property {HitchyRuntime} runtime
 * @property {object<string,HitchyComponent>} components
 * @property {HitchyBootstrapAPI} bootstrap
 * @property {HitchyResponderAPI} responder
 * @property {HitchyRouterAPI} router
 * @property {HitchyUtilityAPI} utility
 * @property {function(namespace:string):function} log alias for api.utility.logger.get
 * @property {function(name:string, moduleArguments:*[]):(object|function)} loader wraps require() to use on loading components from project folder (primarily to mock component loading for testing purposes)
 */

/**
 * @typedef {object} HitchyRuntime
 * @property {HitchyConfig} config
 * @property {object<string,HitchyModel>} models
 * @property {object<string,HitchyController>} controllers
 * @property {object<string,HitchyService>} services
 * @property {object<string,HitchyPolicy>} policies
 */

/**
 * @typedef {object} HitchyConfig
 */

/**
 * @typedef object HitchyOptions
 * @property {?boolean} handleErrors if true, hitchy instance is handling errors
 *           rather than passing them back into expressjs context
 * @property {?string} projectFolder selects folder of project containing
 *           application to be presented by hitchy
 * @property {string} hitchyFolder selects root folder of current instance of
 *           hitchy framework
 * @property {boolean} [debug] basically enables noisy logging for sake of debugging
 * @property {string[]} [dependencies] lists dependencies to enable for current
 *           project; replaces list in project's hitchy.json file or the default
 *           behaviour of enabling all available components
 */
