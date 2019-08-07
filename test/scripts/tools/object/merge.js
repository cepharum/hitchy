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

const { describe, it } = require( "mocha" );

require( "should" );

const { deepMerge: merge } = require( "../../../../tools/object" );

describe( "Utility method for deeply merging objects", () => {
	describe( "can be used w/o any source and", () => {
		it( "returns object", () => {
			merge( {} ).should.be.Object().which.has.size( 0 );
		} );

		it( "doesn't require provision of target", () => {
			merge( null ).should.be.Object().which.has.size( 0 );
			merge( undefined ).should.be.Object().which.has.size( 0 );
		} );

		it( "returns provided target as-is", () => {
			const t = {};

			merge( t ).should.be.equal( t ).which.has.size( 0 );
		} );
	} );

	describe( "can be used w/ non-object sources thus", () => {
		it( "ignoring null sources", () => {
			const t = {};

			merge( {}, null ).should.be.Object().which.has.size( 0 );
			merge( {}, null, null, null ).should.be.Object().which.has.size( 0 );

			merge( null, null, null, null ).should.be.Object().which.has.size( 0 );
			merge( undefined, null, null, null ).should.be.Object().which.has.size( 0 );

			merge( t, null, null, null ).should.be.equal( t ).which.has.size( 0 );
		} );

		it( "ignoring undefined sources", () => {
			const t = {};

			merge( {}, undefined ).should.be.Object().which.has.size( 0 );
			merge( {}, undefined, undefined, undefined ).should.be.Object().which.has.size( 0 );

			merge( null, undefined, undefined, undefined ).should.be.Object().which.has.size( 0 );
			merge( undefined, undefined, undefined, undefined ).should.be.Object().which.has.size( 0 );

			merge( t, undefined, undefined, undefined ).should.be.equal( t ).which.has.size( 0 );
		} );

		it( "ignoring string sources", () => {
			[ "", "text", "some slightly longer text with spaces etc." ]
				.forEach( string => {
					const t = {};

					merge( {}, string ).should.be.Object().which.has.size( 0 );
					merge( {}, string, string, string ).should.be.Object().which.has.size( 0 );

					merge( null, string, string, string ).should.be.Object().which.has.size( 0 );
					merge( undefined, string, string, string ).should.be.Object().which.has.size( 0 );

					merge( t, string, string, string ).should.be.equal( t ).which.has.size( 0 );
				} );
		} );

		it( "ignoring numeric sources", () => {
			[ -Infinity, NaN, -100.5, -3, 0, 0.0, 2.5, 384.556, Infinity, 3e+10 ]
				.forEach( numeric => {
					const t = {};

					merge( {}, numeric ).should.be.Object().which.has.size( 0 );
					merge( {}, numeric, numeric, numeric ).should.be.Object().which.has.size( 0 );

					merge( null, numeric, numeric, numeric ).should.be.Object().which.has.size( 0 );
					merge( undefined, numeric, numeric, numeric ).should.be.Object().which.has.size( 0 );

					merge( t, numeric, numeric, numeric ).should.be.equal( t ).which.has.size( 0 );
				} );
		} );

		it( "ignoring boolean sources", () => {
			[ false, true ]
				.forEach( boolean => {
					const t = {};

					merge( {}, boolean ).should.be.Object().which.has.size( 0 );
					merge( {}, boolean, boolean, boolean ).should.be.Object().which.has.size( 0 );

					merge( null, boolean, boolean, boolean ).should.be.Object().which.has.size( 0 );
					merge( undefined, boolean, boolean, boolean ).should.be.Object().which.has.size( 0 );

					merge( t, boolean, boolean, boolean ).should.be.equal( t ).which.has.size( 0 );
				} );
		} );

		it( "ignoring functions as sources", () => {
			[ () => true, a => a * a, function() { return false; }, function( b ) { return b * b; } ]
				.forEach( fn => {
					const t = {};

					merge( {}, fn ).should.be.Object().which.has.size( 0 );
					merge( {}, fn, fn, fn ).should.be.Object().which.has.size( 0 );

					merge( null, fn, fn, fn ).should.be.Object().which.has.size( 0 );
					merge( undefined, fn, fn, fn ).should.be.Object().which.has.size( 0 );

					merge( t, fn, fn, fn ).should.be.equal( t ).which.has.size( 0 );
				} );
		} );
	} );

	describe( "can be used w/ array sources thus", () => {
		[
			[],
			["sole"],
			[ "first", "second", "third", "fourth", "fifth" ],
		]
			.forEach( array => {
				it( `transferring items of array [${array}] into numeric properties of resulting object`, () => {
					let merged = merge( {}, array );
					merged.should.be.Object().which.has.size( array.length );

					for ( let i = 0; i < array.length; i++ ) {
						merged.should.have.property( i ).which.is.equal( array[i] );
					}

					merged = merge( null, array );
					merged.should.be.Object().which.has.size( array.length );

					for ( let i = 0; i < array.length; i++ ) {
						merged.should.have.property( i ).which.is.equal( array[i] );
					}

					merged = merge( undefined, array );
					merged.should.be.Object().which.has.size( array.length );

					for ( let i = 0; i < array.length; i++ ) {
						merged.should.have.property( i ).which.is.equal( array[i] );
					}
				} );
		} );
	} );

	// TODO improve basic test coverage


	describe( "supports concatenation of scalar values", () => {
		it( "in same top-level properties of different sources", () => {
			merge( {}, { propName: "first" }, { propName: "second" }, ( path, strategy ) => {
				return path === "propName" ? "concat" : strategy;
			} )
				.should.have.property( "propName" ).which.is.an.Array().and.deepEqual( [ "first", "second" ] );
		} );

		it( "in same second-level properties of different sources", () => {
			merge( {}, { propName: { sub: "first" } }, { propName: { sub: "second" } }, ( path, strategy ) => {
				return path === "propName|sub" ? "concat" : strategy;
			} )
				.should.have.property( "propName" ).which.has.property( "sub" ).which.is.an.Array().and.deepEqual( [ "first", "second" ] );
		} );
	} );
} );
