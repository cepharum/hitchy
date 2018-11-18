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
 * @returns {HitchyNodeInstance}
 */
module.exports = function( options ) {
	/** @type HitchyAPI */
	let hitchy = null;

	/** @type Error */
	let error = null;
	let consumingStarter = false;

	let starter = require( "../lib" )( options )
		.then( api => {
			middleware.hitchy = Object.seal( hitchy = api );
		}, cause => {
			error = cause;

			require( "debug" )( "bootstrap" )( "ERROR: starting hitchy failed", cause );

			// keep rejecting promise
			throw cause;
		} )
		.catch( cause => {
			if ( consumingStarter ) {
				throw cause;
			} else {
				console.error( "Unhandled Hitchy error:", cause );
			}
		} );


	Object.defineProperties( middleware, {
		/**
		 * Promises hitchy node has been started successfully.
		 *
		 * @name HitchyNodeInstance#onStarted
		 * @property {Promise}
		 * @readonly
		 */
		onStarted: {
			get: () => {
				consumingStarter = true;
				return starter;
			},
		},

		/**
		 * Shuts down hitchy node.
		 *
		 * @name HitchyNodeInstance#stop
		 * @property {function():Promise}
		 */
		stop: {
			value: () => starter.then( () => ( hitchy ? hitchy.bootstrap.shutdown() : undefined ) ),
		}
	} );

	middleware.injector = "node";

	return middleware;


	function middleware( req, res ) {
		/** @type HitchyRequestContext */
		const context = {
			request: req,
			response: res,
			done: error => {
				if ( error ) {
					console.error( `got error on dispatching ${req.method} ${req.url}: ${error.message}` );
				}
			},
			local: {},
			consumed: {
				byPolicy: false,
				byTerminal: false,
			},
		};

		if ( hitchy ) {
			hitchy.utility.introduce( context );

			hitchy.router.normalize( context )
				.then( context => {
					// responder normalization works synchronously currently, so
					// don't waste time on wrapping it in another promise
					hitchy.responder.normalize( context );

					return hitchy.router.dispatch( context );
				} )
				.then( context => {
					if ( !context.consumed.byTerminal && !res.finished ) {
						let error = new Error( "Page not found!" );
						error.status = 404;

						options.handleErrors = true;

						Common.errorHandler.call( context, options, error );
					}
				}, Common.errorHandler.bind( context, options ) );
		} else if ( error ) {
			console.error( "got request during startup resulting in error", error );
			Common.errorHandler.call( context, options, error );
		} else {
			console.error( "got request during startup, sending splash" );
			Common.errorHandler.call( context, options );
		}
	}
};

/**
 * @typedef object HitchyInstance
 * @property {Promise} onStarted settled on starting hitchy instance succeeded or failed
 * @property {function:Promise} stop shuts down hitchy instance
 */

/**
 * @typedef {function(request:IncomingMessage,response:ServerResponse)} HitchyNodeInstance
 * @extends HitchyInstance
 */
