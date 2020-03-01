"use strict";

const options = {
	projectFolder: "test/projects/core-only",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Promises = require( "../../../tools" ).promise;

// ----------------------------------------------------------------------------

describe( "Simulating load by sending 5k requests split into chunks of 500 each in short-term succession", function() {
	this.timeout( 60000 );

	const Chunks = 10;
	const RequestsPerChunk = 500;
	const DelayPerChunk = 10;

	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "misses GETting /missing", function() {
		if ( process.env.SKIP_LOAD_TESTS ) {
			this.skip();
			return undefined;
		}

		let count = 0;

		const check = response => {
			response.should.have.value( "statusCode", 404 );
			response.should.be.html();
			response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
			count++;
		};

		return Promises.each( new Array( Chunks ), ( _, chunkIndex ) => {
			return Promises.delay( DelayPerChunk * chunkIndex )
				.then( () => {
					const requests = new Array( RequestsPerChunk );

					for ( let i = 0, length = requests.length; i < length; i++ ) {
						requests[i] = ctx.get( "/missing" ).then( check );
					}

					return Promise.all( requests );
				} );
		} )
			.then( () => {
				count.should.be.equal( Chunks * RequestsPerChunk );
			} );
	} );

	it( "GETs /view/read/<id> w/ random <id>", function() {
		if ( process.env.SKIP_LOAD_TESTS ) {
			this.skip();
			return undefined;
		}

		let count = 0;

		return Promises.each( new Array( Chunks ), ( _, chunkIndex ) => {
			return Promises.delay( DelayPerChunk * chunkIndex )
				.then( () => {
					const requests = new Array( RequestsPerChunk );

					for ( let i = 0, length = requests.length; i < length; i++ ) {
						const value = String( Math.ceil( 1000 * Math.random() ) );
						requests[i] = ctx.get( "/view/read/" + value ).then( response => {
							response.should.have.value( "statusCode", 200 );
							response.should.be.json();
							response.data.id.should.be.String().and.equal( value );
							count++;
						} );
					}

					return Promise.all( requests );
				} );
		} )
			.then( () => {
				count.should.be.equal( Chunks * RequestsPerChunk );
			} );
	} );
} );
