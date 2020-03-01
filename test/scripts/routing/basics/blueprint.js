"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "blueprint",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project in basic-routing-core w/ route accompanying blueprints", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "hits blueprint terminal route on GETting /blueprint/1234", function() {
		return ctx.get( "/blueprint/1234" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.should.have.properties( "session", "gotBlueprint" ).and.have.size( 2 );
			} );
	} );

	it( "misses blueprint terminal route on GETting /blueprint/catched due to preceding custom route", function() {
		return ctx.get( "/blueprint/catched" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.should.not.have.properties( "gotBlueprint" );
				response.data.method.should.equal( "GET" );
			} );
	} );

	it( "hits blueprint terminal route on GETting /blueprint/missed due to custom route succeeding blueprint", function() {
		return ctx.get( "/blueprint/missed" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.should.have.properties( "session", "gotBlueprint" ).and.have.size( 2 );
			} );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
