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

/**
 * Implements tools for common tasks in developing tests.
 */

"use strict";

const Http = require( "http" );
const Url = require( "url" );


const recentlyStartedServers = [];

module.exports = {

	/**
	 * Starts hitchy service using node's http server.
	 *
	 * @param {HitchyNodeInstance} hitchy instance of hitchy
	 * @param {object} options global options
	 * @returns {Promise<Server>} promises running server exposing hitchy instance
	 */
	startServer( hitchy, options = {} ) {
		switch ( hitchy.injector || process.env.HITCHY_MODE || "node" ) {
			case "node" :
				return _createHTTP( hitchy );

			case "connect" :
			case "express" :
				return new Promise( ( resolve, reject ) => {
					try {
						resolve( require( "express" ) );
						return;
					} catch ( error ) {
						if ( error.code !== "MODULE_NOT_FOUND" ) {
							reject( error );
						}
					}

					// need to install expressjs first
					require( "child_process" ).exec( "npm install --no-save express", error => {
						if ( error ) {
							reject( error );
						} else {
							try {
								resolve( require( "express" ) );
							} catch ( _error ) {
								reject( _error );
							}
						}
					} );
				} )
					.then( Express => {
						const app = Express();

						const notFound = new Error( "Page not found." );
						notFound.code = 404;

						if ( options.prefix ) {
							app.use( options.prefix, hitchy, _fakeError.bind( undefined, notFound ), _fakeError );
						} else {
							app.use( hitchy, _fakeError.bind( undefined, notFound ), _fakeError );
						}

						return _createHTTP( app );


						/**
						 * Implements fallback error handler.
						 *
						 * @param {Error} err error to describe
						 * @param {IncomingMessage} req request descriptor
						 * @param {ServerResponse} res response manager
						 * @param {function} next callback to invoke when done
						 * @returns {void}
						 * @private
						 */
						function _fakeError( err, req, res, next ) { // eslint-disable-line no-unused-vars
							res
								.status( err.statusCode || err.code || 500 )
								.format( {
									html() {
										res.send( `<html lang="en"><body><p>${err.message}</p></body></html>` );
									},
									json() {
										res.send( {
											error: err.message,
											code: err.statusCode || err.code || 404,
										} );
									},
									text() {
										res.send( err.message );
									}
								} );
						}
					} );

			default :
				throw new Error( "invalid Hitchy injection mode" );
		}

		/**
		 * Creates HTTP server instance.
		 *
		 * @param {function} listener function invoked per incoming request
		 * @returns {Promise<Server>} promises running and listening HTTP server instance
		 * @private
		 */
		function _createHTTP( listener ) {
			return hitchy.onStarted
				.then( () => new Promise( ( resolve, reject ) => {
					const server = Http.createServer( listener );
					let stopResolve = null;
					let stopReject = null;

					const onStopped = new Promise( ( _resolve, _reject ) => {
						stopResolve = _resolve;
						stopReject = _reject;
					} );


					recentlyStartedServers.unshift( server );

					server.once( "error", reject );
					server.once( "close", () => {
						let numServers = recentlyStartedServers.length;

						for ( let i = 0; i < numServers; i++ ) {
							if ( recentlyStartedServers[i] === server ) {
								recentlyStartedServers.splice( i, 1 );

								i--;
								numServers--;
							}
						}

						hitchy.stop()
							.then( stopResolve )
							.catch( stopReject );
					} );

					server.stop = () => {
						server.once( "error", error => stopReject( error ) );

						server.close();

						return onStopped;
					};

					server.$hitchy = hitchy;

					server.listen( 0, "0.0.0.0", 10240, () => {
						resolve( server );
					} );
				} ) );
		}
	},

	get: request.bind( undefined, "GET" ),
	post: request.bind( undefined, "POST" ),
	put: request.bind( undefined, "PUT" ),
	patch: request.bind( undefined, "PATCH" ),
	delete: request.bind( undefined, "DELETE" ),
	head: request.bind( undefined, "HEAD" ),
	options: request.bind( undefined, "OPTIONS" ),
	trace: request.bind( undefined, "TRACE" ),

	/** @borrows request as request */
	request: request,
};

/**
 * Sends HTTP request to hitchy server, receives responds and fulfills returned
 * promise with response on success or with cause on error.
 *
 * @param {string} method HTTP method
 * @param {string} url requested URL
 * @param {(Buffer|string|object)=} data data to be sent with request
 * @param {object<string,string>} headers custom headers to include on request
 * @returns {Promise} promises response
 */
function request( method, url, data = null, headers = {} ) {
	return new Promise( function( resolve, reject ) {
		const server = recentlyStartedServers[0];
		if ( !server ) {
			throw new Error( "server not started yet" );
		}

		const req = Url.parse( url );

		req.method = method;

		if ( !req.hostname ) {
			req.hostname = "127.0.0.1";
			req.port = server.address().port;
		}

		req.headers = {
			accept: "text/html",
		};

		let body = data;
		if ( typeof body !== "string" && !Buffer.isBuffer( body ) && body != null ) {
			body = JSON.stringify( body );
			headers["content-type"] = "application/json";
		}

		Object.keys( headers || {} )
			.forEach( function( name ) {
				req.headers[name] = headers[name];
			} );

		req.agent = false;

		const handle = Http.request( req, function( response ) {
			const buffers = [];

			response.on( "data", chunk => buffers.push( chunk ) );
			response.on( "end", () => {
				response.body = Buffer.concat( buffers );

				const type = response.headers["content-type"] || "";

				if ( type.match( /^(text|application)\/json\b/ ) ) {
					try {
						response.data = JSON.parse( response.body.toString( "utf8" ) );
					} catch ( e ) {
						reject( e );
					}
				} else if ( type.match( /^text\// ) ) {
					response.text = response.body.toString( "utf8" );
				}

				resolve( response );
			} );
		} );

		handle.on( "error", reject );

		if ( body != null ) {
			handle.write( body, "utf8" );
		}

		handle.end();
	} );
}
