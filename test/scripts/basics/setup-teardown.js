/**
 * (c) 2017 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author cepharum
 */

"use strict";

const options = {
	projectFolder: "test/projects/setup-teardown",
	// debug: true,
};

const { describe, it, before, after } = require( "mocha" );
const Should = require( "should" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"];

// ----------------------------------------------------------------------------

describe( "A Hitchy application", function() {
	const hitchy = Hitchy( options );
	let server = null;

	before( () => Test.startServer( hitchy ).then( s => ( server = s ) ) );

	after( () => server && server.stop() );

	it( "may provide initialize.js in project root to be invoked at end of bootstrap", () => {
		return hitchy.onStarted
			.then( () => {
				global.startedHitchyProjectNamedSetupTeardown.should.be.true();
				global.startedHitchyProjectNamedSetupTeardownWith.should.be.Object().which.has.size( 2 ).and.has.properties( "options", "api" );
				global.startedHitchyProjectNamedSetupTeardownWith.options.projectFolder.replace( /\\/g, "/" ).should.endWith( "test/projects/setup-teardown" );

				Should( global.stoppedHitchyProjectNamedSetupTeardown ).not.be.ok();
				Should( global.stoppedHitchyProjectNamedSetupTeardownWith ).not.be.ok();
			} );
	} );

	it( "may provide shutdown.js in project root to be invoked right before shutting down all plugins", () => {
		return server.stop()
			.then( () => {
				server = null;

				global.stoppedHitchyProjectNamedSetupTeardown.should.be.true();
				global.stoppedHitchyProjectNamedSetupTeardownWith.should.be.Object().which.has.size( 2 ).and.has.properties( "options", "api" );
				global.stoppedHitchyProjectNamedSetupTeardownWith.options.projectFolder.replace( /\\/g, "/" ).should.endWith( "test/projects/setup-teardown" );
			} );
	} );
} );
