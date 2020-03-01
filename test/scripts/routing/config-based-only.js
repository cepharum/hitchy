"use strict";

const options = {
	projectFolder: "test/projects/core-only",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

const Should = require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Serving core-only project w/ simple controllers and policies", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "GETs /", function() {
		return ctx.get( "/" )
			.then( response => {
				response.should.have.status( 200 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bwelcome\b/i ).and.match( /<p>/i );
			} );
	} );

	it( "misses POSTing /", function() {
		return ctx.post( "/" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view", function() {
		return ctx.get( "/view" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view", function() {
		return ctx.post( "/view" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} );
	} );

	it( "GETs /view/read", function() {
		return ctx.get( "/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "instant session!" );
				Should( response.data.id ).be.undefined();
			} );
	} );

	it( "POSTs /view/read", function() {
		return ctx.post( "/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "instant session!" );
				Should( response.data.id ).be.undefined();
			} );
	} );

	it( "GETs /view/read/1234", function() {
		return ctx.get( "/view/read/1234" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				require( "should" )( response.data.session ).be.undefined();
				response.data.id.should.be.String().and.equal( "1234" );
			} );
	} );

	it( "POSTs /view/read/1234", function() {
		return ctx.post( "/view/read/1234" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				response.data.id.should.be.String().and.equal( "1234" );
			} );
	} );

	it( "GETs /view/create", function() {
		return ctx.get( "/view/create" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				Should( response.data.id ).be.undefined();
				Should( response.data.name ).be.undefined();
			} );
	} );

	it( "GETs /view/create/someId", function() {
		return ctx.get( "/view/create/someId" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				Should( response.data.id ).be.undefined();
				response.data.name.should.be.String().and.equal( "someId" );
			} );
	} );

	it( "POSTs /view/create/someSimpleName?extra=1", function() {
		return ctx.post( "/view/create/someSimpleName?extra=1" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				Should( response.data.id ).be.undefined();
				response.data.name.should.be.Array().and.eql( ["someSimpleName"] );
				response.data.extra.should.be.String().and.equal( "1" );
			} );
	} );

	it( "POSTs /view/create/some/complex/name?extra[]=foo&extra[]=bar", function() {
		return ctx.post( "/view/create/some/complex/name?extra[]=foo&extra[]=bar" )
			.then( response => {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				Should( response.data.id ).be.undefined();
				response.data.name.should.be.Array().and.eql( [ "some", "complex", "name" ] );
				response.data.extra.should.be.Array().and.eql( [ "foo", "bar" ] );
			} );
	} );
} );
