"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "late-policies-sorting-specific-first",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project in basic-routing-core w/ declaring lists of policies with decreasing specificity", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "passes late policies in proper order from specific policies to generic ones", function() {
		// request once to trigger some processing in late policies
		return ctx.get( "/prefix/check", null, {
			"x-start": 10,
		} )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.success.should.be.true();

				// request again to get the result of late policies processing previous request
				return ctx.get( "/prefix/check", null, {
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
