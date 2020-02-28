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
 * @param {HitchyOptions=} options global options customizing Hitchy
 * @returns {HitchyConnectInstance} middleware suitable for integrating with Express.js
 */
module.exports = function( options ) {
	/** @type HitchyAPI */
	let hitchy = null;

	/** @type Error */
	let startupError = null;

	const starter = require( "../lib" )( options )
		.then( api => {
			hitchy = Object.seal( api );

			Object.defineProperties( middleware, {
				hitchy: { value: hitchy, enumerable: true },
				api: { value: hitchy, enumerable: true },
			} );

			return api;
		}, cause => {
			startupError = cause;

			require( "debug" )( "bootstrap" )( "FATAL: starting Hitchy failed", cause.stack );

			// keep rejecting promise
			throw cause;
		} );


	Object.defineProperties( middleware, {
		/**
		 * Promises Hitchy application having started.
		 *
		 * @name HitchyConnectInstance#onStarted
		 * @property {Promise}
		 * @readonly
		 */
		onStarted: { value: starter },

		/**
		 * Gracefully shuts down Hitchy application.
		 *
		 * @name HitchyConnectInstance#stop
		 * @property {function():Promise}
		 * @readonly
		 */
		stop: {
			// eslint-disable-next-line no-empty-function
			value: () => starter.catch( () => {} ).then( () => ( hitchy ? hitchy.bootstrap.shutdown() : undefined ) )
		},

		injector: { value: "connect" },
	} );

	return middleware;


	/**
	 * Handles request.
	 *
	 * @param {IncomingMessage} req request descriptor
	 * @param {ServerResponse} res response manager
	 * @param {function} next callback to invoke for passing request to next available handler
	 * @returns {void}
	 */
	function middleware( req, res, next ) {
		/** @type HitchyRequestContext */
		const context = {
			context: "express",
			request: req,
			response: res,
			done: next,
			local: {},
			consumed: {
				byPolicy: false,
				byTerminal: false,
			},
		};

		if ( hitchy ) {
			hitchy.utility.introduce( context );

			hitchy.router.dispatch( context )
				.then( ctx => {
					const { byTerminal, byPolicy } = ctx.consumed;

					if ( !res.finished && !byTerminal ) {
						if ( byPolicy ) {
							Common.errorHandler.call( ctx, options );
						} else {
							next();
						}
					}
				} )
				.catch( Common.errorHandler.bind( context, options ) );
		} else if ( startupError ) {
			hitchy.log( "hitchy:debug" )( "got request on node which failed during start-up" );
			Common.errorHandler.call( context, options, startupError );
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
