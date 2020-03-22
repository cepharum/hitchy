/**
 * (c) 2020 cepharum GmbH, Berlin, http://cepharum.de
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
 * @author: cepharum
 */

"use strict";

const normalizedTests = {
	text: "text/plain",
	multipart: "multipart/*",
	urlencoded: "application/x-www-form-urlencoded",
};

/**
 * Extracts properly sorted list of accepted types of response content from
 * current request header.
 *
 * @this HitchyRequestContext
 * @param {string|RegExp|Array<(string|RegExp)>} test describes content type to test for
 * @param {string|RegExp} additional further tests to obey
 * @returns {boolean|string|RegExp} matching test out of provided ones, false on mismatch
 * @private
 */
module.exports = function _requestIs( test, ...additional ) {
	const { headers } = this.request;

	if ( headers["transfer-encoding"] == null && !( headers["content-length"] > 0 ) ) {
		return null;
	}

	// always fail unless request comes with claimed type of request body
	const type = headers["content-type"];
	if ( type == null ) {
		return false;
	}

	// extract parts of client-provided MIME information
	const actual = /^\s*([^;/\s]+)\/([^;/\s]+)\s*/.exec( type );
	if ( !actual ) {
		throw new Error( "invalid content-type header: " + type );
	}

	// iterate over provided tests
	const [ , actualMajor, actualMinor ] = actual;
	const tests = ( Array.isArray( test ) ? test : [test] ).concat( additional );
	const numTests = tests.length;
	const patternTest = /([?.+])|([*])/g;
	const patternFixer = ( _, literal, quantifier ) => ( literal ? "\\" + literal : "." + quantifier );

	for ( let i = 0; i < numTests; i++ ) {
		const _test = tests[i];

		if ( _test instanceof RegExp ) {
			if ( _test.test( type ) ) {
				return `${actualMajor}/${actualMinor}`;
			}
		} else if ( typeof _test === "string" ) {
			const normalized = normalizedTests[_test.toLowerCase()] || ( _test[0] === "+" ? "*/*" + _test : _test );

			const wanted = /^\s*([^;/\s]+)(\/([^;/\s]+))?\s*/.exec( normalized );
			if ( wanted ) {
				const [ , wantedMajor, full, wantedMinor ] = wanted;

				const majorTest = new RegExp( `^${wantedMajor.replace( patternTest, patternFixer )}$`, "i" );
				const minorTest = full ? new RegExp( `^${wantedMinor.replace( patternTest, patternFixer )}$`, "i" ) : null;

				if ( full ) {
					if ( majorTest.test( actualMajor ) && minorTest.test( actualMinor ) ) {
						return _test;
					}
				} else if ( majorTest.test( actualMajor ) || majorTest.test( actualMinor ) ) {
					return _test;
				}
			}
		}
	}

	return false;
};
