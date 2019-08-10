"use strict";

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" ).node;

require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

suite( "Hitchy node running project with routed controllers", () => {
	let server = null;
	const node = Hitchy( {
		projectFolder: "test/projects/core-only",
		// debug: true,
	} );

	suiteSetup( () => Test.startServer( node ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "handles GET-request for /internal/dispatch", () => {
		return Test.get( "/internal/dispatch" )
			.then( res => {
				res.should.have.status( 500 );
				res.data.should.be.Object().which.has.property( "error" )
					.which.is.equal( "This result has NOT been fetched using internal dispatching." );
			} );
	} );

	test( "forwards request internally to same URL using `req.hitchy.Client`", () => {
		return Test.get( "/forward" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.be.Object().which.has.property( "info" )
					.which.is.equal( "This result has been fetched using internal dispatching." );
			} );
	} );
} );
