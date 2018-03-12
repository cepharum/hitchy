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

const Path = require( "path" );
const Glob = require( "glob" );

/**
 * Discovers extensions in context of selected/current project.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Promise<string[]>} promises pathnames of modules probably containing hitchy extensions
 */
module.exports = function( options ) {
	//const api = this;

	return _bootstrapDiscoverExtensions;


	/**
	 * Detects subfolders of selected root folder probably containing components
	 * for extending hitchy.
	 *
	 * Fetches sub folders of any immediate or mediate sub folder named
	 * "node_modules" in selected project directory.
	 *
	 * @returns {Promise<string[]>} promises pathnames of hitchy extension candidates
	 */
	function _bootstrapDiscoverExtensions() {
		return new Promise( function( resolve, reject ) {
			Glob( "**/node_modules/*/hitchy.json", {
				cwd: options.projectFolder,
				realpath: true,
			}, function( error, matches ) {
				if ( error ) {
					return reject( error );
				}

				const ptnTestFolders = /([\\/])node_modules\1[^\\/]+\1test(\1|$)/;

				resolve( matches
					.filter( name => !ptnTestFolders.test( name ) )
					.map( name => Path.dirname( name ) )
				);
			} );
		} );
	}
};
