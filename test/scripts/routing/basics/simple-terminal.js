"use strict";

let options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "simple-terminal",
	//debug: true,
};

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;
const Hitchy = require( "../../../../injector/index" ).node( options );

// ----------------------------------------------------------------------------

suite( "Serving project in basic-routing-core w/ most simple terminal route", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "GETs /instant", function() {
		return Hitchy.onStarted.then( () => Test.get( "/instant" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
				response.data.type.should.be.equal( "instant" );
			} ) );
	} );

	test( "GETs /partial/deferred", function() {
		return Hitchy.onStarted.then( () => Test.get( "/partial/deferred" )
			.then( function( response ) {
				console.log( response.data );
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
				response.data.type.should.be.equal( "deferred" );
			} ) );
	} );

	test( "GETs /full/deferred", function() {
		return Hitchy.onStarted.then( () => Test.get( "/full/deferred" )
			.then( function( response ) {
				console.log( response.data );
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.method.should.equal( "GET" );
				response.data.params.should.be.empty();
				response.data.query.should.be.empty();
				response.data.args.should.be.empty();
				response.data.type.should.be.equal( "deferred" );
			} ) );
	} );
} );

// NOTE Can't add another suite this time for using scenarios for dynamically
//      switching configuration to suit different testing goals in a single project.
