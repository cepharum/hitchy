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

const { PassThrough } = require( "stream" );
const { STATUS_CODES } = require( "http" );

/**
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {class<Client>} implementation of client for routing local-only request
 */
module.exports = function( options ) { // eslint-disable-line no-unused-vars
	const that = this;

	const FakeServiceSocket = {
		port: 8080,
		family: "IPv4",
		address: "127.0.0.1",
	};

	const FakeClientSocket = {
		port: 12345,
		family: "IPv4",
		address: "127.0.0.1",
	};

	let bodyFetched;


	/**
	 * Implements client to create and locally dispatch request.
	 */
	class HitchyClientResponse extends PassThrough {
		/** */
		constructor() {
			super();

			/**
			 * Caches volatile set of headers.
			 *
			 * @type {object<string,(string|string[])>}
			 * @private
			 */
			this.headers = {};

			/**
			 * Fakes current status code of response.
			 *
			 * @name HitchyClientResponse#statusCode
			 * @type {int}
			 */
			this.statusCode = 200;


			let message = null;

			Object.defineProperties( this, {
				/**
				 * Exposes message related to current status code.
				 *
				 * @name HitchyClientResponse#statusMessage
				 * @property {string}
				 */
				statusMessage: {
					get: () => message || STATUS_CODES[parseInt( this.statusCode ) || 500],
					set( value ) { message = value; },
				},

				/**
				 * Indicates if response has been written completely.
				 *
				 * @name HitchyClientResponse#finished
				 * @property {boolean}
				 * @readonly
				 */
				finished: {
					get: () => this.writableFinished,
				},

				/**
				 * Provides fake socket of response.
				 *
				 * @name HitchyClientResponse#socket
				 * @property {object}
				 * @readonly
				 */
				socket: {
					value: Object.create( {}, {
						address: { value: () => FakeServiceSocket },
						localAddress: { value: FakeServiceSocket.address, },
						localPort: { value: FakeServiceSocket.port, },
						remoteAddress: { value: FakeClientSocket.address, },
						remotePort: { value: FakeClientSocket.port, },
						remoteFamily: { value: FakeServiceSocket.address, },
					} ),
					enumerable: true,
				},

				/**
				 * Indicates whether are assumed to be sent already.
				 *
				 * @name HitchyClientResponse#headersSent
				 * @property {boolean}
				 * @readonly
				 */
				headersSent: {
					get: () => Object.isFrozen( this.headers ),
				}
			} );

			Object.defineProperties( this, {
				/**
				 * Provides alias for socket of response.
				 *
				 * @name HitchyClientResponse#connection
				 * @property {object}
				 * @readonly
				 */
				connection: {
					value: this.socket,
					enumerable: true,
				},
			} );
		}

		/**
		 * Fakes addTrailers() of ServerResponse.
		 *
		 * @param {object} headers headers to be appended, get discarded here
		 * @returns {void}
		 */
		addTrailers( headers ) {} // eslint-disable-line no-unused-vars,no-empty-function

		/**
		 * Defines response header.
		 *
		 * @param {string} name name of header to set
		 * @param {string|string[]} value header value(s)
		 * @returns {void}
		 */
		setHeader( name, value ) {
			this.headers[name.toLowerCase()] = value;
		}

		/**
		 * Fetches previously defined response header.
		 *
		 * @param {string} name name of header to set
		 * @returns {string|string[]} selected header's value
		 */
		getHeader( name ) {
			return this.headers[name.toLowerCase()];
		}

		/**
		 * Removes response header.
		 *
		 * @param {string} name name of header to remove
		 * @returns {void}
		 */
		removeHeader( name ) {
			delete this.headers[name.toLowerCase()];
		}

		/**
		 * Checks if response header exists.
		 *
		 * @param {string} name name of header to remove
		 * @returns {boolean} true if header has been defined before, false otherwise
		 */
		hasHeader( name ) {
			return this.headers.hasOwnProperty( name.toLowerCase() );
		}

		/**
		 * Fetches defined set of response headers.
		 *
		 * @returns {object<string,string>} defined response headers
		 */
		getHeaders() {
			return Object.assign( {}, this.headers );
		}

		/**
		 * Fetches names of defined response headers.
		 *
		 * @returns {string[]} names of defined response headers
		 */
		getHeaderNames() {
			return Object.keys( this.headers );
		}

		/**
		 * Fakes flushing headers.
		 *
		 * @return {void}
		 */
		flushHeaders() {
			if ( !Object.isFrozen( this.headers ) ) {
				Object.defineProperties( this, {
					headers: { value: Object.freeze( Object.assign( {}, this.headers ) ) },
				} );
			}
		}

		/**
		 * Fakes ServerResponse#writeContinue().
		 *
		 * @returns {void}
		 */
		writeContinue() {
			throw new Error( "HTTP's Continue not supported when dispatching internally" );
		}

		/**
		 * Fakes ServerResponse#writeProcessing().
		 *
		 * @returns {void}
		 */
		writeProcessing() {
			throw new Error( "HTTP's Processing not supported when dispatching internally" );
		}

		/**
		 * Fakes ServerResponse#writeHead().
		 *
		 * @param {int} statusCode status code to set
		 * @param {string} statusMessage status message to set explicitly
		 * @param {object<string,(string|string[])>} headers response headers to set
		 * @returns {void}
		 */
		writeHead( statusCode, statusMessage, headers ) {
			if ( this.headersSent ) {
				throw new Error( "headers sent already" );
			}

			this.statusCode = statusCode;

			let _headers = headers;

			if ( typeof statusMessage === "string" ) {
				this.statusMessage = statusMessage;
			} else {
				_headers = statusMessage;
			}

			Object.keys( _headers ).forEach( name => {
				this.setHeader( name, _headers[name] );
			} );

			this.flushHeaders();
		}

		/**
		 * Simplifies retrieval of response body.
		 *
		 * @returns {Promise<Buffer>} promises response body
		 */
		body() {
			if ( !bodyFetched ) {
				bodyFetched = new Promise( ( resolve, reject ) => {
					const buffers = [];

					this.on( "data", chunk => buffers.push( chunk ) );

					this.once( "error", reject );
					this.once( "end", () => {
						resolve( Buffer.concat( buffers ) );
					} );
				} );
			}

			return bodyFetched;
		}
	}

	/**
	 * Implements client to create and locally dispatch request.
	 */
	class HitchyClientRequest extends PassThrough {
		/**
		 * @param {string} url URL path and query to request
		 * @param {string} method name of request method to simulate
		 * @param {object<string,string>} headers request headers
		 */
		constructor( { url, method = "GET", headers = {} } = {} ) {
			if ( !url || typeof url !== "string" || !/^\/\S+$/.test( url ) ) {
				throw new TypeError( "invalid request path" );
			}

			super();

			const normalizedHeaders = {};
			const rawHeaders = [];

			Object.keys( headers ).forEach( name => {
				normalizedHeaders[name.toLowerCase()] = headers[name];

				rawHeaders.push( name );
				rawHeaders.push( headers[name] );
			} );

			Object.defineProperties( this, {
				/**
				 * Indicates current request being dispatched local, only.
				 *
				 * @name HitchyClientRequest#internal
				 * @property {boolean}
				 * @readonly
				 */
				internal: { value: true, enumerable: true },

				/**
				 * Provides request URL path and query.
				 *
				 * @name HitchyClientRequest#url
				 * @property {string}
				 * @readonly
				 */
				url: { value: url, enumerable: true },

				/**
				 * Provides request method.
				 *
				 * @name HitchyClientRequest#method
				 * @property {string}
				 * @readonly
				 */
				method: { value: method || "GET", enumerable: true },

				/**
				 * Provides fake list of raw header elements.
				 *
				 * @name HitchyClientRequest#rawHeaders
				 * @property {string[]}
				 * @readonly
				 */
				rawHeaders: { value: rawHeaders, enumerable: true },

				/**
				 * Provides request headers.
				 *
				 * @name HitchyClientRequest#headers
				 * @property {object<string,string>}
				 * @readonly
				 */
				headers: { value: normalizedHeaders, enumerable: true },

				/**
				 * Provides fake list of raw trailers.
				 *
				 * @name HitchyClientRequest#rawTrailers
				 * @property {string[]}
				 * @readonly
				 */
				rawTrailers: { value: [], enumerable: true },

				/**
				 * Provides fake set of trailers.
				 *
				 * @name HitchyClientRequest#trailers
				 * @property {object<string,string>}
				 * @readonly
				 */
				trailers: { value: {}, enumerable: true },

				/**
				 * Provides fake socket mostly for exposing some peer address.
				 *
				 * @name HitchyClientRequest#socket
				 * @property {object}
				 * @readonly
				 */
				socket: {
					value: Object.create( {}, {
						address: { value: () => FakeServiceSocket },
						localAddress: { value: FakeServiceSocket.address, },
						localPort: { value: FakeServiceSocket.port, },
						remoteAddress: { value: FakeClientSocket.address, },
						remotePort: { value: FakeClientSocket.port, },
						remoteFamily: { value: FakeServiceSocket.address, },
					} ),
					enumerable: true,
				},

				/**
				 * Exposes response associated with request on dispatching the
				 * latter.
				 *
				 * @name HitchyClientRequest#response
				 * @property {HitchyClientResponse}
				 * @readonly
				 */
				response: {
					value: new HitchyClientResponse(),
				},

				/**
				 * Provides fake HTTP version.
				 *
				 * @name HitchyClientRequest#httpVersion
				 * @property {string}
				 * @readonly
				 */
				httpVersion: { value: "1.0", enumerable: true },
			} );
		}

		/**
		 * Dispatches request using routing feature of current Hitchy instance.
		 *
		 * @returns {Promise<HitchyClientResponse>} promises response
		 */
		dispatch() {
			return new Promise( ( resolve, reject ) => {
				/** @type HitchyRequestContext */
				const context = {
					request: this,
					response: this.response,
					done: _error => {
						if ( _error ) {
							console.error( `got error on locally dispatching ${this.method} ${this.url}: ${_error.message}` );
						}
					},
					local: {},
					consumed: {
						byPolicy: false,
						byTerminal: false,
					},
				};

				that.utility.introduce( context );

				that.router.normalize( context )
					.then( ctx => {
						// responder normalization works synchronously currently, so
						// don't waste time on wrapping it in another promise
						that.responder.normalize( ctx );

						return that.router.dispatch( ctx );
					} )
					.then( ctx => {
						if ( ctx.consumed.byTerminal || this.response.finished ) {
							resolve( this.response );
						} else {
							reject( Object.assign( new Error( "forwarded request did not match any routing" ), { status: 404 } ) );
						}
					} )
					.catch( reject );
			} );
		}
	}

	return HitchyClientRequest;
};
