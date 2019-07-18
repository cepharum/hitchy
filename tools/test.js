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


let recentlyStartedServers = [];

module.exports = {

	/**
	 * Starts hitchy service using node's http server.
	 *
	 * @param {HitchyNodeInstance} hitchy
	 * @param {object} options
	 * @returns {Promise<Server>}
	 */
	startServer( hitchy, options = {} ) {
		switch ( hitchy.injector || process.env.HITCHY_MODE || "node" ) {
			case "node" :
				return _createHTTP( hitchy );

			case "connect" :
			case "express" :
				return new Promise( ( resolve, reject ) => {
					try {
						return resolve( require( "express" ) );
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
								return resolve( require( "express" ) );
							} catch ( error ) {
								reject( error );
							}
						}
					} );
				} )
					.then( Express => {
						let app = Express();

						let notFound = new Error( "Page not found." );
						notFound.code = 404;

						if ( options.prefix ) {
							app.use( options.prefix, hitchy, _fakeError.bind( undefined, notFound ), _fakeError );
						} else {
							app.use( hitchy, _fakeError.bind( undefined, notFound ), _fakeError );
						}

						return _createHTTP( app );


						function _fakeError( err, req, res, next ) { // eslint-disable-line no-unused-vars
							res
								.status( err.statusCode || err.code || 500 )
								.format( {
									html() {
										res.send( `<html><body><p>${err.message}</p></body></html>` );
									},
									json() {
										res.send( {
											error: err.message,
											code: err.statusCode || err.code || 404,
										} )
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

		function _createHTTP( listener ) {
			return hitchy.onStarted
				.then( () => new Promise( ( resolve, reject ) => {
					let server = Http.createServer( listener );
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
 * @returns {Promise}
 */
function request( method, url, data = null, headers = {} ) {
	return new Promise( function( resolve, reject ) {
		let server = recentlyStartedServers[0];
		if ( !server ) {
			throw new Error( "server not started yet" );
		}

		let request = Url.parse( url );

		request.method = method;

		if ( !request.hostname ) {
			request.hostname = "127.0.0.1";
			request.port = server.address().port;
		}

		request.headers = {
			"accept": "text/html",
		};

		if ( typeof data !== "string" && !Buffer.isBuffer( data ) ) {
			if ( data != null ) {
				data = JSON.stringify( data );
				headers["content-type"] = "application/json";
			} else {
				data = null;
			}
		}

		Object.keys( headers || {} )
			.forEach( function( name ) {
				request.headers[name] = headers[name];
			} );

		request.agent = false;

		let handle = Http.request( request, function( response ) {
			let buffers = [];

			response.on( "data", chunk => buffers.push( chunk ) );
			response.on( "end", () => {
				response.body = Buffer.concat( buffers );

				let type = response.headers["content-type"] || "";

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

		if ( data != null ) {
			handle.write( data, "utf8" );
		}

		handle.end();
	} );
}
