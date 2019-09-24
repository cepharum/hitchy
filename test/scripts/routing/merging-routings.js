"use strict";

const options = {
	projectFolder: "test/projects/merging-routings",
	debug: true,
};

const { describe, it, before, after } = require( "mocha" );
require( "should" );

const Test = require( "../../../tools/index" ).test;
const Hitchy = require( "../../../injector" ).express;

// ----------------------------------------------------------------------------

describe( "Merging policies", function() {
	const node = Hitchy( options );
	let server = null;

	before( () => Test.startServer( node ).then( s => ( server = s ) ) );
	after( () => server && server.stop() );

	it( "should expose policies for either supported stage", () => {
		const { policies } = node.hitchy.router;

		policies.should.be.Object().which.has.properties( "before", "after" );

		const beforeScalars = policies.before.onMethod( "GET" ).onPrefix( "/scalar/stuff" );

		beforeScalars.should.be.Array().which.has.length( 6 );
		beforeScalars.map( i => i.handler() ).join( "," ).should.be.equal( "early,plugin-a,plugin-c,plugin-b,plugin-d,before" );

		const afterScalars = policies.after.onMethod( "GET" ).onPrefix( "/scalar/stuff" );

		afterScalars.should.be.Array().which.has.length( 4 );
		afterScalars.map( i => i.handler() ).join( "," ).should.be.equal( "after,plugin-d,plugin-b,late" );

		const beforeArrays = policies.before.onMethod( "GET" ).onPrefix( "/array/stuff" );

		beforeArrays.should.be.Array().which.has.length( 6 );
		beforeArrays.map( i => i.handler() ).join( "," ).should.be.equal( "early,plugin-a,plugin-c,plugin-b,plugin-d,before" );

		const afterArrays = policies.after.onMethod( "GET" ).onPrefix( "/array/stuff" );

		afterArrays.should.be.Array().which.has.length( 4 );
		afterArrays.map( i => i.handler() ).join( "," ).should.be.equal( "after,plugin-d,plugin-b,late" );
	} );

	it( "should expose routes for either supported stage", () => {
		const { terminals } = node.hitchy.router;

		const scalars = terminals.onMethod( "GET" ).onPrefix( "/scalar" );

		scalars.should.be.Array().which.has.length( 11 );
		scalars.map( i => i.handler() ).join( "," ).should.be.equal( "early,plugin-a,plugin-c,plugin-b,plugin-d,before,blue-b,after,plugin-d,plugin-b,late" );

		const arrays = terminals.onMethod( "GET" ).onPrefix( "/array" );

		arrays.should.be.Array().which.is.empty();
	} );
} );
