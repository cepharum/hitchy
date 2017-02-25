"use strict";

let options = {
	projectFolder: "test/projects/core-only"
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"]( options );

// ----------------------------------------------------------------------------

suite( "Serving core-only project w/ simple controllers and policies", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /", function() {
		return Test.get( "/" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
			} )
	} );

	test( "misses POSTing /", function() {
		return Test.post( "/" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
			} )
	} );

	test( "misses GETting /view", function() {
		return Test.get( "/view" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
			} )
	} );

	test( "misses POSTing /view", function() {
		return Test.post( "/view" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
			} )
	} );

	test( "GETs /view/read", function() {
		return Test.get( "/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
			} )
	} );

	test( "POSTs /view/read", function() {
		return Test.post( "/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
			} )
	} );
} );
