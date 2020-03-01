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

describe( "Injecting Hitchy into `express`", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express" } ) );
	after( Test.after( ctx ) );

	it( "is using related injector", () => ctx.hitchy.should.have.property( "injector" ).which.is.equal( "connect" ) );
	it( "can be started", () => ctx.hitchy.onStarted.should.be.Promise().which.is.resolved() );
	it( "can be stopped", () => ctx.hitchy.api.shutdown().should.be.Promise().which.is.resolved() );
} );

describe( "Serving empty project via `express` a request accepting HTML", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express" } ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /", function() {
		return ctx.post( "/" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view", function() {
		return ctx.get( "/view" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view", function() {
		return ctx.post( "/view" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view/read", function() {
		return ctx.get( "/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view/read", function() {
		return ctx.post( "/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
			} );
	} );
} );

describe( "Serving empty project via `express` a request accepting text", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express" } ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /", function() {
		return ctx.post( "/", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view", function() {
		return ctx.get( "/view", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view", function() {
		return ctx.post( "/view", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /view/read", function() {
		return ctx.get( "/view/read", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /view/read", function() {
		return ctx.post( "/view/read", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ); // .and.not.match( /<html\b/i );
			} );
	} );
} );

describe( "Serving empty project via `express` a request accepting JSON", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express" } ) );
	after( Test.after( ctx ) );

	it( "misses GETting /", function() {
		return ctx.get( "/", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+GET/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /", function() {
		return ctx.post( "/", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+POST/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses GETting /view", function() {
		return ctx.get( "/view", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+GET/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /view", function() {
		return ctx.post( "/view", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+POST/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses GETting /view/read", function() {
		return ctx.get( "/view/read", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+GET/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /view/read", function() {
		return ctx.post( "/view/read", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+POST/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );
} );

describe( "Serving empty project via `express` w/ prefix a request accepting HTML", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express", prefix: "/injected/hitchy" } ) );
	after( Test.after( ctx ) );

	it( "misses GETting /injected/hitchy/", function() {
		return ctx.get( "/injected/hitchy/" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /injected/hitchy/", function() {
		return ctx.post( "/injected/hitchy/" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /injected/hitchy/view", function() {
		return ctx.get( "/injected/hitchy/view" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /injected/hitchy/view", function() {
		return ctx.post( "/injected/hitchy/view" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /injected/hitchy/view/read", function() {
		return ctx.get( "/injected/hitchy/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /injected/hitchy/view/read", function() {
		return ctx.post( "/injected/hitchy/view/read" )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
			} );
	} );
} );

describe( "Serving empty project via `express` w/ prefix a request accepting text", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express", prefix: "/injected/hitchy" } ) );
	after( Test.after( ctx ) );

	it( "misses GETting /injected/hitchy/", function() {
		return ctx.get( "/injected/hitchy/", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /injected/hitchy/", function() {
		return ctx.post( "/injected/hitchy/", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /injected/hitchy/view", function() {
		return ctx.get( "/injected/hitchy/view", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /injected/hitchy/view", function() {
		return ctx.post( "/injected/hitchy/view", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses GETting /injected/hitchy/view/read", function() {
		return ctx.get( "/injected/hitchy/view/read", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ); // .and.not.match( /<html\b/i );
			} );
	} );

	it( "misses POSTing /injected/hitchy/view/read", function() {
		return ctx.post( "/injected/hitchy/view/read", undefined, { accept: "text/plain" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				// response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ); // .and.not.match( /<html\b/i );
			} );
	} );
} );

describe( "Serving empty project via `express` w/ prefix a request accepting JSON", function() {
	this.timeout( 60000 );  // for optionally requiring to install express first

	const ctx = {};

	before( Test.before( ctx, options, { injector: "express", prefix: "/injected/hitchy" } ) );
	after( Test.after( ctx ) );

	it( "misses GETting /injected/hitchy/", function() {
		return ctx.get( "/injected/hitchy/", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+GET/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /injected/hitchy/", function() {
		return ctx.post( "/injected/hitchy/", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+POST/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses GETting /injected/hitchy/view", function() {
		return ctx.get( "/injected/hitchy/view", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+GET/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /injected/hitchy/view", function() {
		return ctx.post( "/injected/hitchy/view", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+POST/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses GETting /injected/hitchy/view/read", function() {
		return ctx.get( "/injected/hitchy/view/read", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+GET/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+GET/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );

	it( "misses POSTing /injected/hitchy/view/read", function() {
		return ctx.post( "/injected/hitchy/view/read", undefined, { accept: "application/json" } )
			.then( response => {
				response.should.have.value( "statusCode", 404 );
				// connect/express does not obey accepted format when delivering its default error on missing a route
				response.text.should.be.String().and.match( /\bCannot\s+POST/i ).and.match( /<html\b/i );
				// response.should.be.json();
				// response.should.not.have.property( "text" );
				// response.data.should.have.property( "error" );
				// response.data.error.should.be.String().and.match( /\bCannot\s+POST/i ).and.not.match( /<html\b/i );
				// response.data.should.have.property( "code" );
			} );
	} );
} );
