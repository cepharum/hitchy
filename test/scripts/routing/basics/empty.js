"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "empty",
	// debug: true,
};

const { suite, test, suiteTeardown, suiteSetup } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;
const Hitchy = require( "../../../../injector" ).node;

// ----------------------------------------------------------------------------

suite( "Serving project in basic-routing-core w/o any application-specific routes", function() {
	const hitchy = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "misses GETting /", function() {
		return hitchy.onStarted.then( () => Test.get( "/" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} ) );
	} );

	test( "GETs /blueprint/6789", function() {
		return hitchy.onStarted.then( () => Test.get( "/blueprint/6789" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.data.gotBlueprint.should.be.ok();
			} ) );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
