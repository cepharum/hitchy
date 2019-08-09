"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "late-policies-sorting-specific-first",
	// debug: true,
};

const Test = require( "../../../../tools/index" ).test;
const Hitchy = require( "../../../../injector" ).node;

require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

suite( "Serving project in basic-routing-core w/ declaring lists of policies with decreasing specificity", function() {
	const hitchy = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "passes late policies in proper order from specific policies to generic ones", function() {
		// request once to trigger some processing in late policies
		return hitchy.onStarted.then( () => Test.get( "/prefix/check", null, {
			"x-start": 10,
		} ) )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.success.should.be.true();

				// request again to get the result of late policies processing previous request
				return Test.get( "/prefix/check", null, {
					"x-start": 10,
				} );
			} )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.success.should.be.true();
				response.data.previousResult.should.be.Number().which.is.equal( 326 );
			} );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
