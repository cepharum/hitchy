"use strict";

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Hitchy node running project with routed controllers", () => {
	const ctx = {};

	before( Test.before( ctx, {
		projectFolder: "test/projects/core-only",
		// debug: true,
	} ) );
	after( Test.after( ctx ) );

	it( "handles GET-request for /internal/dispatch", () => {
		return ctx.get( "/internal/dispatch" )
			.then( res => {
				res.should.have.status( 500 );
				res.data.should.be.Object().which.has.property( "error" )
					.which.is.equal( "This result has NOT been fetched using internal dispatching." );
			} );
	} );

	it( "forwards request internally to same URL using `req.hitchy.Client`", () => {
		return ctx.get( "/forward" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.be.Object().which.has.property( "info" )
					.which.is.equal( "This result has been fetched using internal dispatching." );
			} );
	} );
} );
