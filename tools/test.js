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

const { BasicServer } = require( "../lib/server" );

const DefaultArguments = {
	quiet: true,
};

/**
 * @typedef {function(url:string, body:(Buffer|string|object), headers:object):Promise<ServerResponse>} HitchyTestBoundClient
 */

/**
 * @typedef {function(method:string, url:string, body:(Buffer|string|object), headers:object):Promise<ServerResponse>} HitchyTestUnboundClient
 */

/**
 * @typedef {object} HitchyTestContext
 * @property {HitchyInstance} hitchy instance of Hitchy to be tested
 * @property {Server} server HTTP service dispatching incoming requests into Hitchy instance
 * @property {function(url:string, body:(Buffer|string|object), headers:object):Promise<ServerResponse>} get sends GET request to running Hitchy instance
 * @property {HitchyTestBoundClient} get sends GET request to running Hitchy instance
 * @property {HitchyTestBoundClient} post sends POST request to running Hitchy instance
 * @property {HitchyTestBoundClient} put sends PUT request to running Hitchy instance
 * @property {HitchyTestBoundClient} patch sends PATCH request to running Hitchy instance
 * @property {HitchyTestBoundClient} delete sends DELETE request to running Hitchy instance
 * @property {HitchyTestBoundClient} head sends HEAD request to running Hitchy instance
 * @property {HitchyTestBoundClient} options sends OPTIONS request to running Hitchy instance
 * @property {HitchyTestBoundClient} trace sends TRACE request to running Hitchy instance
 * @property {HitchyTestUnboundClient} request sends custom request to running Hitchy instance
 */

module.exports = {
	/**
	 * Starts hitchy service using node's http server.
	 *
	 * @param {object} options global options
	 * @param {object} args arguments as supported by hitchy's CLI tool
	 * @returns {Promise<{server:Server, hitchy:Hitchy}>} promises running server exposing hitchy instance
	 */
	startServer( options = {}, args = {} ) {
		let promise;

		switch ( args.injector || process.env.HITCHY_MODE || "node" ) {
			case "connect" :
			case "express" :
				// make sure express is installed, at least temporarily
				promise = new Promise( ( resolve, reject ) => {
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
				} );
				break;

			default :
				promise = Promise.resolve();
		}

		const _args = Object.assign( {}, DefaultArguments, args );

		if ( options.debug ) {
			_args.quiet = false;
		}

		return promise
			.then( () => BasicServer( options, _args, () => {
				if ( !_args.quiet ) {
					console.error( "Hitchy has been shut down." );

					dumpHandles();
				}
			} ) );

		/**
		 * Dumps active handles of current Node.js process to stderr.
		 *
		 * @returns {void}
		 */
		function dumpHandles() {
			const handles = process._getActiveHandles();

			if ( handles.length < 1 ) {
				return;
			}

			console.error( `${new Date().toISOString()}: dump of active handles:` );

			handles.forEach( handle => {
				if ( handle && handle._events ) {
					Object.keys( handle._events )
						.map( name => {
							const handlers = handle._events[name];
							const _handlers = Array.isArray( handlers ) ? handlers : [handlers];
							const num = _handlers.filter( handler => typeof handler === "function" ).length;

							if ( num > 0 ) {
								console.error( `${num} handler(s) listening for ${name} event of ${( handle.constructor || {} ).name} %j`, handle );
							}
						} );
				}
			} );
		}
	},

	/**
	 * Generates function for setting up Hitchy for testing.
	 *
	 * @param {HitchyTestContext} ctx test context to be established
	 * @param {HitchyOptions} options mock of options for customizing Hitchy behaviour
	 * @param {HitchyCLIArguments} args mock of parsed CLI arguments for testing Hitchy
	 * @returns {function(): Promise<{server: Server, hitchy: Hitchy}>} function for use with test runner to set up Hitchy for testing
	 */
	before( ctx, options = {}, args = {} ) {
		ctx.hitchy = null;
		ctx.server = null;

		return () => module.exports.startServer( options, args ).then( ( { hitchy, server } ) => {
			ctx.hitchy = hitchy;
			ctx.server = server;

			ctx.get = request.bind( ctx, "GET" );
			ctx.post = request.bind( ctx, "POST" );
			ctx.put = request.bind( ctx, "PUT" );
			ctx.patch = request.bind( ctx, "PATCH" );
			ctx.delete = request.bind( ctx, "DELETE" );
			ctx.head = request.bind( ctx, "HEAD" );
			ctx.options = request.bind( ctx, "OPTIONS" );
			ctx.trace = request.bind( ctx, "TRACE" );

			ctx.request = request.bind( ctx );
		} );
	},

	/**
	 * Generates function for tearing down some Hitchy previously set up for testing.
	 *
	 * @param {HitchyTestContext} ctx test context to be established
	 * @returns {function(): Promise} function for use with test runner to tear down Hitchy after testing
	 */
	after( ctx ) {
		return () => ( ctx.server ? ctx.server.stop() : undefined );
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
	request,
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
	const promise = new Promise( function( resolve, reject ) {
		// eslint-disable-next-line no-mixed-operators
		const server = this && this.server;
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
			response.once( "end", () => {
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

		process.nextTick( () => { promise.request = handle; } );

		handle.on( "error", reject );

		if ( body != null ) {
			handle.write( body, "utf8" );
		}

		handle.end();
	} );

	return promise;
}
