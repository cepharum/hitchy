"use strict";

let options = {
	projectFolder: "test/projects/basic-routing-core",
	scenario: "default",
	//debug: true,
};

require( "should" );
require( "should-http" );

const Test = require( "../../../tools/index" ).test;
const Hitchy = require( "../../../injector/index" )["node"]( options );

// ----------------------------------------------------------------------------

suite( "Serving project in basic-routing-core w/o any routes", function() {
	suiteSetup( () => options.scenario = "empty", Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/" )
			.then( function( response ) {
				response.should.have.status( 404 );
			} ) );
	} );
} );

suite( "Serving project in basic-routing-core w/ most simple terminal route", function() {
	suiteSetup( () => options.scenario = "simple-terminal", Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "GETs /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
			} ) );
	} );
} );
