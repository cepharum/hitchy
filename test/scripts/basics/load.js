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

	test( "misses GETting", function() {
		let requests = new Array( 500 );

		for ( let i = 0, length = requests.length; i < length; i++ ) {
			requests[i] = Test.get( "/" )
				.then( function( response ) {
					response.should.have.value( "statusCode", 404 );
					response.should.be.html();
					response.text.should.be.String().and.match( /\bnot\s+found\b/i ).and.match( /<html\b/i );
				} );
		}

		return Promises.each( new Array( 500 ), function( value, index ) {
			return Promise.all( requests )
				.then( () => Promises.delay( 10 ) );
		} );
	} );
} );
