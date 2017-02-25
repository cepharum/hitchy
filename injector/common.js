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

const _     = require( "lodash" );
const Debug = require( "debug" )( "debug" );

module.exports = {
	/**
	 * Renders error response or passes error back into expressjs context.
	 *
	 * @this HitchyRequestContext
	 * @param {HitchyOptions} options
	 * @param {Error=} error
	 * @private
	 */
	errorHandler: function( options, error ) {
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
 * @param {HitchyOptions} options
 * @private
 */
function _splash( options ) {
	let format = require( "./normalize/format" ).bind( this );
	let status = require( "./normalize/status" ).bind( this );
	let send   = require( "./normalize/send" ).bind( this );

	status( 423 );

	format( {
		html:    function() {
			send( `<!doctype html>
<html>
<head>
<title>Service is starting ...</title>
</head>
<body>
<h1>Welcome!</h1>
<body>This service isn't available, yet.</body>
</body>
</html>` );
		},
		json:    function() {
			send( {
				softError: "Welcome! This service isn't available, yet."
			} );
		},
		default: function() {
			send( "Welcome! This service isn't available, yet." );
		}
	} );
}

/**
 * Renders simple view describing captured error.
 *
 * @this HitchyRequestContext
 * @param {HitchyOptions} options
 * @param {Error} error
 * @private
 */
function _showError( options, error ) {
	let format = require( "../lib/responder/normalize/format" ).bind( this );
	let status = require( "../lib/responder/normalize/status" ).bind( this );
	let send   = require( "../lib/responder/normalize/send" ).bind( this );

	Debug( "rendering error internally", error );

	_.defaults( error, {
		status:  parseInt( error.code ) || 500,
		message: "unknown error"
	} );

	status( error.status );
	format( {
		html:    function() {
			send( `<!doctype html>
<html>
<head>
<title>Error</title>
</head>
<body>
<h1>An error occurred!</h1>
<body>${error.message}</body>
</body>
</html>` );
		},
		json:    function() {
			send( {
				error: error.message,
				code:  error.status,
			} );
		},
		text: function() {
			send( "Error: " + ( error.message || "unknown error" ) );
		},
		default: function() {
			send( "Error: " + ( error.message || "unknown error" ) );
		}
	} );
}
