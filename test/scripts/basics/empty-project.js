"use strict";

let options = {
	projectFolder: "test/projects/empty",
	onStarted: true // to be replaced with Promise
};

const Tools = require( "../../tools" );
const hitchy = require( "../../../injector/index.js" )[process.env.HITCHY_MODE || "node"]( options );

// ----------------------------------------------------------------------------

suite( "Least project with node" );

test( "running server", function runningServer( done ) {
	let server = Tools.startServer( hitchy );

	server.listen( function() {
		let socket = server.address();

		options.onStarted.then( function() {
			Tools.get( "http://127.0.0.1:" + socket.port )
				.then( function( res ) {
					res.should.have.value( "statusCode", 404 );

					Tools.stopServer( hitchy );
					done();
				} );
		}, done );
	} );
} );
