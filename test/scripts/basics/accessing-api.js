"use strict";

const options = {
	projectFolder: "test/projects/empty",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Hitchy node running empty project folder", () => {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "has access on Hitchy API", () => {
		ctx.hitchy.api.should.be.ok();
		ctx.hitchy.api.should.have.ownProperty( "runtime" );
		ctx.hitchy.api.runtime.should.be.ok();
	} );
} );

describe( "Hitchy node running project with routed controllers", () => {
	const ctx = {};

	after( Test.after( ctx ) );
	before( Test.before( ctx, {
		projectFolder: "test/projects/core-only",
		// debug: true,
	} ) );

	it( "exposes Hitchy's API via `this.api`", () => {
		return ctx.get( "/mirror/api" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.have.property( "this" ).which.is.Array().and.not.empty();
			} );
	} );

	it( "exposes Hitchy's API via `req.hitchy`", () => {
		return ctx.get( "/mirror/api" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.have.property( "req" ).which.is.Array().and.not.empty();
			} );
	} );

	it( "exposes same instance of Hitchy's API in either case", () => {
		return ctx.get( "/mirror/api" )
			.then( res => {
				res.should.have.status( 200 );
				res.data.should.have.property( "same" ).which.is.true();
			} );
	} );
} );
