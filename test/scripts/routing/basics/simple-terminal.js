"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "simple-terminal",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project in basic-routing-core w/ most simple terminal route", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "GETs /instant", function() {
		return ctx.get( "/instant" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
				response.data.type.should.be.equal( "instant" );
			} );
	} );

	it( "GETs /partial/deferred", function() {
		return ctx.get( "/partial/deferred" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
				response.data.type.should.be.equal( "deferred" );
			} );
	} );

	it( "GETs /full/deferred", function() {
		return ctx.get( "/full/deferred" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
				response.data.type.should.be.equal( "deferred" );
			} );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
