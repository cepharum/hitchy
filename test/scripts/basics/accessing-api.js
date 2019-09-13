"use strict";

const { suite, test, suiteTeardown, suiteSetup } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" ).node;

// ----------------------------------------------------------------------------

suite( "Hitchy node running empty project folder", () => {
	let server = null;
	const node = Hitchy( {
		projectFolder: "test/projects/empty",
		// debug: true,
	} );

	suiteSetup( () => Test.startServer( node ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "has access on hitchy API", () => {
		node.hitchy.should.be.ok();
		node.hitchy.should.have.ownProperty( "runtime" );
		node.hitchy.runtime.should.be.ok();
	} );
} );

suite( "Hitchy node running project with routed controllers", () => {
	let server = null;
	const node = Hitchy( {
		projectFolder: "test/projects/core-only",
		// debug: true,
	} );

	suiteSetup( () => Test.startServer( node ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "exposes Hitchy's API via `this.api`", () => {
		return Test.get( "/mirror/api" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.have.property( "this" ).which.is.Array().and.not.empty();
			} );
	} );

	test( "exposes Hitchy's API via `req.hitchy`", () => {
		return Test.get( "/mirror/api" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.have.property( "req" ).which.is.Array().and.not.empty();
			} );
	} );

	test( "exposes same instance of Hitchy's API in either case", () => {
		return Test.get( "/mirror/api" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.have.property( "same" ).which.is.true();
			} );
	} );
} );
