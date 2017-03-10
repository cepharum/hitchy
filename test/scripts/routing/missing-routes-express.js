"use strict";

let options = {
	projectFolder: "test/projects/invalid-responder-routes",
	//debug: true,
};

const Test = require( "../../../tools/index" ).test;
const Hitchy = require( "../../../injector/index" )["express"]( options );

// ----------------------------------------------------------------------------

suite( "Serving project w/ expressjs with invalid responder routes", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "GETs /test", function() {
		return Test.get( "/test" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "index" );
			} );
	} );

	test( "misses GETting /missing-controller", function() {
		return Test.get( "/missing-controller" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} );
	} );

	test( "misses GETting /missing-method", function() {
		return Test.get( "/missing-method" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} );
	} );

	test( "GETs /something", function() {
		return Test.get( "/something" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "something" );
			} );
	} );

	test( "GETs /addon", function() {
		return Test.get( "/addon" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "addon" );
			} );
	} );
} );

suite( "Serving project w/ expressjs w/ prefix with invalid responder routes", function() {
	suiteSetup( () => Test.startServer( Hitchy, { prefix: "/injected/hitchy" } ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "GETs /injected/hitchy/test", function() {
		return Test.get( "/injected/hitchy/test" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "index" );
			} );
	} );

	test( "misses GETting /injected/hitchy/missing-controller", function() {
		return Test.get( "/injected/hitchy/missing-controller" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} );
	} );

	test( "misses GETting /injected/hitchy/missing-method", function() {
		return Test.get( "/injected/hitchy/missing-method" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} );
	} );

	test( "GETs /injected/hitchy/something", function() {
		return Test.get( "/injected/hitchy/something" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "something" );
			} );
	} );

	test( "GETs /injected/hitchy/addon", function() {
		return Test.get( "/injected/hitchy/addon" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "addon" );
			} );
	} );
} );
