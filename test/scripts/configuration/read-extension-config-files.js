/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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
	projectFolder: "test/projects/configuration/plugin-file",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Hitchy", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "is reading configuration files provided by discovered plugin", function() {
		ctx.hitchy.api.config.should.be.Object();
		ctx.hitchy.api.config.should.have.property( "custom" ).which.is.an.Object().which.has.property( "visible" ).which.is.true();
		ctx.hitchy.api.config.should.have.property( "customConfig" ).which.is.an.Object().which.has.property( "additional" ).which.is.true();
		ctx.hitchy.api.config.should.have.property( "customConfig" ).which.is.an.Object().which.has.property( "overloaded" ).which.is.equal( "yes" );
	} );
} );
