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

const File = require( "fs" );
const Path = require( "path" );
const _    = require( "lodash" );
const Log  = require( "debug" )( "extensions" );

/**
 * Discovers extensions in context of selected/current project.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Promise} promises set of discovered extensions
 */
module.exports = function bootstrapDiscoverExtensions( options ) {
	return findProjectFolder()
		.then( discoverExtensionCandidates.bind( this, options ) )
		.then( readPackageData.bind( this, options ) )
		.then( filterHitchyExtensions.bind( this, options ) );
};

/**
 * Fetches sub folders of any immediate or mediate sub folder named
 * "node_modules" in selected project directory.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @param {string} projectPathname
 * @returns {Promise<string[]>} promises pathnames of hitchy extension candidates
 */
function discoverExtensionCandidates( options, projectPathname ) {
	if ( options.projectFolder ) {
		options.projectFolder = projectPathname;
	}

	return this.utility.findDirectories( projectPathname, "node_modules/*" );
}

/**
 * Reads package.json files of all detected hitchy extension candidates.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @param {string[]} modulePathnames pathnames of hitchy extension candidates
 * @returns {Promise.<HitchyExtensionHandle[]>} promises package data of all candidates
 */
function readPackageData( options, modulePathnames ) {
	return Promise.all( modulePathnames.map( function( modulePathname ) {
		let file = {
			folder: modulePathname,
			name: Path.basename( modulePathname ),
		};

		return new Promise( function( resolve ) {
			File.readFile( Path.resolve( file.folder, "package.json" ), function( error, content ) {
				if ( error ) {
					Log( "failed reading %s", file.name );
				} else {
					try {
						file.data = JSON.parse( content.toString( "utf8" ) );
					} catch ( e ) {
						Log( "failed parsing %s", file.name );
					}
				}

				resolve( file );
			} );
		} );
	} ) );
}

/**
 * Drops all hitchy extension candidates not describing some hitchy extension
 * actually.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @param {HitchyExtensionHandle[]} moduleHandles
 * @returns {HitchyExtensionHandle[]}
 */
function filterHitchyExtensions( options, moduleHandles ) {
	let read, write, handle,
	    length   = moduleHandles.length,
	    filtered = new Array( length );

	for ( read = write = 0; read < length; read++ ) {
		handle = moduleHandles[read];

		if ( handle && handle.data && handle.data.hitchy && typeof handle.data.hitchy === "object" ) {
			filtered[write++] = handle;
		}
	}

	filtered.splice( write, length - write );

	return filtered;
}



/**
 * @typedef {object} HitchyExtensionHandle
 * @property {string} folder absolute filename of extension module's package.json
 * @property {string} name name of folder containing extension module
 * @property {object} data content of extension module's package.json
 */
