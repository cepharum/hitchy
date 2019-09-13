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
 * Discovers extensions in context of selected/current project.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {Promise<string[]>} promises path names of packages probably containing Hitchy extensions
 */
module.exports = function( options ) {
	const that = this;
	const Info = that.log( "hitchy:bootstrap" );

	return _bootstrapDiscoverExtensions;


	/**
	 * Detects subfolders of selected root folder probably containing plugins
	 * for extending hitchy.
	 *
	 * Fetches sub folders of any immediate or mediate sub folder named
	 * "node_modules" in selected project directory.
	 *
	 * @returns {Promise<string[]>} promises pathnames of hitchy extension candidates
	 */
	function _bootstrapDiscoverExtensions() {
		const sources = [];

		if ( options.explicitExtensions ) {
			Info( "discovering extensions explicitly:", options.explicitExtensions );

			sources.push( validateFolders( options.explicitExtensions ) );
		}

		if ( !options.explicitExtensionsOnly ) {
			const extensionFolder = Path.resolve( options.extensionsFolder || options.projectFolder );

			Info( "discovering extensions in", extensionFolder );

			sources.push( searchFolder( extensionFolder ) );
		}

		return Promise.all( sources )
			.then( lists => {
				// get unique list of all found Hitchy extensions
				const names = new Map();

				lists
					.reduce( ( result, list ) => result.concat( list ), [] )
					.forEach( path => names.set( path, true ) );

				const unique = new Array( names.size );
				let index = 0;
				for ( const key of names.keys() ) {
					unique[index++] = key;
				}

				Info( `discovered ${unique.length} extension(s):`, unique );

				return unique;
			} );
	}

	/**
	 * Searches some provided folder for containing immediate and mediate
	 * dependencies in a sub-folder named `node_modules` listing pathnames of
	 * all dependencies containing file named `hitchy.json`.
	 *
	 * @param {string} base pathname of folder to be searched
	 * @returns {Promise<string[]>} promises list of path names to folders obviously containing hitchy extensions
	 */
	function searchFolder( base ) {
		return traverseDeps( Path.join( base, "node_modules" ), [], true );


		/**
		 * Fetches all entries in a folder (considered to be `node_modules`) for
		 * checking either to be folder containing some dependency or some scope
		 * of dependencies.
		 *
		 * @param {string} path pathname of folder to enumerate
		 * @param {string[]} matches collects all dependencies considered hitchy extension
		 * @param {boolean} expectScopes true if folder is expected to contained scopes of dependencies
		 * @returns {Promise<string[]>} promises all matches in current folder collected in provided array
		 */
		function traverseDeps( path, matches, expectScopes ) {
			return new Promise( ( onDone, onFail ) => {
				File.readdir( path, {}, ( error, entries ) => {
					if ( error ) {
						switch ( error.code ) {
							case "ENOTDIR" :
							case "ENOENT" :
								onDone( matches );
								break;

							default :
								onFail( error );
						}
					} else {
						checkDep( {
							path,
							matches,
							onDone,
							onFail,
							expectScopes,
							entries,
							numOfEntries: entries.length,
						}, 0 );
					}
				} );
			} );
		}

		/**
		 * @typedef {object} DepsCheckerContext
		 * @property {string} path path name of folder containing entries to be checked
		 * @property {string[]} entries list of entries to be checked
		 * @property {int} numOfEntries number of entries in `entries`
		 * @property {boolean} expectScopes true if entries may include folders containing dependencies from a scope (starting with `@`)
		 * @property {string[]} matches collected path names of all extensions found so far
		 * @property {function(string[])} onDone callback to invoke when traversing dependencies has finished
		 * @property {function(Error)} onFail callback to invoke when some error occurred
		 */

		/**
		 * Checks single element in a folder for either being a scope containing
		 * related dependencies or some dependency considered hitchy extension.
		 *
		 * @note This method asynchronously iterates over some provided list of
		 *       element names. When finished it invokes some callback provided
		 *       in context as `onDone`.
		 *
		 * @param {DepsCheckerContext} ctx aggregates all information required for asynchronous iteration over fetched elements of a folder
		 * @param {int} current index of element in list of fetched elements to be checked next
		 * @returns {void}
		 */
		function checkDep( ctx, current ) {
			if ( current >= ctx.numOfEntries ) {
				// processed last entry before
				ctx.onDone( ctx.matches );
				return;
			}

			const entry = ctx.entries[current];
			if ( entry[0] === "." ) {
				// ignore hidden elements
				process.nextTick( checkDep, ctx, current + 1 );
				return;
			}

			const dependencyFolder = Path.resolve( ctx.path, entry );

			if ( entry[0] === "@" ) {
				// got entry that looks like a scope's folder
				if ( ctx.expectScopes ) {
					// look for scoped extensions, too
					traverseDeps( dependencyFolder, ctx.matches, false )
						.then( () => process.nextTick( checkDep, ctx, current + 1 ) )
						.catch( ctx.onFail );
				} else {
					process.nextTick( checkDep, ctx, current + 1 );
				}
			} else {
				File.stat( Path.resolve( dependencyFolder, "hitchy.json" ), ( error, info ) => {
					if ( error ) {
						switch ( error.code ) {
							case "ENOENT" :
								// `hitchy.json` does not exist as a file, but
								// got some containing directory
								// -> check for local node_modules below
								break;

							case "ENOTDIR" :
								// tested dependency folder is not even a folder
								// -> skip completely
								process.nextTick( checkDep, ctx, current + 1 );
								break;

							default :
								ctx.onFail( error );
								return;
						}
					} else if ( info.isFile() ) {
						ctx.matches.push( dependencyFolder );
					}

					traverseDeps( Path.resolve( dependencyFolder, "node_modules" ), ctx.matches, true )
						.then( () => process.nextTick( checkDep, ctx, current + 1 ) )
						.catch( ctx.onFail );
				} );
			}
		}
	}
};
