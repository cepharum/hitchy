"use strict";

const options = {
	projectFolder: "test/projects/invalid-responder-routes",
	// debug: true,
};

const { suite, test, suiteTeardown, suiteSetup } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools/index" ).test;
const Hitchy = require( "../../../injector" ).node;

// ----------------------------------------------------------------------------

suite( "Serving project with invalid responder routes", function() {
	const hitchy = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "GETs /test", function() {
		return hitchy.onStarted.then( () => Test.get( "/test" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "index" );
			} ) );
	} );

	test( "misses GETting /missing-controller", function() {
		return hitchy.onStarted.then( () => Test.get( "/missing-controller" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} ) );
	} );

	test( "misses GETting /missing-method", function() {
		return hitchy.onStarted.then( () => Test.get( "/missing-method" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} ) );
	} );

	test( "GETs /something", function() {
		return hitchy.onStarted.then( () => Test.get( "/something" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "something" );
			} ) );
	} );

	test( "GETs /addon", function() {
		return hitchy.onStarted.then( () => Test.get( "/addon" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "addon" );
			} ) );
	} );
} );
