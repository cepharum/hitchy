"use strict";

const options = {
	projectFolder: "test/projects/empty-extensions",
	// debug: true,
};

const { suite, test, suiteTeardown, suiteSetup } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"];

// ----------------------------------------------------------------------------

suite( "Serving project w/ empty plugins", function() {
	const hitchy = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "detects all components enabled by default", function() {
		return hitchy.onStarted
			.then( () => Test.get( "/", undefined, { accept: "text/json" } ) )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();

				response.data.should.have.property( "empty-a" );        // due to project lacking dependency list thus loading EVERY available component
				response.data.should.not.have.property( "aliased-b" );  // due to filling differently named role
				response.data.should.have.property( "b" );
				response.data.should.have.property( "final-c" );
				response.data.should.not.have.property( "strong-role" );// due to filling differently named role
				response.data.should.not.have.property( "weak-role" );  // due to filling differently named role
				response.data.should.have.property( "important" );      // role filled by either of the two
				response.data.should.not.have.property( "non-extension" );

				response.data["final-c"].index.should.be.above( response.data["b"].index );
				response.data["final-c"].index.should.be.above( response.data["important"].index );
				response.data["b"].index.should.be.above( response.data["important"].index );
			} );
	} );
} );
