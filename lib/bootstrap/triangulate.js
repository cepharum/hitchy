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

const Tool = require( "../../tools/triangulate" );

/**
 * Provides implementation for first stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Function}
 */
module.exports = function( options ) {
	const api = this;

	return _bootstrapTriangulate;


	/**
	 * Qualifies options to properly select packages involved in running current
	 * web application.
	 *
	 * Included options are:
	 *
	 * * `projectFolder` selecting folder containing web application to be served
	 *   by hitchy
	 * * `hitchyFolder` selecting folder containing instance of hitchy framework
	 *   to be used
	 *
	 * Regarding `projectFolder` this method is choosing folder according to this
	 * list:
	 *
	 * 1. existing option named `projectFolder`
	 * 2. folder closest to current main script and containing sub "node_modules"
	 * 3. folder farthest to current instance of hitchy containing sub "node_modules"
	 *
	 * @returns {Promise<HitchyOptions>}
	 */
	function _bootstrapTriangulate() {
		// sync debug-switch in hitchy's options with environment variable used
		// by package `debug` to detect facilities enabled for logging
		let envDebug = ( process.env.DEBUG || "" ).trim().split( /(?:\s*,\s*)+/ ),
			includesAll = false;

		if ( options.debug ) {
			envDebug = envDebug.filter( i => i && i != "-debug" && i != "debug" );
			includesAll = envDebug.some( i => i == "*" );
			if ( !includesAll ) {
				envDebug.push( "debug" );
			}
		} else {
			envDebug = envDebug.filter( i => i && i != "-debug" && i != "debug" );
			includesAll = envDebug.some( i => i == "*" );
			if ( includesAll ) {
				envDebug.push( "-debug" );
			}
		}

		api.utility.logger.update( envDebug.join( "," ) );


		// use separate method for checking/detecting folders
		return Tool( options );
	}
};

