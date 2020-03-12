"use strict";

const options = {
	projectFolder: "test/projects/routing-query",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "A query parameter in request URL", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	[ "get", "post", "put" ]
		.forEach( method => {
			it( `is exposed in policies (${method.toUpperCase()})`, function() {
				return ctx[method]( "/query?foo=bar" )
					.then( response => {
						response.headers["x-query-foo"].should.be.equal( "bar" );
					} );
			} );

			it( `is exposed in controllers (${method.toUpperCase()})`, function() {
				return ctx[method]( "/query?foo=bar" )
					.then( response => {
						response.data.foo.should.be.equal( "bar" );
					} );
			} );

			it( `supports percent encoding (${method.toUpperCase()})`, function() {
				return ctx[method]( "/query?f%6f%6F=bar%26baz" )
					.then( response => {
						response.headers["x-query-foo"].should.be.equal( "bar&baz" );
						response.data.foo.should.be.equal( "bar&baz" );
					} );
			} );
		} );
} );
