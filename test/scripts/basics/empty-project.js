"use strict";

const options = {
	projectFolder: "test/projects/empty",
	// debug: true,
};

const { describe, it, before, after } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Hitchy standalone", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "can be started", () => ctx.hitchy.onStarted.should.be.Promise().which.is.resolved() );
	it( "can be stopped", () => ctx.hitchy.api.shutdown().should.be.Promise().which.is.resolved() );
} );

describe( "Serving empty project a request accepting HTML", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
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

	it( "misses GETting /view/read", function() {
		return ctx.get( "/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view/read", function() {
		return ctx.post( "/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} );
	} );
} );

describe( "Serving empty project a request accepting text", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /", function() {
		return ctx.post( "/", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view", function() {
		return ctx.get( "/view", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view", function() {
		return ctx.post( "/view", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view/read", function() {
		return ctx.get( "/view/read", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view/read", function() {
		return ctx.post( "/view/read", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} );
	} );
} );

describe( "Serving empty project a request accepting JSON", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /", function() {
		return ctx.post( "/", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} );
	} );

	it( "misses GETting /view", function() {
		return ctx.get( "/view", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /view", function() {
		return ctx.post( "/view", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} );
	} );

	it( "misses GETting /view/read", function() {
		return ctx.get( "/view/read", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /view/read", function() {
		return ctx.post( "/view/read", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} );
	} );
} );
