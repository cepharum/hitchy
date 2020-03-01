/**
 * (c) 2020 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 cepharum GmbH
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

const Http = require( "http" );
const Https = require( "https" );

/**
 * @typedef {IncomingMessage} ClientResponse
 * @property {function():Promise<Buffer>} body fetches body of response
 * @property {function():Promise<object>} json fetches body of response as JSON and provides parsed object
 */

module.exports = function() {
	const api = this;

	const logDebug = api.log( "hitchy:http-client" );
	const logError = api.log( "hitchy:http-client:error" );

	const agents = {
		http: new Http.Agent( {
			keepAlive: true,
			maxFreeSockets: 10,
		} ),
		https: new Https.Agent( {
			keepAlive: true,
			maxFreeSockets: 10,
		} ),
	};

	/**
	 * Implements client for conveniently sending HTTP(S) requests.
	 *
	 * @alias that.runtime.services.HttpClient
	 */
	class HttpClient {
		/**
		 * Fetches resource via HTTP(S).
		 *
		 * @param {string} method HTTP request method, e.g. "GET"
		 * @param {string|URL} url URL to fetch
		 * @param {string|object|ReadableStream} body request payload to be transmitted
		 * @param {object<string,*>} headers custom request headers
		 * @param {int} timeout timeout in seconds
		 * @returns {Promise<ClientResponse>} promises available response
		 */
		static fetch( method, url, body = null, headers = {}, { timeout = Infinity } = {} ) {
			const start = Date.now();

			logDebug( `${method} ${url}` );

			return new Promise( ( resolve, reject ) => {
				const _url = url instanceof URL ? url : new URL( url );
				let resendDelay = 250;

				if ( timeout < Infinity ) {
					setTimeout( timeoutHandler, ( timeout * 1000 ) + 1000 );
				}

				sendRequest();

				/**
				 * Rejects promise with error due to running into a timeout.
				 *
				 * @returns {void}
				 */
				function timeoutHandler() {
					reject( new Error( `request for ${_url} timed out after ${Date.now() - start} ms` ) );
				}

				/**
				 * Attempts to send request.
				 *
				 * @returns {void}
				 */
				function sendRequest() {
					const hasContentType = Object.keys( headers ).some( name => name.toLowerCase() === "content-type" );
					if ( !hasContentType && body && body.constructor === Object ) {
						headers["content-type"] = "application/json; charset=UTF-8";
					}

					const protocolName = _url.protocol === "https:" ? "https" : "http";
					const Protocol = require( protocolName );
					const client = Protocol.request( _url, {
						method,
						headers,
						timeout: 2000,
						agent: agents[protocolName],
					} );

					if ( timeout < Infinity ) {
						client.setTimeout( timeout * 1000 );
						client.once( "timeout", timeoutHandler );
					}

					client.once( "error", error => {
						switch ( error.code ) {
							case "ECONNREFUSED" :
							case "ENOTFOUND" :
							case "EAI_AGAIN" :
								if ( resendDelay > 0 ) {
									logDebug( `connection failed due to ${error.code} ... retrying in ${resendDelay}ms` );

									setTimeout( sendRequest, resendDelay );
									resendDelay += Math.min( resendDelay, 5000 );
									break;
								}

							// falls through
							default :
								reject( error );
						}
					} );

					client.once( "response", response => {
						let _bodyFetcher = null;

						response.body = () => {
							if ( !_bodyFetcher ) {
								if ( timeout < Infinity ) {
									response.setTimeout( timeout * 1000 );

									response.once( "timeout", () => {
										const msg = `response from ${_url} timed out after ${Date.now() - start} ms`;
										reject( Object.assign( new Error( msg ), { code: "ETIMEDOUT" } ) );
									} );
								}

								_bodyFetcher = new Promise( ( _resolve, _reject ) => {
									const chunks = [];

									response.once( "error", _reject );
									response.on( "data", chunk => chunks.push( chunk ) );
									response.once( "end", () => _resolve( Buffer.concat( chunks ) ) );
								} );
							}

							return _bodyFetcher;
						};

						response.json = () => {
							return response.body().then( buffer => JSON.parse( buffer.toString( "utf8" ) ) );
						};

						resolve( response );
					} );

					if ( body ) {
						if ( body instanceof require( "stream" ).Readable ) {
							resendDelay = NaN;
							body.pipe( client );
						} else if ( body instanceof Buffer ) {
							client.end( body );
						} else if ( typeof body === "object" && !Array.isArray( body ) ) {
							client.end( JSON.stringify( body ) );
						} else if ( typeof body === "string" ) {
							client.end( body, "utf8" );
						} else {
							client.end();
						}
					} else {
						client.end();
					}
				}
			} )
				.then( response => {
					logDebug( `${method} ${url} -> ${response.statusCode}` );

					return response;
				} )
				.catch( error => {
					logError( error.message );

					throw error;
				} );
		}
	}

	return HttpClient;
};
