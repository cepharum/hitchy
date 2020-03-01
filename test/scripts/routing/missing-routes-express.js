"use strict";

const options = {
	projectFolder: "test/projects/invalid-responder-routes",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project w/ expressjs with invalid responder routes", function() {
	const ctx = {};

	before( Test.before( ctx, options, { injector: "express" } ) );
	after( Test.after( ctx ) );

	it( "GETs /test", function() {
		return ctx.get( "/test" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "index" );
			} );
	} );

	it( "misses GETting /missing-controller", function() {
		return ctx.get( "/missing-controller" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "misses GETting /missing-method", function() {
		return ctx.get( "/missing-method" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /something", function() {
		return ctx.get( "/something" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "something" );
			} );
	} );

	it( "GETs /addon", function() {
		return ctx.get( "/addon" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "addon" );
			} );
	} );
} );

describe( "Serving project w/ expressjs w/ prefix with invalid responder routes", function() {
	const ctx = {};

	before( Test.before( ctx, options, { injector: "express", prefix: "/injected/hitchy" } ) );
	after( Test.after( ctx ) );

	it( "GETs /test", function() {
		return ctx.get( "/test" )
			.then( response => {
				// was working above when used w/o prefix
				response.should.have.status( 404 );
			} );
	} );

	it( "misses GETting /missing-controller", function() {
		return ctx.get( "/missing-controller" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "misses GETting /missing-method", function() {
		return ctx.get( "/missing-method" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /something", function() {
		return ctx.get( "/something" )
			.then( response => {
				// was working above when used w/o prefix
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /addon", function() {
		return ctx.get( "/addon" )
			.then( response => {
				// was working above when used w/o prefix
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /injected/hitchy/test", function() {
		return ctx.get( "/injected/hitchy/test" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "index" );
			} );
	} );

	it( "misses GETting /injected/hitchy/missing-controller", function() {
		return ctx.get( "/injected/hitchy/missing-controller" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "misses GETting /injected/hitchy/missing-method", function() {
		return ctx.get( "/injected/hitchy/missing-method" )
			.then( response => {
				response.should.have.status( 404 );
			} );
	} );

	it( "GETs /injected/hitchy/something", function() {
		return ctx.get( "/injected/hitchy/something" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "something" );
			} );
	} );

	it( "GETs /injected/hitchy/addon", function() {
		return ctx.get( "/injected/hitchy/addon" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.json();
				response.data.mode.should.be.String().and.eql( "addon" );
			} );
	} );
} );
