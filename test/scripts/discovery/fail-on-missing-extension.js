"use strict";

const options = {
	projectFolder: "test/projects/empty-plugins",
	dependencies: [ "important", "supporting" ],
	// debug: true,
};

const { suite, test } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"];

// ----------------------------------------------------------------------------

suite( "Serving project w/ empty plugins", function() {
	test( "fails on missing plugin", function() {
		const hitchy = Hitchy( options );

		return Test.startServer( hitchy )
			.then( () => {
				throw new Error( "starting Hitchy didn't fail" );
			}, error => {
				if ( !error.message.match( /missing\b.+\bsupporting/i ) ) {
					throw new Error( "startup failed with unexpected error: " + error );
				}
			} )
			.then( () => hitchy.stop() );
	} );
} );
