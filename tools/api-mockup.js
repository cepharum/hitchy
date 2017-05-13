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
const OS = require( "os" );

const _ = require( "lodash" );

/**
 * Helps with loading modules for testing purposes providing some mockup API as
 * part of common module pattern.
 *
 * @param {string=} projectFolder pathname to contain project, omit for temp folder of OS
 * @param {HitchyAPI=} apiOverlay custom API parts to mock instead of actual ones
 * @returns {function(name:string):object}
 */
module.exports = function _apiMockUpGenerator( { projectFolder = OS.tmpdir(), apiOverlay = {} } = {} ) {

	/**
	 * Supports loading module of hitchy project providing fake options and API.
	 *
	 * @returns {object} API of module
	 */
	return function _apiMockUpLoader( name, moduleArguments = [] ) {
		const options = {
			// always choose current hitchy framework instance to do the job
			hitchyFolder: Path.resolve( __dirname, ".." ),

			// choose optionally provided project folder or stick with temp
			// folder by default
			projectFolder: projectFolder,
		};

		/** @type HitchyAPI */
		const Api = _.merge( {
			runtime: {
				config: {},
				models: {},
				controllers: {},
				services: {},
				policies: {}
			},
			components: {},
			utility: {},
			bootstrap: {},
			responder: {},
			router: {}
		}, apiOverlay, {
			loader: _apiMockUpLoader,
			log: function( namespace ) {
				return require( "debug" )( namespace );
			}
		} );


		let api = require( Path.relative( __dirname, Path.resolve( options.hitchyFolder, name ) ) );
		if ( typeof api === "function" ) {
			return api.apply( Api, [ options ].concat( moduleArguments ) );
		}

		return api;
	};
};
