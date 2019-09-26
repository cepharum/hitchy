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

const ObjectTools = require( "../tools/object" );
const LibTools = require( "../tools/library" );

/**
 * Loads hitchy framework incl. all discoverable extensions and initializes core
 * and all found extensions prior to delivering API for using framework finally.
 *
 * @param {HitchyOptions=} options options for customizing hitchy
 * @returns {Promise<HitchyAPI>} promises API of initialized hitchy web framework
 */
module.exports = function( options = {} ) {
	/** @type HitchyAPI */
	const Api = LibTools.createAPI( options );

	// load core components and expose in API instance
	return LibTools.load( Api, __dirname, options )
		// detect context framework is running in
		.then( () => {
			const Bootstrap = Api.bootstrap;

			return Bootstrap.triangulate()
				// discover all further core components as well as plugins
				.then( Bootstrap.discover )
				// gather application API to be exposed
				.then( Bootstrap.expose )
				// configure all plugins
				.then( Bootstrap.configure )
				// initialize plugins
				.then( Bootstrap.initialize )
				// collect all finally desired routes
				.then( Bootstrap.routing )
				// finally seal and provide compiled API
				.then( plugins => {
					// inject bootstrap method for shutting down properly
					Bootstrap.shutdown = Bootstrap.prepareShutdown( plugins );

					return ObjectTools.deepSeal( Api, path => path[0] !== "data" );
				} );
		} )
		.catch( error => {
			require( "debug" )( "bootstrap" )( "ERROR: bootstrap failed:", error );

			// keep rejecting promise chain with original error
			throw error;
		} );
};
