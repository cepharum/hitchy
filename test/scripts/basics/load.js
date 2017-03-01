"use strict";

let options = {
	projectFolder: "test/projects/core-only",
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Promises = require( "../../../tools" ).promise;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"]( options );

// ----------------------------------------------------------------------------

suite( "Serving core-only project load simulation (250k requests split into 500 chunks)", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	this.timeout( 60000 );

	const Chunks = 500;
	const RequestsPerChunk = 500;
	const DelayPerChunk = 10;


	test( "misses GETting", function() {
		if ( process.env.SKIP_LOAD_TESTS ) {
			this.skip();
		}

		let requests = new Array( RequestsPerChunk );

		for ( let i = 0, length = requests.length; i < length; i++ ) {
			requests[i] = Test.get( "/" )
				.then( function( response ) {
					response.should.have.value( "statusCode", 200 );
					response.should.be.html();
					response.text.should.be.String().and.match( /\bwelcome\b/i ).and.match( /<h1\b/i );
				} );
		}

		return Promises.each( new Array( Chunks ), function( value, index ) {
			return Promise.all( requests )
				.then( () => Promises.delay( DelayPerChunk ) );
		} );
	} );

	test( "GETs /view/read/<id> w/ random <id>", function() {
		if ( process.env.SKIP_LOAD_TESTS ) {
			this.skip();
		}

		let requests = new Array( RequestsPerChunk );

		for ( let i = 0, length = requests.length; i < length; i++ ) {
			let value = String( 1000 * Math.random() );
			requests[i] = Test.get( "/view/read/" + value )
				.then( function( response ) {
					response.should.have.value( "statusCode", 200 );
					response.should.be.json();
					response.data.id.should.be.String().and.equal( value );
				} );
		}

		return Promises.each( new Array( Chunks ), function( value, index ) {
			return Promise.all( requests )
				.then( () => Promises.delay( DelayPerChunk ) );
		} );
	} );
} );
