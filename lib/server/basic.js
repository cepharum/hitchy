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

const File = require( "fs" );

const Debug = require( "debug" );

const Injectors = require( "../../injector" );


/**
 * Implements basic version of internal server for exposing hitchy-based
 * application.
 *
 * @param {HitchyOptions} options global options customizing Hitchy
 * @param {HitchyCLIArguments} args arguments passed for processing in context of start action
 * @param {function} onShutdownComplete callback invoked **after** having shut down server
 * @returns {Promise<{server:Server, hitchy:HitchyInstance}>} promises server started
 */
module.exports = function basicServer( options, args, onShutdownComplete ) {
	const logInfo = Debug( "hitchy:server:basic:info" );
	const logDebug = Debug( "hitchy:server:basic:debug" );
	const logError = Debug( "hitchy:server:basic:error" );

	const port = args.port || process.env.PORT || 3000;
	const addr = args.ip || process.env.IP || "127.0.0.1";

	let startedServer = null;
	let startedHitchy = null;

	logInfo( `starting application` );

	return Promise.all( [
		createHttpServer(),
		createHitchyInstance(),
	] )
		.then( ( [ server, hitchy ] ) => {
			startedServer = server;
			startedHitchy = hitchy;

			server.once( "error", error => {
				logError( `server failed: ${error.message}` );

				process.exitCode = 2;
				stopRequestListener();
			} );

			server.once( "close", stopHitchy );

			server.stop = stopRequestListener;

			const [ , value, unit ] = /^\s*(\d+)\s*(ms|s|m)?\s*/i.exec( args.timeout || process.env.HITCHY_TIMEOUT ) || [];
			if ( value ) {
				let timeoutMs;

				switch ( ( unit || "ms" ).toLowerCase() ) {
					case "m" :
						timeoutMs = parseInt( value ) * 60000;
						break;
					case "s" :
						timeoutMs = parseInt( value ) * 1000;
						break;
					default :
						timeoutMs = parseInt( value );
				}

				logDebug( "setting request timeout to %dms", timeoutMs );

				server.setTimeout( timeoutMs );
			}

			process.on( "SIGINT", stopRequestListener );
			process.on( "SIGTERM", stopRequestListener );

			return hitchy.onStarted
				.then( () => new Promise( resolve => {
					logDebug( `Hitchy service has been prepared.` );

					hitchy.api.once( "shutdown", () => {
						logDebug( "got notification for shutting down service" );

						stopRequestListener();
					} );

					hitchy.api.once( "crash", cause => {
						logError( `FATAL: Hitchy has crashed: ${cause.stack}` );

						process.exitCode = 4;
						stopRequestListener();
					} );

					attach( server, hitchy );

					server.on( "connection", trackActiveConnection );

					server.listen( port, addr, process.env.BACKLOG || 10240, () => {
						logInfo( `Hitchy is listening for requests at ${compileUrl( server )}, now.` );

						resolve( { server, hitchy } );
					} );
				} ) );
		} )
		.catch( error => {
			logError( `starting Hitchy failed: ${error.stack}` );

			process.exitCode = 1;

			if ( startedServer || startedHitchy ) {
				stopRequestListener();
			}

			throw error;
		} );

	/**
	 * Generates function suitable for handling incoming requests in context of
	 * Node.js based HTTP server.
	 *
	 * @returns {Promise<HitchyInstance>} promises instance of Hitchy, basically a function suitable for handling HTTP requests
	 */
	function createHitchyInstance() {
		const name = args.injector || "node";
		const injector = Injectors[name];

		if ( injector && typeof injector === "function" ) {
			return Promise.resolve( injector( options ) );
		}

		return Promise.reject( new Error( `unknown injector: ${args.injector}` ) );
	}

	/**
	 * Creates HTTP server instance depending on provided arguments optionally
	 * providing SSL key and certificates for running hitchy via HTTPS.
	 *
	 * @return {Promise<Server>} promises created HTTP(S) server instance
	 */
	function createHttpServer() {
		const { sslKey, sslCert, sslCaCert } = args;

		if ( sslKey && sslCert ) {
			return Promise.all( [
				readFile( sslKey ),
				readFile( sslCert ),
				sslCaCert ? readFile( sslCaCert ) : Promise.resolve( null ),
			] )
				.catch( error => {
					throw new Error( `reading one or more SSL file(s) failed: ${error.message}` );
				} )
				.then( ( [ key, cert, ca ] ) => Object.assign( require( "https" ).createServer( {
					key, cert, ca,
				} ), { isHttps: true } ) );
		}

		if ( sslKey || sslCert ) {
			return Promise.reject( new Error( "incomplete SSL configuration: provide filenames of key AND cert" ) );
		}

		return Promise.resolve( Object.assign( require( "http" ).createServer(), { isHttps: false } ) );
	}

	/**
	 * Reads content of file selected by its name.
	 *
	 * @param {string} fileName name of file to read
	 * @return {Promise<Buffer>} selected file's content
	 */
	function readFile( fileName ) {
		return new Promise( ( resolve, reject ) => {
			File.readFile( fileName, ( error, content ) => {
				if ( error ) {
					reject( error );
				} else {
					resolve( content );
				}
			} );
		} );
	}

	/**
	 * Compiles URL provided server instance is available at.
	 *
	 * @param {Server} server server instance
	 * @returns {string} URL of provided server
	 */
	function compileUrl( server ) {
		const serverAddress = server.address();
		let serverPort = serverAddress.port, scheme;

		switch ( serverPort ) {
			case "80" :
				scheme = "http://";
				serverPort = "";
				break;

			case "443" :
				scheme = "https://";
				serverPort = "";
				break;

			default :
				scheme = server.isHttps ? "https://" : "http://";
				serverPort = ":" + serverPort;
		}

		return scheme + serverAddress.address + serverPort;
	}

	/**
	 * Integrates provided instance of Hitchy with given server for handling its
	 * incoming requests.
	 *
	 * @param {Http.Server|Https.Server} server server instance listening for HTTP requests
	 * @param {HitchyInstance} hitchy instance of Hitchy meant to handle requests of server
	 * @returns {void}
	 */
	function attach( server, hitchy ) {
		switch ( hitchy.injector ) {
			case "node" :
				server.on( "request", hitchy );
				break;

			case "connect" : {
				const app = require( "express" )();
				const mountPath = args.prefix || options.prefix;

				if ( mountPath == null ) {
					app.use( hitchy );
				} else {
					app.use( mountPath, hitchy );
				}

				server.on( "request", app );
				break;
			}

			default :
				throw new Error( "missing integration of injector type %s with HTTP(S) server", hitchy.injector );
		}
	}

	/**
	 * Tracks connections established with running service.
	 *
	 * @param {Socket} socket new incoming client connection
	 * @returns {void}
	 * @private
	 */
	function trackActiveConnection( socket ) {
		if ( !startedServer ) {
			return;
		}

		if ( startedServer.$stoppingServer ) {
			socket.destroy( new Error( "server is shutting down" ) );
			return;
		}

		if ( !Array.isArray( startedServer.$trackedSockets ) ) {
			startedServer.$trackedSockets = [];
		}

		if ( options.debug ) {
			logDebug( `new connection from ${socket.remoteAddress}:${socket.remotePort}` );
		}

		startedServer.$trackedSockets.push( socket );

		// keep track of closing connection established now
		socket.once( "close", () => {
			if ( options.debug ) {
				logDebug( `closed connection from ${socket.remoteAddress}:${socket.remotePort}` );
			}

			const sockets = startedServer.$trackedSockets;
			const numSockets = sockets.length;

			for ( let i = 0; i < numSockets; i++ ) {
				if ( sockets[i] === socket ) {
					sockets.splice( i, 1 );
					break;
				}
			}
		} );
	}

	/**
	 * Handles stage #1 of shutting down service by stopping request listener.
	 *
	 * This method is reducing timeout on all active connections to shut down
	 * service more instantly. Eventually it is triggering stage #2 ...
	 *
	 * @returns {void}
	 * @private
	 */
	function stopRequestListener() {
		if ( startedServer && !startedServer.$stoppingServer ) {
			startedServer.$stoppingServer = true;

			logInfo( "shutting down request listener ... " );

			process.off( "SIGINT", stopRequestListener );
			process.off( "SIGTERM", stopRequestListener );

			// disable keep-alives and reduce timeout on all active connections
			const s = startedServer.$trackedSockets;

			if ( Array.isArray( s ) ) {
				const numSockets = s.length;
				const socketTimeout = ( parseInt( process.env.SHUTDOWN_SOCKET_TIMEOUT ) || 1 ) * 1000;

				logInfo( "reducing timeout of %d socket(s) to %dms", numSockets, socketTimeout );

				for ( let i = 0; i < numSockets; i++ ) {
					const socket = s[i];

					socket.setKeepAlive( false );
					socket.setTimeout( socketTimeout );
				}
			}

			if ( startedServer.listening ) {
				logInfo( "waiting for listening server to shut down" );

				// shutdown server's listener first
				startedServer.close();

				// don't stop Hitchy unless request listener has been shut down
				return;
			}
		}

		stopHitchy();
	}

	/**
	 * Gracefully shuts down probably started hitchy instance.
	 *
	 * @returns {void}
	 */
	function stopHitchy() {
		if ( startedHitchy ) {
			logInfo( "shutting down Hitchy ..." );

			startedHitchy.stop()
				.then( () => {
					logInfo( "shutdown complete" );

					process.nextTick( () => onShutdownComplete );
				} )
				.catch( error => {
					logError( "shutting down Hitchy failed: %s", error.stack );

					process.nextTick( () => onShutdownComplete );
				} );
		} else {
			process.nextTick( onShutdownComplete );
		}
	}
};
