/* eslint-disable max-nested-callbacks */
"use strict";

const options = {
	projectFolder: "test/projects/routing-basics",
	scenario: "auto-limit-response",
	// debug: true,
};

const Test = require( "../../../../../tools" ).test;

const { describe, it, before, after } = require( "mocha" );

require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

describe( "Serving project w/ controller using response API", () => {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	const MethodsWithResponse = [ "GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS" ];
	const MethodsWithoutResponse = ["HEAD"];

	const Endpoints = [
		[ "/limit/json", "json" ],
		[ "/limit/end", null ],
		[ "/limit/write", null ],
		[ "/limit/send", null ],
		[ "/limit/setHeader", "text" ],
		[ "/limit/writeHead", "text" ],
		[ "/limit/singleSet", "text" ],
		[ "/limit/multiSet", "text" ],
		[ "/limit/format", "text", { accept: "text/plain" } ],
		[ "/limit/format", "json", { accept: "text/json" } ],
		[ "/limit/format", "binary", { accept: "v-invalid/mime" } ],
	];


	Endpoints.forEach( ( [ url, type, headers = {} ] ) => {
		MethodsWithResponse.forEach( method => {
			it( `provides response on requesting ${url} with method ${method}`, () => {
				return ctx.request( method, url, null, headers )
					.then( res => {
						res.should.have.status( 200 );
						res.body.length.should.be.greaterThan( 0 );

						if ( type != null && type !== "binary" ) {
							res.headers.should.have.property( "content-type" );
						}

						if ( type === "json" ) {
							res.should.be.json();
							res.data.should.be.Object().which.has.property( "success" ).which.is.true();
						} else if ( type === "text" ) {
							res.headers["content-type"].should.be.equal( "text/plain" );
							res.text.should.be.String().which.is.equal( "success" );
						} else if ( type === "binary" ) {
							res.body.should.be.instanceOf( Buffer );
							res.body.equals( Buffer.from( "\x01success\x02" ) ).should.be.true();
						} else {
							res.body.equals( Buffer.from( "success" ) ).should.be.true();
						}
					} );
			} );
		} );

		MethodsWithoutResponse.forEach( method => {
			it( `does not provide response on requesting ${url} with method ${method}`, () => {
				return ctx.request( method, url, null, headers )
					.then( res => {
						res.should.have.status( 200 );
						res.body.length.should.not.be.greaterThan( 0 );
						res.headers.should.not.have.property( "content-type" );

						if ( type === "json" ) {
							res.should.not.be.json();
							( res.data != null ).should.be.false();
						} else if ( type === "text" ) {
							( res.text != null ).should.be.false();
						} else {
							res.body.should.be.instanceOf( Buffer );
						}
					} );
			} );
		} );
	} );

} );
