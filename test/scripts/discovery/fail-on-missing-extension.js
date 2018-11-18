"use strict";

let options = {
	projectFolder: "test/projects/empty-extensions",
	dependencies: ["important", "supporting"],
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"];

require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

suite( "Serving project w/ empty components", function() {
	test( "fails on missing component", function() {
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
