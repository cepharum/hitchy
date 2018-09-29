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

/**
 * Provides API for injecting hitchy into expressjs/connectjs-based application
 * as middleware.
 *
 * @param {HitchyOptions=} options
 * @returns {HitchyConnectInstance}
 */
module.exports = function( options ) {
	/** @type HitchyAPI */
	let hitchy = null;
	/** @type Error */
	let error = null;

	let starter = require( "../lib" )( options )
		.then( function( api ) {
			middleware.hitchy = Object.seal( hitchy = api );
		}, function( cause ) {
			error = cause;

			require( "debug" )( "bootstrap" )( "ERROR: starting hitchy failed", cause );

			// keep rejecting promise
			throw cause;
		} );


	let consumingStarter = false;

	starter.catch( cause => {
		if ( consumingStarter ) {
			throw cause;
		}
	} );

	Object.defineProperties( middleware, {
		/** @name HitchyConnectInstance#onStarted */
		onStarted: {
			get: function() {
				consumingStarter = true;
				return starter;
			}
		},
		stop: {
			/** @name HitchyConnectInstance#stop */
			value: function() {
				return starter
					.then( function() {
						return hitchy ? hitchy.bootstrap.shutdown() : undefined;
					} );
			}
		}
	} );

	middleware.injector = "connect";

	return middleware;


	function middleware( req, res, next ) {
		/** @type HitchyRequestContext */
		let context = {
			request: req,
			response: res,
			done: next,
			local: {}
		};

		if ( hitchy ) {
			hitchy.utility.introduce( context );

			hitchy.router.dispatch( context )
				.then( function() {
					if ( !res.finished ) {
						next();
					}
				}, Common.errorHandler.bind( context, options ) );
		} else if ( error ) {
			hitchy.log( "hitchy:debug" )( "got request during startup resulting in error", error );
			Common.errorHandler.call( context, options, error );
		} else {
			hitchy.log( "hitchy:debug" )( "got request during startup, sending splash" );
			Common.errorHandler.call( context, options );
		}
	}
};

/**
 * @typedef {function(error:Error=,request:IncomingMessage,response:ServerResponse,next:function(err:Error=))} HitchyConnectInstance
 * @extends HitchyInstance
 */
