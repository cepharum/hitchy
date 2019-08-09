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
const File = require( "fs" );

const { validateFolders } = require( "./utility" );

/**
 * Discovers additional components distributed with core framework.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {Promise<string[]>} promises pathnames of modules probably containing hitchy extensions
 */
module.exports = function( options ) {
	// const api = this;

	return _bootstrapDiscoverCore;

	/**
	 * Detects subfolders of selected root folder probably containing components
	 * for extending hitchy.
	 *
	 * Fetches sub folders of any immediate or mediate sub folder named
	 * "node_modules" in selected project directory.
	 *
	 * @returns {Promise<string[]>} promises pathnames of hitchy extension candidates
	 */
	function _bootstrapDiscoverCore() {
		return new Promise( ( resolve, reject ) => {
			const coreFolder = Path.resolve( options.hitchyFolder, "core" );

			File.readdir( coreFolder, {}, ( error, entries ) => {
				if ( error ) {
					reject( error );
				} else {
					const numEntries = entries.length;
					const filtered = new Array( numEntries );
					let write = 0;

					for ( let read = 0; read < numEntries; read++ ) {
						const entry = String( entries[read] ).trim();

						switch ( entry[0] ) {
							case "@" :
							case "." :
								break;

							default :
								filtered[write++] = Path.resolve( coreFolder, entry );
						}
					}

					filtered.splice( write );

					validateFolders( filtered ).then( resolve ).catch( reject );
				}
			} );
		} );
	}
};
