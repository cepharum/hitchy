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

const LocalApi = /** @lends HitchyUtilityFileAPI */ {
	/** @borrows _utilityFileListDirectory as HitchyUtilityFileAPI#listDirectory */
	list: _utilityFileListDirectory,

	/** @borrows _utilityFileStat as HitchyUtilityFileAPI#stat */
	stat: _utilityFileStat,

	/** @borrows _utilityFileRead as HitchyUtilityFileAPI#readFile */
	read: _utilityFileRead,

	/** @borrows _utilityFileReadMeta as HitchyUtilityFileAPI#readMetaFile */
	readMeta: _utilityFileReadMeta,
};



/**
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {HitchyUtilityFileAPI} partial API exposing file-related utilities
 */
module.exports = function( options ) { // eslint-disable-line no-unused-vars
	return LocalApi;
};



/**
 * Wraps node's `fs.readdir()` in a promise.
 *
 * @param {string} pathname pathname of folder to read entries from.
 * @returns {Promise<string[]>} found entries of folder prefixed with pathname
 */
function _utilityFileListDirectory( pathname ) {
	return new Promise( function( resolve, reject ) {
		File.readdir( pathname, ( error, entries ) => {
			if ( error ) {
				switch ( error.code ) {
					case "ENOENT" :
						resolve( [] );
						return;

					default :
						reject( error );
						return;
				}
			}

			const length = entries.length;
			const filtered = new Array( length );
			let write, name, read;

			for ( read = write = 0; read < length; read++ ) {
				name = entries[read];
				if ( name !== "." && name !== ".." ) {
					filtered[write++] = Path.resolve( pathname, name );
				}
			}

			filtered.splice( write, length - write );

			resolve( filtered );
		} );
	} );
}

/**
 * Wraps node's fs.readFile() in a promise.
 *
 * @note This method provides empty content if selected file does not exist.
 *       This special behaviour might be disabled in options by setting true
 *       property `failIfMissing`.
 *
 * @note As a special case filename might be array of elements to pass
 *       through node's `path.resolve()` first before trying to read file.
 *
 * @param {string|string[]} filename name of file or fragments of pathname to compile using Path.resolve
 * @param {{encoding:?string, flag:?string, failIfMissing:?boolean}} readOptions options customizing read operation
 * @returns {Promise<Buffer|string>} promises content of file as buffer or string
 */
function _utilityFileRead( filename, readOptions ) {
	return new Promise( function( resolve, reject ) {
		const name = Array.isArray( filename ) ? Path.resolve.apply( undefined, filename ) : filename;

		File.readFile( name, readOptions || {}, ( error, content ) => {
			if ( error ) {
				switch ( error.code ) {
					case "ENOENT" :
						if ( !( readOptions || {} ).failIfMissing ) {
							resolve( Buffer.alloc( 0 ) );
							return;
						}
				}

				reject( error );
				return;
			}

			resolve( content );
		} );
	} );
}

/**
 * Wraps node's fs.stat() in a promise.
 *
 * @note As a special case filename might be array of elements to pass
 *       through node's `path.resolve()` first before trying to read file.
 *
 * @param {string|string[]} filename name of file or fragments of pathname to compile using Path.resolve
 * @returns {Promise<Stats>} promises stats on named file
 */
function _utilityFileStat( filename ) {
	return new Promise( function( resolve, reject ) {
		const name = Array.isArray( filename ) ? Path.resolve.apply( undefined, filename ) : filename;

		File.stat( name, function( error, stats ) {
			if ( error ) {
				reject( error );
			} else {
				resolve( stats );
			}
		} );
	} );
}

/**
 * Reads hitchy meta data from file selected by file name.
 *
 * @note Just like HitchyUtilityFileAPI#readFile() this methods supports
 *       filename given as array of strings to be resolved first.
 *
 * @param {string|string[]} filename name of file or fragments of pathname to compile using Path.resolve
 * @param {HitchyFileReadMetaOptions} readOptions options customizing read operation
 * @returns {Promise.<HitchyComponentMeta>} promises normalized meta data read from file
 */
function _utilityFileReadMeta( filename, readOptions ) {
	const name = Array.isArray( filename ) ? Path.resolve.apply( undefined, filename ) : filename;

	const options = readOptions || {};

	options.encoding = "utf8";

	return _utilityFileRead( name, options )
		.then( content => {
			const _content = String( content );

			if ( _content.trim().length === 0 ) {
				// be flexible if user was providing empty file instead of
				// file with empty object
				return {};
			}

			try {
				return JSON.parse( _content );
			} catch ( error ) {
				throw new Error( "invalid JSON in file " + name );
			}
		} )
		.then( data => {
			if ( !data.hasOwnProperty( "name" ) ) {
				data.name = Path.basename( Path.dirname( name ) );
			}

			if ( !data.hasOwnProperty( "role" ) ) {
				data.role = data.name;
			}

			if ( !data.hasOwnProperty( "dependencies" ) ) {
				if ( !options.keepMissingDependencies ) {
					data.dependencies = [];
				}
			} else if ( !Array.isArray( data.dependencies ) ) {
				data.dependencies = data.dependencies ? [data.dependencies] : [];
			}

			if ( !Array.isArray( data.dependants ) ) {
				data.dependants = data.dependants ? [data.dependants] : [];
			}

			return data;
		} );
}



/**
 * @typedef {object} HitchyComponentMeta
 * @property {boolean} $valid set true on discovering component
 * @property {?string} name name of component
 * @property {?string} role role filled by component
 * @property {?string[]} dependencies roles of components this one depends on
 * @property {?string[]} dependants roles of components becoming dependants when
 *           discovering current component to be enabled on bootstrap
 */

/**
 * @typedef {object} HitchyFileReadOptions
 * @property {string} [encoding]
 * @property {string} [flag]
 * @property {boolean} [failIfMissing] set true to reject promise if file is missing
 */

/**
 * @typedef {HitchyFileReadOptions} HitchyFileReadMetaOptions
 * @property {boolean} [keepMissingDependencies] set true to disable injection
 *           of empty list of dependencies e.g. to detect if user has provided
 *           any list explicitly
 */
