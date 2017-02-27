"use strict";

let options = {
	projectFolder: "test/projects/empty-extensions",
	dependencies: [ "important", "supporting" ],
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"]( options );

// ----------------------------------------------------------------------------

suite( "Serving project w/ empty components", function() {
	test( "fails on missing component", function() {
		return Test.startServer( Hitchy )
			.should.be.rejectedWith( /missing\b.+\bsupporting/i )
			.then( function() {
				return Hitchy.stop().catch( () => {} );
			} );
	} );
} );
