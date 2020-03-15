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

const PromiseUtils = require( "promise-essentials" );

const logInfo = require( "debug" )( "hitchy:cli:info" );


/**
 * Implements CLI action for starting Hitchy application.
 *
 * @param {HitchyOptions} options global options customizing Hitchy
 * @param {HitchyCLIArguments} args arguments passed for processing in context of start action
 * @returns {Promise} promises action finished processing
 */
module.exports = function( options, args ) {
	const { BasicServer } = require( "../../lib/server" );

	if ( args.plugins || args.extensions ) {
		options.pluginsFolder = args.plugins || args.extensions;
	}

	if ( args.plugin ) {
		options.explicitPlugins = Array.isArray( args.plugin ) ? args.plugin : [args.plugin];
	}

	if ( args["explicit-only"] ) {
		options.explicitPluginsOnly = true;
	}

	if ( args["depend-on"] ) {
		options.dependencies = Array.isArray( args["depend-on"] ) ? args["depend-on"] : [args["depend-on"]];
	}

	if ( args.injector ) {
		return start();
	}

	/*
	 * check if current project contains some script called server.js or
	 * app.js or main.js and invoke this instead of trying to run some own
	 * simple server internally.
	 */
	const files = [ "server.js", "app.js", "main.js" ]
		.map( name => Path.resolve( options.projectFolder, name ) );

	return PromiseUtils.find( files, function( filename ) {
		return new Promise( ( resolve, reject ) => {
			File.stat( filename, ( error, stat ) => {
				if ( error ) {
					switch ( error.code ) {
						case "ENOENT" :
							resolve( false );
							return;

						default :
							reject( error );
							return;
					}
				}

				resolve( stat.isFile() );
			} );
		} );
	} )
		.then( start, cause => {
			console.error( "error while looking for start script: " + ( cause.message || cause || "unknown error" ) );
			process.exitCode = 1;
		} );


	/**
	 * Starts server preferring some found script over internal basic server.
	 *
	 * @param {string=} scriptname filename of script to run instead of internal server
	 * @returns {Promise} promises result of having run server (this blocks if server stays in foreground!)
	 */
	function start( scriptname = null ) {
		if ( scriptname ) {
			return new Promise( ( resolve, reject ) => {
				logInfo( `invoking custom start script ${scriptname} ...` );

				const child = require( "child_process" ).fork( scriptname, {
					cwd: options.projectFolder,
					env: process.env,
				} );

				child.on( "exit", ( status, signal ) => {
					if ( status === 0 ) {
						resolve();
					} else {
						reject( new Error( "application script exited on " + ( status || signal ) ) );
					}
				} );
			} );
		}


		return BasicServer( options, args, () => {
			logInfo( "exiting with %d", process.exitCode );

			process.exit();
		} );
	}
};
