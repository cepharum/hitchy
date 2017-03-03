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

const File = require( "fs" );
const Path = require( "path" );
const Tools = require( "../../tools" );

/**
 *
 * @param {HitchyOptions} options
 * @param {HitchyCLIArguments} args
 */
module.exports = function( options, args ) {
	let hitchy = null;


	if ( args.injector ) {
		return start();
	} else {
		/*
		 * check if current project contains some script called server.js or
		 * app.js or main.js and invoke this instead of trying to run some own
		 * simple server internally.
		 */
		let files = ["server.js", "app.js", "main.js"]
			.map( name => Path.resolve( options.projectFolder, name ) );

		return Tools.promise.find( files, function( filename ) {
			return new Promise( function( resolve, reject ) {
				File.stat( filename, function( error, stat ) {
					if ( error ) {
						switch ( error.code ) {
							case "ENOENT" :
								return resolve( false );
							default :
								return reject( error );
						}
					}

					resolve( stat.isFile() );
				} )
			} );
		} )
			.then( start, function( cause ) {
				console.error( "error while looking for start script: " + ( cause.message || cause || "unknown error" ) );
				process.exitCode = 1;
			} );
	}

	/**
	 * Starts server preferring some found script over starting own simple
	 * server.
	 *
	 * @param {string=} scriptname filename of script to run instead of internal server
	 * @returns {Promise} promises result of having run server (this blocks if server stays in foreground!)
	 */
	function start( scriptname ) {
		return new Promise( function( resolve, reject ) {
			if ( scriptname ) {
				console.error( `invoking custom start script ${scriptname} ...` );

				let child = require( "child_process" ).fork( scriptname, {
					cwd: options.projectFolder,
					env: process.env,
				} );

				child.on( "exit", function( status, signal ) {
					if ( status !== 0 ) {
						reject( new Error( "application script exited on " + ( status || signal ) ) );
					} else {
						resolve();
					}
				} );

				return;
			}


			console.error( `starting application using internal server ...` );

			let port = args.port || process.env.PORT || 3000;
			let ip = args.ip || process.env.IP || "127.0.0.1";
			let server;

			switch ( args.injector || "" ) {
				case "node" :
				case "" :
					server = startWithNode( port, ip );
					break;

				case "express" :
				case "connect" :
					server = startWithExpress( port, ip );
					break;

				default :
					console.error( "unknown injector: " + args.injector );
					process.exitCode = 1;
			}

			if ( server ) {
				// revise support for shutting down service running in
				// foreground using Strg+C
				server.on( "connection", _trackConnection.bind( server ) );

				process.on( "SIGINT", _handleCancel.bind( server ) );
				process.on( "SIGTERM", _handleCancel.bind( server ) );

				if ( process.platform === "win32" ) {
					require( "readline" ).createInterface( {
						input:  process.stdin,
						output: process.stdout
					} )
						.on( "SIGINT", function() {
							process.emit( "SIGINT" );
						} );
				}
			}
		} );
	}

	function startWithNode( port, ip ) {
		hitchy = require( "../../injector" ).node( options );

		let httpd = require( "http" ).createServer( hitchy );

		httpd.listen( port, ip, process.env.BACKLOG || 10240, onListening.bind( httpd ) );

		return httpd;
	}

	function startWithExpress( port, ip ) {
		hitchy = require( "../../injector" ).express( options );

		let app = require( "express" )();

		app.use( hitchy );

		app.listen( port, ip, process.env.BACKLOG || 10240, onListening.bind( app ) );

		return app;
	}

	/**
	 * @this Server
	 */
	function onListening() {
		if ( !args.quiet ) {
			let addr = this.address(),
			    port = addr.port,
			    url;

			switch ( port ) {
				case "80" :
					url = "http://";
					port = "";
					break;
				case "443" :
					url = "https://";
					port = "";
					break;
				default :
					url = this.encrypted ? "https://" : "http://";
					port = ":" + port;
			}

			url += addr.address + port;

			console.error( `
Service is running. Open 

   ${url} 

in your favourite browser now!
` );
		}
	}

	/**
	 * Handles request for cancelling/stopping current server.
	 *
	 * This method is reducing timeout on all active connections to shut down
	 * service more instantly.
	 *
	 * @this Server
	 * @private
	 */
	function _handleCancel() {
		if ( !this.$stoppingServer ) {
			this.$stoppingServer = true;

			console.error( "shutting down server ... " );

			// disable any keep-alive mode and reduce timeout on active connections
			let s = this.$trackedSockets,
			    i, l;

			if ( Array.isArray( s ) ) {
				for ( i = 0, l = s.length; i < l; i++ ) {
					s[i].setKeepAlive( false );
					s[i].setTimeout( 1000 );
				}
			}

			this.on( "close", function() {
				if ( hitchy ) {
					console.error( "shutting down hitchy ..." );
					hitchy.stop()
						.then( _exit );
				} else {
					_exit();
				}

				function _exit() {
					process.exit();
				}
			} );

			// close server's listening socket
			this.close();
		}
	}

	/**
	 * Tracks connections established with running service.
	 *
	 * @this Server
	 * @param {Socket} newSocket
	 * @private
	 */
	function _trackConnection( newSocket ) {
		let that = this;

		if ( !Array.isArray( this.$trackedSockets ) ) {
			this.$trackedSockets = [];
		}

		this.$trackedSockets.push( newSocket );

		// keep track of closing connection established now
		newSocket.on( "close", function() {
			let s = that.$trackedSockets,
			    i, l;

			for ( i = 0, l = s.length; i < l; i++ ) {
				if ( s[i] === newSocket ) {
					break;
				}
			}

			if ( i < l ) {
				that.$trackedSockets.splice( i, 1 );
			}
		} );
	}
};
