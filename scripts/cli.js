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

const Args = require( "minimist" )( process.argv.slice( 2 ) );
const LogLevels = require( "log-levels" );

const command = Args._.shift() || "start";

if ( Args.help || Args.h ) {
	usage();
} else {
	if ( Args.quiet ) {
		process.env.DEBUG = "-*";
	} else if ( Args["log-level"] || !process.env.DEBUG ) {
		process.env.DEBUG = LogLevels[Args["log-level"] || "INFO"] || Args["log-level"];
	}

	process.on( "unhandledRejection", _unhandledRejection );
	process.on( "uncaughtException", _unhandledException );

	/**
	 * @type {HitchyOptions}
	 */
	const options = {
		debug: Boolean( Args.debug ),
	};

	if ( Args.project ) {
		options.projectFolder = Args.project;
	}

	require( "../tools/triangulate" )( options, process.cwd() )
		.then( _options => {
			switch ( command ) {
				case "start" :
					require( "./cli-commands/start" )( _options, Args );
					break;

				default :
					usage();
			}
		} )
		.catch( error => {
			console.error( `discovering runtime context failed: ${error.message}` );
		} );
}

/**
 * Dumps help on stderr.
 *
 * @returns {void}
 */
function usage() {
	console.error( `
Usage: hitchy <action> [ options ]

Supported actions are:

 start    Start presentation application in current folder.
 
Default action is "start".

Common options are:

 --project=path       Selects directory containing hitchy-based project to 
                      control. Defaults to current working directory.
 --debug              Enables noisy logging for debugging purposes.
 --log-level=names    Controls logging facilities (see npm package "debug" or 
                      use DEBUG2, DEBUG, INFO, NOTICE, WARNING, ERROR, ALERT or
                      CRITICAL).
 
Action "start" supports additional options:
 
 --plugins=path       Selects directory containing node_modules folder with 
                      Hitchy plugins to discover. Defaults to project's folder.
 --plugin=path        Requests to discover plugin in provided folder explicitly.
                      This option can be used multiple times.
 --explicit-only      Limits discovered plugins to those provided via --plugin.
 --depend-on=role     Selects plugin role to depend on explicitly. This option
                      can be used multiple times.
 --injector=name      Picks injector to use (default: "node", may be "express").
 --port=number        Chooses port to listen on for incoming requests.
 --ip=address         Chooses IP address to listen on for incoming requests.
 --quiet              Suppresses output regarding successful start of service.
 --sslKey=file        Selects file with SSL key for serving over HTTPS.
 --sslCert=file       Selects file with SSL certificate for serving over HTTPS.
 --sslCaCert=file     Selects file with SSL chain certificates.

` );
}

/**
 * Dumps information on unhandled promise rejection on stderr.
 *
 * @param {Error} reason reason for rejecting promise
 * @param {Promise} promise rejected but unhandled promise instance
 * @returns {void}
 * @private
 */
function _unhandledRejection( reason, promise ) {
	console.error( "unhandled rejection of promise", reason, promise );
}

/**
 * Dumps information on unhandled exception on stderr.
 *
 * @param {Error} error thrown error
 * @returns {void}
 * @private
 */
function _unhandledException( error ) {
	console.error( "unhandled exception", error );
}



/**
 * @typedef {object<string,(string|boolean)>} HitchyCLIOptionArguments
 */

/**
 * @typedef {object} HitchyCLIArguments
 * @extends {HitchyCLIOptionArguments}
 * @property {string[]} _ non-option arguments
 */

