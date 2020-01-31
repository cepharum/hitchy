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

const File = require( "fs" );
const Path = require( "path" );
const Tools = require( "../../tools" );

const Log = require( "debug" )( "hitchy:start" );
const Debug = require( "debug" )( "hitchy:debug" );


/**
 * Implements CLI action for starting Hitchy application.
 *
 * @param {HitchyOptions} options global options customizing Hitchy
 * @param {HitchyCLIArguments} args arguments passed for processing in context of start action
 * @returns {Promise} promises action finished processing
 */
module.exports = function( options, args ) {
	if ( args.plugins || args.extensions ) {
		options.pluginsFolder = args.plugins || args.extensions;
	}

	if ( args.plugin ) {
		options.explicitPlugins = Array.isArray( args.plugin ) ? args.plugin : [args.plugin];
	}

	if ( args["explicit-only"] ) {
		options.explicitPluginsOnly = true;
	}

	if ( args["depend-on"] ) {
		options.dependencies = Array.isArray( args["depend-on"] ) ? args["depend-on"] : [args["depend-on"]];
	}

	if ( args.injector ) {
		return start();
	}

	/*
	 * check if current project contains some script called server.js or
	 * app.js or main.js and invoke this instead of trying to run some own
	 * simple server internally.
	 */
	const files = [ "server.js", "app.js", "main.js" ]
		.map( name => Path.resolve( options.projectFolder, name ) );

	return Tools.promise.find( files, function( filename ) {
		return new Promise( ( resolve, reject ) => {
			File.stat( filename, ( error, stat ) => {
				if ( error ) {
					switch ( error.code ) {
						case "ENOENT" :
							resolve( false );
							return;

						default :
							reject( error );
							return;
					}
				}

				resolve( stat.isFile() );
			} );
		} );
	} )
		.then( start, cause => {
			console.error( "error while looking for start script: " + ( cause.message || cause || "unknown error" ) );
			process.exitCode = 1;
		} );


	/**
	 * Starts server preferring some found script over starting own simple
	 * server.
	 *
	 * @param {string=} scriptname filename of script to run instead of internal server
	 * @returns {Promise} promises result of having run server (this blocks if server stays in foreground!)
	 */
	function start( scriptname = null ) {
		if ( scriptname ) {
			return new Promise( ( resolve, reject ) => {
				Log( `invoking custom start script ${scriptname} ...` );

				const child = require( "child_process" ).fork( scriptname, {
					cwd: options.projectFolder,
					env: process.env,
				} );

				child.on( "exit", ( status, signal ) => {
					if ( status === 0 ) {
						resolve();
					} else {
						reject( new Error( "application script exited on " + ( status || signal ) ) );
					}
				} );
			} );
		}


		Log( `starting application using internal server ...` );

		const port = args.port || process.env.PORT || 3000;
		const addr = args.ip || process.env.IP || "127.0.0.1";

		let startedServer = null;
		let startedHitchy = null;

		return createServer()
			.then( ( { server, hitchy } ) => {
				startedServer = server;
				startedHitchy = hitchy;

				server.on( "error", error => {
					console.error( `server failed: ${error.message}` );

					process.exitCode = 2;
					_handleCancel.call( {}, server, hitchy );
				} );

				server.once( "listening", () => {
					if ( !args.quiet ) {
						console.error( `Hitchy is listening for requests at ${compileUrl( server )}, now.` );
					}
				} );

				hitchy.onStarted
					.then( () => {
						server.on( "request", hitchy );

						server.listen( port, addr, process.env.BACKLOG || 10240 );

						if ( !args.quiet ) {
							console.error( `Hitchy is ready to serve requests, now.` );
						}
					} )
					.catch( error => {
						console.error( `Starting hitchy failed: ${error.stack}` );

						process.exitCode = 3;
						_handleCancel.call( {}, server, hitchy );
					} );


				// handle request for shutting down service either by pressing
				// Ctrl+C with server running in foreground or by sending
				// SIGINT/SIGTERM signal
				server.on( "connection", _trackConnection.bind( {}, server, hitchy ) );

				process.on( "SIGINT", _handleCancel.bind( {}, server, hitchy ) );
				process.on( "SIGTERM", _handleCancel.bind( {}, server, hitchy ) );

				if ( process.platform === "win32" ) {
					require( "readline" ).createInterface( {
						input: process.stdin,
						output: process.stdout
					} )
						.on( "SIGINT", () => {
							process.emit( "SIGINT" );
						} );
				}
			} )
			.catch( error => {
				console.error( error );

				process.exitCode = 1;

				if ( startedServer || startedHitchy ) {
					_handleCancel.call( {}, startedServer, startedHitchy );
				}
			} );
	}

	/**
	 * Creates server listening for requests to be processed by hitchy instance
	 * created and injected into that server, too.
	 *
	 * @returns {Promise<{server: *, hitchy: *}>} promises listening server and hitchy instance bound to it
	 */
	function createServer() {
		switch ( args.injector || "" ) {
			case "node" :
			case "" :
				return startWithNode();

			case "express" :
			case "connect" :
				return startWithExpress();

			default :
				return Promise.reject( new Error( `unknown injector: ${args.injector}` ) );
		}
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
	 * Creates HTTP server instance depending on provided arguments optionally
	 * providing SSL key and certificates for running hitchy via HTTPS.
	 *
	 * @return {Promise<Server>} promises created HTTP(S) server instance
	 */
	function getHttpServer() {
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
	 * Creates hitchy instance bound to dedicated HTTP(S) server instance.
	 *
	 * @returns {Promise<{server: *, hitchy: *}>} promises listening HTTP(S) service and bound hitchy instance
	 */
	function startWithNode() {
		return getHttpServer().then( server => {
			const hitchy = require( "../../injector" ).node( options );

			return { server, hitchy };
		} );
	}

	/**
	 * Creates hitchy instance injected as middleware into a fresh application
	 * based on expressjs.
	 *
	 * @returns {Promise<{server: *, hitchy: *}>} promises listening service (expressjs instance) and injected hitchy instance
	 */
	function startWithExpress() {
		return new Promise( resolve => {
			const hitchy = require( "../../injector" ).express( options );
			const server = require( "express" )();

			server.use( hitchy );

			resolve( { server, hitchy } );
		} );
	}

	/**
	 * Compiles URL provided server instance is available at.
	 *
	 * @param {Server} server server instance
	 * @returns {string} URL of provided server
	 */
	function compileUrl( server ) {
		const addr = server.address();
		let port = addr.port, scheme;

		switch ( port ) {
			case "80" :
				scheme = "http://";
				port = "";
				break;

			case "443" :
				scheme = "https://";
				port = "";
				break;

			default :
				scheme = server.isHttps ? "https://" : "http://";
				port = ":" + port;
		}

		return scheme + addr.address + port;
	}

	/**
	 * Handles request for cancelling/stopping current server.
	 *
	 * This method is reducing timeout on all active connections to shut down
	 * service more instantly.
	 *
	 * @param {Server} server server receiving requests to be forwarded hitchy
	 * @param {Hitchy} hitchy instance of hitchy
	 * @returns {void}
	 * @private
	 */
	function _handleCancel( server, hitchy ) {
		if ( !server.$stoppingServer ) {
			server.$stoppingServer = true;

			Log( "shutting down server ... " );

			// disable keep-alives and reduce timeout on all active connections
			const s = server.$trackedSockets;

			if ( Array.isArray( s ) ) {
				const numSockets = s.length;

				for ( let i = 0; i < numSockets; i++ ) {
					s[i].setKeepAlive( false );
					s[i].setTimeout( 1000 );
				}
			}

			if ( server.listening ) {
				server.once( "close", stopHitchy );
				server.close();
			} else {
				stopHitchy();
			}
		}

		/**
		 * Gracefully shuts down probably started hitchy instance.
		 *
		 * @returns {void}
		 */
		function stopHitchy() {
			if ( hitchy ) {
				Log( "shutting down hitchy ..." );
				hitchy.stop()
					.then( () => process.exit() )
					.catch( () => process.exit() );
			} else {
				process.exit();
			}
		}
	}

	/**
	 * Tracks connections established with running service.
	 *
	 * @param {Server} server server receiving requests to be forwarded hitchy
	 * @param {Hitchy} hitchy instance of hitchy
	 * @param {Socket} socket new incoming connection for sending request(s)
	 * @returns {void}
	 * @private
	 */
	function _trackConnection( server, hitchy, socket ) {
		if ( !Array.isArray( server.$trackedSockets ) ) {
			server.$trackedSockets = [];
		}

		if ( options.debug ) {
			Debug( `new connection from ${socket.remoteAddress}:${socket.remotePort}` );
		}

		server.$trackedSockets.push( socket );

		// keep track of closing connection established now
		socket.once( "close", () => {
			if ( options.debug ) {
				Debug( `closed connection from ${socket.remoteAddress}:${socket.remotePort}` );
			}

			const sockets = server.$trackedSockets;
			const numSockets = sockets.length;

			for ( let i = 0; i < numSockets; i++ ) {
				if ( sockets[i] === socket ) {
					sockets.splice( i, 1 );
					break;
				}
			}
		} );
	}
};
