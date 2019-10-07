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

const Value = require( "../../../../lib/utility/value" )();

describe( "Value inspection utility", () => {
	describe( "asBoolean()", () => {
		it( "is detecting keywords representing boolean value `true`", () => {
			[
				1,
				"1",
				"y",
				"yes",
				"true",
				"set",
				"on",
				"enable",
				"enabled",
				"Y",
				"YES",
				"TRUE",
				"SET",
				"ON",
				"ENABLE",
				"ENABLED",
			].forEach( string => {
				Value.asBoolean( string ).should.be.true();
				Value.asBoolean( ` \t ${string}\n ` ).should.be.true();
				Value.asBoolean( ` \n${string}\t` ).should.be.true();
				Value.asBoolean( [string] ).should.be.true();
				Value.asBoolean( [` \n${string}\t`] ).should.be.true();
			} );
		} );

		it( "is detecting keywords representing boolean value `false`", () => {
			[
				0,
				"0",
				"n",
				"no",
				"false",
				"unset",
				"off",
				"disable",
				"disabled",
				"N",
				"NO",
				"FALSE",
				"UNSET",
				"OFF",
				"DISABLE",
				"DISABLED",
			].forEach( string => {
				Value.asBoolean( string ).should.be.false();
				Value.asBoolean( ` \t ${string}\n ` ).should.be.false();
				Value.asBoolean( ` \n${string}\t` ).should.be.false();
				Value.asBoolean( [string] ).should.be.false();
				Value.asBoolean( [` \n${string}\t`] ).should.be.false();
			} );
		} );

		it( "is passing any other input as-is", () => {
			[
				2,
				"2",
				"hey",
				"of",
				"passt",
				() => {},
				{},
				{ y: "yes" },
				[],
				["hey"],
			].forEach( string => {
				Value.asBoolean( string ).should.be.equal( string );
				Value.asBoolean( ` \t ${string}\n ` ).should.be.equal( ` \t ${string}\n ` );
				Value.asBoolean( ` \n${string}\t` ).should.be.equal( ` \n${string}\t` );
			} );
		} );
	} );
} );
