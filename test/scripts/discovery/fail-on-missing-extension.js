"use strict";

const options = {
	projectFolder: "test/projects/empty-plugins",
	dependencies: [ "important", "supporting" ],
	logger: true,
	// debug: true,
};

const { describe, it } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project w/ empty plugins", function() {
	it( "fails on missing plugin (default injector)", function() {
		const ctx = {};

		return Test.before( ctx, options )()
			.then( () => {
				throw new Error( "starting Hitchy didn't fail" );
			}, error => {
				if ( !error.message.match( /missing\b.+\bsupporting/i ) ) {
					throw new Error( "startup failed with unexpected error: " + error );
				}
			} );
	} );
} );
