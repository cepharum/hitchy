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

const _ = require( "lodash" );

module.exports = function( options ) {

	if ( options ) {
		options = {};
	}

	return new Promise( function( resolve, reject ) {
		let Api = {
			runtime: {
				config: {},
				models: {},
				controllers: {},
				services: {},
				policies: {}
			},
			components: []
		};

		Promise.all(
			// load all core components
			["bootstrap", "responder", "router"]
				.map( function( moduleName ) {
					return Promise.resolve( require( "./" + moduleName ).call( Api, options ) )
						.then( function( moduleApi ) {
							Api[moduleName] = Object.seal( moduleApi );
						} );
				} ) )
			// discover all extensions
			.then( function() {
				return Api.bootstrap.discover( options );
			} )
			// configure all components
			.then( function() {
				return Api.bootstrap.configure( options );
			} )
			// initialize components
			.then( function() {
				return Api.bootstrap.initialize( options );
			} )
			// finally provide sealed API
			.then( function() {
				resolve( Object.seal( Api ) );
			}, reject );
	} );

};

/**
 * @typedef {object} HitchyAPI
 * @property {HitchyRuntime} runtime
 * @property {HitchyComponent[]} components
 * @property {HitchyBootstrapAPI} bootstrap
 * @property {HitchyResponderAPI} responder
 * @property {HitchyRouterAPI} router
 * @property {HitchyUtilityAPI} utility
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
 * @property {?string} rootFolder selects folder of project containing
 *           application to be presented by Hitchy
 */
