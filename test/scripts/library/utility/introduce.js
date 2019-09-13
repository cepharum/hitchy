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

const modules = {
	Introduce: "lib/utility/introduce",
};

const ApiMockUp = require( "../../../../tools" ).apiMockUp( { modules } );

// ----------------------------------------------------------------------------

const { suite, test } = require( "mocha" );

require( "should" );

// ----------------------------------------------------------------------------

suite( "Library.Utility.Introduce", function() {
	test( "is exporting function for qualifying request descriptors", function() {
		return ApiMockUp.then( function( { Introduce } ) {
			Introduce.should.be.Function();
			Introduce.should.have.length( 1 );
		} );
	} );

	test( "is qualifying request context provided as `this` in controllers and policies", function() {
		return ApiMockUp.then( function( { Introduce } ) {
			const request = {};

			const before = Date.now();
			const qualified = Introduce( request );
			const after = Date.now();

			qualified.should.be.exactly( request );

			qualified.startTime.should.be.Number().within( before, after );

			qualified.should.have.property( "config" );
			qualified.should.have.property( "models" );
			qualified.should.have.property( "policies" );
			qualified.should.have.property( "controllers" );
			qualified.should.have.property( "services" );
			qualified.should.have.property( "api" );
		} );
	} );
} );
