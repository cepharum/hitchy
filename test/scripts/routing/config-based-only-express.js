"use strict";

let options = {
	projectFolder: "test/projects/core-only",
	// debug: true,
};

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )["express"]( options );

// ----------------------------------------------------------------------------

suite( "Serving core-only project via expressjs w/ simple controllers and policies", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "GETs /", function() {
		return Hitchy.onStarted.then( () => Test.get( "/" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bwelcome\b/i ).and.match( /<p>/i );
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

	test( "GETs /view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "instant session!" );
				require( "should" )( response.data.id ).be.undefined();
			} ) );
	} );

	test( "POSTs /view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "instant session!" );
				require( "should" )( response.data.id ).be.undefined();
			} ) );
	} );

	test( "GETs /view/read/1234", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/read/1234" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				require( "should" )( response.data.session ).be.undefined();
				response.data.id.should.be.String().and.equal( "1234" );
			} ) );
	} );

	test( "POSTs /view/read/1234", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/read/1234" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				response.data.id.should.be.String().and.equal( "1234" );
			} ) );
	} );

	test( "GETs /view/create", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/create" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				require( "should" )( response.data.name ).be.undefined();
			} ) );
	} );

	test( "GETs /view/create/someId", function() {
		return Hitchy.onStarted.then( () => Test.get( "/view/create/someId" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				response.data.name.should.be.String().and.equal( "someId" );
			} ) );
	} );

	test( "POSTs /view/create/someSimpleName?extra=1", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/create/someSimpleName?extra=1" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				response.data.name.should.be.Array().and.eql( [ "someSimpleName" ] );
				response.data.extra.should.be.String().and.equal( "1" );
			} ) );
	} );

	test( "POSTs /view/create/some/complex/name?extra[]=foo&extra[]=bar", function() {
		return Hitchy.onStarted.then( () => Test.post( "/view/create/some/complex/name?extra[]=foo&extra[]=bar" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				response.data.name.should.be.Array().and.eql( [ "some", "complex", "name" ] );
				response.data.extra.should.be.Array().and.eql( [ "foo", "bar" ] );
			} ) );
	} );
} );

suite( "Serving core-only project via expressjs w/ prefix w/ simple controllers and policies", function() {
	suiteSetup( () => Test.startServer( Hitchy, { prefix: "/injected/hitchy" } ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "GETs /injected/hitchy/", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/" )
			.then( function( response ) {
				response.should.have.status( 200 );
				response.should.be.html();
				response.text.should.be.String().and.match( /\bwelcome\b/i ).and.match( /<p>/i );
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

	test( "GETs /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "instant session!" );
				require( "should" )( response.data.id ).be.undefined();
			} ) );
	} );

	test( "POSTs /injected/hitchy/view/read", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/read" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "instant session!" );
				require( "should" )( response.data.id ).be.undefined();
			} ) );
	} );

	test( "GETs /injected/hitchy/view/read/1234", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/read/1234" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				require( "should" )( response.data.session ).be.undefined();
				response.data.id.should.be.String().and.equal( "1234" );
			} ) );
	} );

	test( "POSTs /injected/hitchy/view/read/1234", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/read/1234" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				response.data.id.should.be.String().and.equal( "1234" );
			} ) );
	} );

	test( "GETs /injected/hitchy/view/create", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/create" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				require( "should" )( response.data.name ).be.undefined();
			} ) );
	} );

	test( "GETs /injected/hitchy/view/create/someId", function() {
		return Hitchy.onStarted.then( () => Test.get( "/injected/hitchy/view/create/someId" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				response.data.name.should.be.String().and.equal( "someId" );
			} ) );
	} );

	test( "POSTs /injected/hitchy/view/create/someSimpleName?extra=1", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/create/someSimpleName?extra=1" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				response.data.name.should.be.Array().and.eql( [ "someSimpleName" ] );
				response.data.extra.should.be.String().and.equal( "1" );
			} ) );
	} );

	test( "POSTs /injected/hitchy/view/create/some/complex/name?extra[]=foo&extra[]=bar", function() {
		return Hitchy.onStarted.then( () => Test.post( "/injected/hitchy/view/create/some/complex/name?extra[]=foo&extra[]=bar" )
			.then( function( response ) {
				response.should.have.value( "statusCode", 200 );
				response.should.be.json();
				response.data.session.should.be.String().and.equal( "promised session!" );
				require( "should" )( response.data.id ).be.undefined();
				response.data.name.should.be.Array().and.eql( [ "some", "complex", "name" ] );
				response.data.extra.should.be.Array().and.eql( [ "foo", "bar" ] );
			} ) );
	} );
} );
