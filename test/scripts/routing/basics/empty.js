"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "empty",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project in basic-routing-core w/o any application-specific routes", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /blueprint/6789", function() {
		return ctx.get( "/blueprint/6789" )
			.then( response => {
				response.should.have.status( 200 );
				response.data.gotBlueprint.should.be.ok();
			} );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
