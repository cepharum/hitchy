"use strict";

let options = {
	projectFolder: "test/projects/empty",
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )["node"]( options );

// ----------------------------------------------------------------------------

suite( "Starting service for testing purposes", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "provides access on hitchy API", function() {
		Hitchy.hitchy.should.be.ok();
		Hitchy.hitchy.should.have.ownProperty( "runtime" );
		Hitchy.hitchy.runtime.should.be.ok();
	} );
} );
