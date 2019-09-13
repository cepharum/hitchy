"use strict";

const options = {
	projectFolder: "test/projects/core-only",
	// debug: true,
};

const { suite, test, suiteTeardown, suiteSetup } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Promises = require( "../../../tools" ).promise;
const Hitchy = require( "../../../injector" ).node;

// ----------------------------------------------------------------------------

suite( "Serving core-only project load simulation (250k requests split into 500 chunks)", function() {
	this.timeout( 60000 );

	const Chunks = 500;
	const RequestsPerChunk = 500;
	const DelayPerChunk = 10;

	const hitchy = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "misses GETting /missing", function() {
		if ( process.env.SKIP_LOAD_TESTS ) {
			this.skip();
		}

		const requests = new Array( RequestsPerChunk );

		for ( let i = 0, length = requests.length; i < length; i++ ) {
			requests[i] = Test.get( "/missing" )
				.then( function( response ) {
					response.should.have.value( "statusCode", 404 );
					response.should.be.html();
					response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
				} );
		}

		return hitchy.onStarted.then( () => Promises.each( new Array( Chunks ), () => {
			return Promise.all( requests )
				.then( () => Promises.delay( DelayPerChunk ) );
		} ) );
	} );

	test( "GETs /view/read/<id> w/ random <id>", function() {
		if ( process.env.SKIP_LOAD_TESTS ) {
			this.skip();
		}

		const requests = new Array( RequestsPerChunk );

		for ( let i = 0, length = requests.length; i < length; i++ ) {
			const value = String( Math.ceil( 1000 * Math.random() ) );
			requests[i] = Test.get( "/view/read/" + value )
				.then( function( response ) {
					response.should.have.value( "statusCode", 200 );
					response.should.be.json();
					response.data.id.should.be.String().and.equal( value );
				} );
		}

		return hitchy.onStarted.then( () => Promises.each( new Array( Chunks ), () => {
			return Promise.all( requests )
				.then( () => Promises.delay( DelayPerChunk ) );
		} ) );
	} );
} );
