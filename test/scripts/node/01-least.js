"use strict";

let options = {
	projectFolder: "projects/empty",
	onStarted: true // to be replaced with Promise
};

const assert = require( "assert" );
const HTTP = require( "http" );
const hitchy = require( "../../../injector/index.js" ).node( options );


suite( "Least project with node" );

test( "running server", function runningServer( done ) {
	let server = HTTP.createServer( hitchy );

	options.onStarted.catch( done );

	server.listen( function() {
		let socket = server.address();

		setTimeout( function queryingServer() {
			HTTP.get( "http://127.0.0.1:" + socket.port, function( res ) {
				assert.equal( res.statusCode, 404, "query did not yield 404 response status" );

				hitchy();
				done();
			} );
		}, 1000 );
	} );
} );
