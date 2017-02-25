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

const Common = require( "./common" );
const Log    = require( "debug" )( "bootstrap" );
const Debug  = require( "debug" )( "debug" );

/**
 * Provides API for injecting hitchy into expressjs/connectjs-based application
 * as middleware.
 *
 * @param {HitchyOptions=} options
 * @returns {function(request:IncomingMessage, response:ServerResponse)}
 */
module.exports = function( options ) {

	/** @type HitchyAPI */
	let hitchy = null;
	/** @type Error */
	let error = null;

	let starter = require( "../lib" )( options )
		.then( function( runtime ) {
			hitchy = runtime;
		}, function( cause ) {
			error = cause;
			Log( "ERROR: starting hitchy failed", cause );

			// cause shutdown by running middleware function w/o arguments
			middleware()
				.catch( function( cause ) {
					Log( "ERROR: shutting down hitchy failed either", cause );
				} );

			// keep rejecting promise
			throw cause;
		} );

	if ( options && options.onStarted ) {
		options.onStarted = new Promise( function( resolve, reject ) {
			starter.then( resolve, reject );
		} );

		// suppress warning on unhandled promise rejection on unit-testing
		if ( process.env.NODE_ENV === "test" ) {
			options.onStarted.catch( () => {} );
		}
	}

	// suppress warning on not handling rejection of internal-only promise
	starter.catch( () => {} );

	return middleware;


	function middleware( req, res ) {
		if ( !arguments.length ) {
			// handle special, somewhat hackish way for notifying hitchy to shutdown
			return starter
				.then( function() {
					return hitchy ? hitchy.bootstrap.shutdown() : null;
				} );
		}

		/** @type HitchyRequestContext */
		let context = {
			request:  req,
			response: res,
			done:     function() {},
			local:    {},
		};

		if ( hitchy ) {
			hitchy.utility.introduce( context );

			hitchy.router.normalize( context )
				.then( function( context ) {
					// responder normalization works synchronously currently, so
					// don't waste time on wrapping it in another promise
					hitchy.responder.normalize( context );

					return hitchy.router.dispatch( context );
				} )
				.then( function() {
					if ( !res.finished ) {
						let error = new Error( "Page not found!" );
						error.status = 404;

						options.handleErrors = true;

						Common.errorHandler.call( context, options, error );
					}
				}, Common.errorHandler.bind( context, options ) );
		} else if ( error ) {
			Debug( "got request during startup resulting in error", error );
			Common.errorHandler.call( context, options, error );
		} else {
			Debug( "got request during startup, sending splash" );
			Common.errorHandler.call( context, options );
		}
	}
};
