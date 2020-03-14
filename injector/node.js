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

const Debug = require( "debug" );

const Common = require( "./common" );

const logDebug = Debug( "hitchy:injector:node:debug" );
const logError = Debug( "hitchy:injector:node:error" );


/**
 * Provides API for injecting Hitchy into native HTTP service of NodeJS.
 *
 * @param {HitchyOptions=} options global options customizing hitchy
 * @returns {HitchyNodeInstance} instance of Hitchy
 */
module.exports = function( options ) {
	/** @type HitchyAPI */
	let hitchy = null;

	/** @type Error */
	let startupError = null;

	const starter = require( "../lib" )( options )
		.then( api => {
			hitchy = Object.seal( api );

			Object.defineProperties( hitchyRequestHandler, {
				hitchy: { value: hitchy, enumerable: true },
				api: { value: hitchy, enumerable: true },
			} );

			return api;
		}, cause => {
			startupError = cause;

			logError( "FATAL: starting hitchy failed: %s", cause.stack );

			// keep rejecting promise
			throw cause;
		} );


	Object.defineProperties( hitchyRequestHandler, {
		/**
		 * Promises hitchy node has been started successfully.
		 *
		 * @name HitchyNodeInstance#onStarted
		 * @property {Promise<HitchyAPI>}
		 * @readonly
		 */
		onStarted: { value: starter },

		/**
		 * Shuts down hitchy node.
		 *
		 * @note Shutting down hitchy node doesn't actually shut down any socket
		 *       this node was bound to before. Thus shutting down Hitchy node
		 *       w/o first shutting down all sockets it was listening on should
		 *       be prevented.
		 *
		 * @name HitchyNodeInstance#stop
		 * @property {function():Promise}
		 */
		stop: {
			value: () => Promise.race( [
				starter,
				new Promise( ( _, reject ) => {
					const timeout = ( parseInt( process.env.STARTUP_TIMEOUT ) || 10 ) * 1000;

						setTimeout( reject, timeout, Object.assign( new Error( "FATAL: cancelling start-up blocking shutdown" ), {
							startBlocked: true,
						} ) );
					} ),
				] )
					.catch( error => {
						if ( error.startBlocked ) {
							logError( error.message );
						} else {
							logError( "Hitchy start-up has failed -> shutting down" );
						}

						// don't re-expose any issue encountered during start-up
					} )
					.then( () => ( hitchy ? hitchy.bootstrap.shutdown() : undefined ) );
			},
		},

		injector: { value: "node" },
	} );

	return hitchyRequestHandler;


	/**
	 * Implements request handler for integrating hitchy with a regular Node.js
	 * HTTP server.
	 *
	 * @param {IncomingMessage} req description of request to be handled
	 * @param {ServerResponse} res response manager
	 * @returns {void}
	 */
	function hitchyRequestHandler( req, res ) {
		/** @type HitchyRequestContext */
		const context = {
			context: "standalone",
			request: req,
			response: res,
			done: _error => {
				if ( _error ) {
					logError( `got error on dispatching ${req.method} ${req.url}: ${_error.statusCode ? _error.message : _error.stack}` );
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
				.then( ctx => {
					// responder normalization works synchronously currently, so
					// don't waste time on wrapping it in another promise
					hitchy.responder.normalize( ctx );

					return hitchy.router.dispatch( ctx );
				} )
				.then( ctx => {
					if ( !ctx.consumed.byTerminal && !res.finished ) {
						options.handleErrors = true;

						Common.errorHandler.call( ctx, options, Object.assign( new Error( "Page not found!" ), { status: 404 } ) );
					}
				} )
				.catch( Common.errorHandler.bind( context, options ) );
		} else if ( startupError ) {
			logDebug( "got request on node which failed during start-up" );
			Common.errorHandler.call( context, options, process.env.NODE_ENV === "production" ? true : startupError );
		} else {
			logDebug( "got request during startup, sending splash" );
			Common.errorHandler.call( context, options );
		}
	}
};

/**
 * @typedef {object} HitchyInstance
 * @property {Promise} onStarted settled on starting hitchy instance succeeded or failed
 * @property {function:Promise} stop shuts down hitchy instance
 * @property {string} injector name of injector used to create the instance
 * @property {HitchyAPI} api API of hitchy for use by instance
 * @property {HitchyAPI} hitchy API of hitchy for use by instance, aliasing `api`
 */

/**
 * @typedef {function(request:IncomingMessage,response:ServerResponse)} HitchyNodeInstance
 * @extends HitchyInstance
 */
