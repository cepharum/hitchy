"use strict";

const options = {
	projectFolder: "test/projects/empty-plugins",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project w/ empty plugins", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "detects all components enabled by default", function() {
		return ctx.get( "/", undefined, { accept: "text/json" } )
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
				response.data.should.not.have.property( "non-plugin" );

				response.data["final-c"].index.should.be.above( response.data["b"].index );
				response.data["final-c"].index.should.be.above( response.data["important"].index );
				response.data["b"].index.should.be.above( response.data["important"].index );
			} );
	} );
} );
