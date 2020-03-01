"use strict";

const options = {
	projectFolder: "test/projects/invalid-responder-routes",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project with invalid responder routes", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "GETs /test", function() {
		return ctx.get( "/test" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "index" );
			} );
	} );

	it( "misses GETting /missing-controller", function() {
		return ctx.get( "/missing-controller" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "misses GETting /missing-method", function() {
		return ctx.get( "/missing-method" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /something", function() {
		return ctx.get( "/something" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "something" );
			} );
	} );

	it( "GETs /addon", function() {
		return ctx.get( "/addon" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "addon" );
			} );
	} );
} );
