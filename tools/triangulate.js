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

const File = require( "fs" );
const Path = require( "path" );
const Log = require( "debug" )( "bootstrap" );

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
 * @param {HitchyOptions} options
 * @param {string=} currentWorkingDirectory
 * @returns {Promise<HitchyOptions>}
 */
module.exports = function _toolTriangulate( options, currentWorkingDirectory ) {
	// always choose current hitchy framework instance to do the job
	options.hitchyFolder = Path.resolve( __dirname, ".." );


	// always prefer explicitly provided project folder the most
	if ( options.hasOwnProperty( "projectFolder" ) ) {
		// but require existing project folder
		return new Promise( function( resolve, reject ) {
			File.stat( options.projectFolder, function( error, stat ) {
				if ( error ) {
					reject( error );
				} else if ( !stat.isDirectory() ) {
					reject( new Error( "selected project folder does not exist" ) );
				} else {
					resolve( options );
				}
			} );
		} );
	}


	// if missing explicit selection of project folder:
	// 1. prefer context of current main script
	return _findDirectory( currentWorkingDirectory || Path.dirname( require.main.filename ), "node_modules", "..", true )
		.catch( function() {
			// 2. check context current instance of hitchy is running in
			return _findDirectory( Path.resolve( __dirname, "../../.." ), "node_modules", "../.." );
		} )
		.then( function( pathname ) {
			if ( !pathname ) {
				Log( "can't detect root folder of current project" );
				throw new Error( "detecting project root folder failed" );
			}

			options.projectFolder = pathname;

			return options;
		} );



	/**
	 * Tests if given pathname contains selected sub directory or not.
	 *
	 * If directory is found but `step` is provided additionally pathname is
	 * resolved to addressing different directory using relative pathname in
	 * `step` for repeating this test. This iteration stops when test fails.
	 *
	 * @param {string} pathname
	 * @param {string} subDirectory
	 * @param {string} step
	 * @param {boolean=} keepIteratingIfFailing set true to keep iterating
	 *        until test is successful (instead of stopping on test failing)
	 * @returns {Promise<string>}
	 */
	function _findDirectory( pathname, subDirectory, step, keepIteratingIfFailing ) {
		return new Promise( function( resolve, reject ) {
			let latestMatch = null;

			testPath( pathname );

			function testPath( path ) {
				const modulesPath = Path.resolve( path, subDirectory );

				File.stat( modulesPath, function( err, stat ) {
					if ( err ) {
						switch ( err.code ) {
							case "EACCES" :
							case "ENOENT" :
								if ( latestMatch ) {
									return resolve( latestMatch );
								}
						}

						return reject( err );
					}

					const isMatch = stat.isDirectory();
					const stopTraversal = keepIteratingIfFailing ? isMatch : !isMatch;

					if ( isMatch ) {
						latestMatch = path;
					}

					if ( stopTraversal ) {
						resolve( latestMatch );
					} else if ( step ) {
						// check if current package is in use by another one
						testPath( Path.resolve( path, step ) );
					} else {
						resolve( latestMatch );
					}
				} );
			}
		} );
	}
};
