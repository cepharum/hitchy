"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "list-of-policies",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project in basic-routing-core w/ list of policies", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "succeeds test in controller after passing all listed policies", function() {
		return ctx.get( "/listOfPolicies" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
			} );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
