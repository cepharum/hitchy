"use strict";

const options = {
	projectFolder: "test/projects/empty",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project from empty folder", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "provides core service component HttpClient", () => {
		ctx.hitchy.api.runtime.services.should.have.property( "HttpClient" );
		ctx.hitchy.api.runtime.services.HttpClient.should.have.property( "fetch" ).which.is.a.Function();

		return ctx.hitchy.api.runtime.services.HttpClient.fetch( "GET", "https://duckduckgo.com/" )
			.should.be.Promise().which.is.resolved()
			.then( response => {
				response.should.have.property( "statusCode" ).which.is.a.Number().and.is.equal( 200 );
				response.should.have.property( "body" ).which.is.a.Function();
				response.should.have.property( "json" ).which.is.a.Function();

				return response.body()
					.should.be.a.Promise().which.is.resolved()
					.then( body => {
						body.should.be.instanceOf( Buffer );
						body.toString( "utf8" ).should.be.String().which.match( /<html\W/i );
					} );
			} );
	} );

	it( "provides core service component HttpException", () => {
		ctx.hitchy.api.runtime.services.should.have.property( "HttpException" );

		const exception = new ctx.hitchy.api.runtime.services.HttpException( 404, "requested content not found" );

		exception.should.have.property( "statusCode" ).which.is.a.Number().and.is.equal( 404 );
	} );
} );
