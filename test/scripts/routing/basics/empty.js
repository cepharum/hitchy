"use strict";

let options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "empty",
	//debug: true,
};

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;
const Hitchy = require( "../../../../injector/index" ).node( options );

// ----------------------------------------------------------------------------

suite( "Serving project in basic-routing-core w/o any routes", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} ) );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
