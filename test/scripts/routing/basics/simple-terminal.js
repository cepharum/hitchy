"use strict";

let options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "simple-terminal",
	//debug: true,
};

const Test = require( "../../../../tools/index" ).test;
const Hitchy = require( "../../../../injector" ).node;

require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

suite( "Serving project in basic-routing-core w/ most simple terminal route", function() {
	const hitchy = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "GETs /instant", function() {
		return hitchy.onStarted.then( () => Test.get( "/instant" )
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
		return hitchy.onStarted.then( () => Test.get( "/partial/deferred" )
			.then( function( response ) {
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
		return hitchy.onStarted.then( () => Test.get( "/full/deferred" )
			.then( function( response ) {
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
