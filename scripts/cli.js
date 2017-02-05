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

const Args = require( "minimist" )( process.argv.slice( 2 ) );

const command = Args._.shift() || "start";

if ( Args.help || Args.h ) {
	return usage();
}

if ( Args["log-level"] ) {
	process.env.DEBUG = Args["log-level"];
}

process.on( "unhandledRejection", _unhandledRejection );
process.on( "uncaughtException", _unhandledException );

let options = {};

if ( Args.project ) {
	options.rootFolder = Args.project;
}

require( "../tools/triangulate" )( options, process.cwd() )
	.then( function( options ) {
		switch ( command ) {
			case "start" :
				require( "./cli-commands/start" )( options, Args );
				break;

			default :
				usage();
		}
	} );


function usage() {
	console.error( `
Usage: hitchy <action> [ options ]

Supported actions are:

 start     Start presentation application in current folder.
 stop      Stop presentation of application in current folder.
 lock      Shutdown request processing but keep service running (site down).
 unlock    Re-enable request processing.
 open      Open browser requesting homepage of application.
 
Default action is "start".

Supported options are:

 --injector=name    Chooses injector to use (default: node, might be "express").
 --log-level=names  Selects active logging facilities (see npm package "debug").
` );
}

function _unhandledRejection( reason, promise ) {
	console.error( "unhandled rejection of promise", reason, promise );
}

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

