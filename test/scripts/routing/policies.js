"use strict";

const options = {
	projectFolder: "test/projects/policies",
	// debug: true,
};

const { describe, it, before, after } = require( "mocha" );
require( "should" );
require( "should-http" );

const Test = require( "../../../tools/index" ).test;
const Hitchy = require( "../../../injector" ).express;

// ----------------------------------------------------------------------------

describe( "Policy routing", function() {
	const hitchy = Hitchy( options );
	let server = null;

	before( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );
	after( () => server && server.stop() );

	for ( const method of [ "GET", "PUT", "POST", "PATCH", "DELETE", "HEAD", "OPTIONS", "TRACE" ] ) {
		for ( const path of [ "/prefix/deep/path", "/prefix/deep/", "/prefix/deep", "/prefix/", "/prefix" ] ) {
			it( `is involved when ${method} ${path}`, function() {
				return hitchy.onStarted.then( () => Test[method.toLowerCase()]( path )
					.then( response => {
						response.should.have.status( 200 );
						response.headers["x-policy"].should.be.String().and.equal( "responded" );
					} ) );
			} );
		}
	}
} );
