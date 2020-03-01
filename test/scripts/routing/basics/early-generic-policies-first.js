"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "early-policies-sorting-generic-first",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project in basic-routing-core w/ declaring lists of policies with increasing specificity", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "passes early policies in proper order from generic policies to specific ones", function() {
		return ctx.get( "/prefix/check" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
			} );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
