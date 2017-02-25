"use strict";

let options = {
	projectFolder: "test/projects/empty",
	onStarted: true // to be replaced with Promise
};

const Tools = require( "../../tools" );
const Hitchy = require( "../../../injector/index.js" )[process.env.HITCHY_MODE || "node"]( options );

// ----------------------------------------------------------------------------

suite( "Serving empty project" );

test( "rejects requests with 404 Not Found", function runningServer( done ) {
	let server = Tools.startServer( Hitchy );

	server.listen( function() {
		let socket = server.address();

		options.onStarted.then( function() {
			Tools.get( "http://127.0.0.1:" + socket.port )
				.then( function( response ) {
					response.should.have.value( "statusCode", 404 );

					Hitchy.stop().then( done, done );
				} );
		}, done );
	} );
} );
