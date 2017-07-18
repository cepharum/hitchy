"use strict";

let options = {
	projectFolder: "test/projects/empty",
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )["express"]( options );

// ----------------------------------------------------------------------------

suite( "Injecting hitchy into expressjs", function() {
	test( "can be started", function() {
		this.timeout( 60000 );  // for optionally requiring to install express first
		return Test.startServer( Hitchy );
	} );

	test( "can be stopped", function() {
		this.timeout( 30000 );  // for optionally requiring to install express first
		return Hitchy.stop();
	} );
} );

suite( "Serving empty project via expressjs a request accepting HTML", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /", function() {
		return Hitchy.onStarted.then( () => Test.post( "/" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /view", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /view", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );
} );

suite( "Serving empty project via expressjs a request accepting text", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /", function() {
		return Hitchy.onStarted.then( () => Test.post( "/", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /view", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /view", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/read", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/read", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );
} );

suite( "Serving empty project via expressjs a request accepting JSON", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses POSTing /", function() {
		return Hitchy.onStarted.then( () => Test.post( "/", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses GETting /view", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses POSTing /view", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses GETting /view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/read", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses POSTing /view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/read", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );
} );

suite( "Serving empty project via expressjs w/ prefix a request accepting HTML", function() {
	suiteSetup( () => Test.startServer( Hitchy, { prefix: "/injected/hitchy" } ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /injected/hitchy/view", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/view", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			} ) );
	} );
} );

suite( "Serving empty project via expressjs w/ prefix a request accepting text", function() {
	suiteSetup( () => Test.startServer( Hitchy, { prefix: "/injected/hitchy" } ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /injected/hitchy/view", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/view", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses GETting /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/read", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/read", undefined, { accept: "text/plain" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.have.contentType( "text/plain" );
				response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
			} ) );
	} );
} );

suite( "Serving empty project via expressjs w/ prefix a request accepting JSON", function() {
	suiteSetup( () => Test.startServer( Hitchy, { prefix: "/injected/hitchy" } ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "misses GETting /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses GETting /injected/hitchy/view", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/view", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses GETting /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/read", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );

	test( "misses POSTing /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/read", undefined, { accept: "application/json" } )
			.then( function( response ) {
				response.should.have.value( "statusCode", 404 );
				response.should.be.json();
				response.should.not.have.property( "text" );
				response.data.should.have.property( "error" );
				response.data.error.should.be.String().and.match( /\bnot\s+found\b/i ).and.not.match( /<html\b/i );
				response.data.should.have.property( "code" );
			} ) );
	} );
} );
