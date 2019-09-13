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
require( "should" );

const Case = require( "../../../../lib/utility/case" )();

describe( "Case-conversion utility", () => {
	describe( "kebabToCamel()", () => {
		it( "is converting from kebab-case to camelCase", () => {
			Case.kebabToCamel( "some" ).should.be.equal( "some" );
			Case.kebabToCamel( "some-test-text" ).should.be.equal( "someTestText" );
			Case.kebabToCamel( "some-TEST-text" ).should.be.equal( "someTestText" );
			Case.kebabToCamel( "some-tESt-text" ).should.be.equal( "someTestText" );
		} );
	} );

	describe( "kebabToPascal()", () => {
		it( "is converting from kebab-case to camelCase", () => {
			Case.kebabToPascal( "some" ).should.be.equal( "Some" );
			Case.kebabToPascal( "some-test-text" ).should.be.equal( "SomeTestText" );
			Case.kebabToPascal( "some-TEST-text" ).should.be.equal( "SomeTestText" );
			Case.kebabToPascal( "some-tESt-text" ).should.be.equal( "SomeTestText" );
		} );
	} );

	describe( "camelToKebab()", () => {
		it( "is converting from camelCase to kebab-case", () => {
			Case.camelToKebab( "some" ).should.be.equal( "some" );
			Case.camelToKebab( "someTestText" ).should.be.equal( "some-test-text" );
		} );
	} );

	describe( "pascalToKebab()", () => {
		it( "is converting from PascalCase to kebab-case", () => {
			Case.pascalToKebab( "Some" ).should.be.equal( "some" );
			Case.pascalToKebab( "SomeTestText" ).should.be.equal( "some-test-text" );
		} );
	} );

	describe( "camelToPascal()", () => {
		it( "is converting from camelCase to PascalCase", () => {
			Case.camelToPascal( "some" ).should.be.equal( "Some" );
			Case.camelToPascal( "someTestText" ).should.be.equal( "SomeTestText" );
		} );
	} );
} );
