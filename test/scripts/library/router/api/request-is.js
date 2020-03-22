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

const { describe, it } = require( "mocha" );
const Should = require( "should" );

const RequestIs = require( "../../../../../lib/router/normalize/is" );

const TestCases = [
	// actual , test , test result
	[ undefined, "text/html", false ],
	[ undefined, "text/html", false ],
	[ "text/html", "text/html", "text/html" ],
	[ "text/html", "text/*", "text/*" ],
	[ "text/html", "*/html", "*/html" ],
	[ "text/html", "html", "html" ],
	[ "text/html", "text", false ],
	[ "text/plain", "text", "text" ],
	[ "application/json", "text", false ],
	[ "application/json", "json", "json" ],
	[ "text/json", "json", "json" ],
	[ "text/json", "text", false ],
	[ "application/xml", "xml", "xml" ],
	[ "application/xml", "*/xml", "*/xml" ],
	[ "text/xml", "xml", "xml" ],
	[ "text/xml", "text", false ],
	[ "text/xml", [ "text", "xml", "json" ], "xml" ],
	[ "text/plain", [ "text", "xml", "json" ], "text" ],
	[ "text/json", [ "text", "xml", "json" ], "json" ],
	[ "text/json", [ "text", "xml", "*t/json", "json" ], "*t/json" ],
	[ "application/ld+json", [ "json", "+json" ], "+json" ],
	[ "application/vnd.api+json", [ "json", "+json" ], "+json" ],
	[ "application/vnd.api+json", "vnd.api+json", "vnd.api+json" ],
	[ "application/vnd-api+json", "vnd.api+json", false ],
	[ "application/x-resource+json", "x-*", "x-*" ],
];


describe( "Normalized request.is()", () => {
	it( "is a function", () => {
		RequestIs.should.be.Function();
	} );

	it( "returns `null` if there is no body according to some usual suspect request headers", () => {
		TestCases.forEach( ( [ mime, test ] ) => {
			const context = {
				request: {
					headers: {
					},
				},
			};

			if ( mime ) {
				context.request.headers["content-type"] = mime;
			}

			Should( RequestIs.call( context, test ) ).be.null();
		} );
	} );

	it( "properly tests existing information on provided content type", () => {
		TestCases.forEach( ( [ mime, test, expected ] ) => {
			const context = {
				request: {
					headers: {
						"content-length": 1,
					},
				},
			};

			if ( mime ) {
				context.request.headers["content-type"] = mime;
			}

			const actual = RequestIs.call( context, test );

			Should( actual ).equal( expected, `expected ${expected} on testing ${mime} with ${typeof test} ${test.toString()}, but got ${actual}` );
		} );
	} );
} );
