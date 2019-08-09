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

module.exports = {
	/**
	 * Renders error response or passes error back into expressjs context.
	 *
	 * @this HitchyRequestContext
	 * @param {HitchyOptions} options global options customizing Hitchy
	 * @param {Error=} error error to be handled
	 * @returns {void}
	 * @private
	 */
	errorHandler( options, error ) {
		if ( !error ) {
			_splash.call( this, options );
		} else if ( options.handleErrors ) {
			_showError.call( this, options, error );
		} else {
			this.done( error );
		}
	}
};

/**
 * Renders splash screen while hitchy framework is booting.
 *
 * @this HitchyRequestContext
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {void}
 * @private
 */
function _splash( options ) { // eslint-disable-line no-unused-vars
	const format = require( "../lib/responder/normalize/format" ).bind( this );
	const status = require( "../lib/responder/normalize/status" ).bind( this );
	const send = require( "../lib/responder/normalize/send" ).bind( this );

	status( 423 );

	format( {
		html() {
			send( `<!doctype html>
<html lang="en">
<head>
<title>Service is starting ...</title>
</head>
<body>
<h1>Welcome!</h1>
<body>This service isn't available, yet.</body>
</body>
</html>` );
		},
		json() {
			send( {
				softError: "Welcome! This service isn't available, yet."
			} );
		},
		default() {
			send( "Welcome! This service isn't available, yet." );
		}
	} );
}

/**
 * Renders simple view describing captured error.
 *
 * @this HitchyRequestContext
 * @param {HitchyOptions} options global options customizing Hitchy
 * @param {Error} error error to be shown
 * @returns {void}
 * @private
 */
function _showError( options, error ) {
	const format = require( "../lib/responder/normalize/format" ).bind( this );
	const status = require( "../lib/responder/normalize/status" ).bind( this );
	const send = require( "../lib/responder/normalize/send" ).bind( this );

	this.api.log( "hitchy:debug" )( "rendering error internally", error );

	const _error = Object.assign( {
		status: parseInt( error.code ) || 500,
		message: "unknown error"
	}, {
		status: error.status,
		message: error.message,
	} );

	status( _error.status );

	format( {
		html() {
			send( `<!doctype html>
<html lang="en">
<head>
<title>Error</title>
</head>
<body>
<h1>An error occurred!</h1>
<body>${_error.message}</body>
</body>
</html>` );
		},
		json() {
			send( {
				error: _error.message,
				code: _error.status,
			} );
		},
		text() {
			send( "Error: " + ( _error.message || "unknown error" ) );
		},
		default() {
			send( "Error: " + ( _error.message || "unknown error" ) );
		}
	} );
}
