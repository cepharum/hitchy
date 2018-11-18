"use strict";

let options = {
	projectFolder: "test/projects/empty",
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" ).node;

require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

suite( "Starting service for testing purposes", function() {
	const node = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( node ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "provides access on hitchy API", function() {
		node.hitchy.should.be.ok();
		node.hitchy.should.have.ownProperty( "runtime" );
		node.hitchy.runtime.should.be.ok();
	} );
} );
