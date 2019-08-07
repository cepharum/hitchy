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
	Parser: "lib/utility/parser",
};

const ApiMockUp = require( "../../../../tools" ).apiMockUp( { modules } );

// ----------------------------------------------------------------------------

const Should = require( "should" );

// ----------------------------------------------------------------------------

suite( "Library.Utility.Parser", function() {
	test( "is processing empty URL query", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "" );

			result.should.be.Object();
			result.should.have.size( 0 );
		} );
	} );

	test( "is processing single name w/o value", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.true();
		} );
	} );

	test( "is processing multiple different names each w/o value", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar&anothervar" );

			result.should.be.Object();
			result.should.have.size( 2 );
			result.should.have.ownProperty( "myvar" );
			result.should.have.ownProperty( "anothervar" );
			result.myvar.should.be.true();
			result.anothervar.should.be.true();
		} );
	} );

	test( "is processing multiple occurrences of same names w/o value", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar&anothervar&myvar" );

			result.should.be.Object();
			result.should.have.size( 2 );
			result.should.have.ownProperty( "myvar" );
			result.should.have.ownProperty( "anothervar" );
			result.myvar.should.be.true();
			result.anothervar.should.be.true();
		} );
	} );

	test( "supports single name w/ non-empty string value", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar=test" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.String().and.equal( "test" );
		} );
	} );

	test( "supports multiple occurrence of same name w/ non-empty string value", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar=foo&myvar=bar" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.String().and.equal( "bar" );
		} );
	} );

	test( "is obeying latest of multiple occurrences per name even though switching between value and no-value", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar=test&anothervar&myvar" );

			result.should.be.Object();
			result.should.have.size( 2 );
			result.should.have.ownProperty( "myvar" );
			result.should.have.ownProperty( "anothervar" );
			result.myvar.should.be.true();
			result.anothervar.should.be.true();

			result = Parser.query( "myvar&anothervar&myvar=test" );

			result.should.be.Object();
			result.should.have.size( 2 );
			result.should.have.ownProperty( "myvar" );
			result.should.have.ownProperty( "anothervar" );
			result.myvar.should.be.String().and.equal( "test" );
			result.anothervar.should.be.true();
		} );
	} );

	test( "supports assigning null explicitly", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar=test&anothervar&myvar=" );

			result.should.be.Object();
			result.should.have.size( 2 );
			result.should.have.ownProperty( "myvar" );
			result.should.have.ownProperty( "anothervar" );
			Should( result.myvar ).be.null();
			result.anothervar.should.be.true();
		} );
	} );

	test( "supports constructing array from names using empty brackets", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[]=test&anothervar&myvar[]=&myvar[]" );

			result.should.be.Object();
			result.should.have.size( 2 );
			result.should.have.ownProperty( "myvar" );
			result.should.have.ownProperty( "anothervar" );
			result.myvar.should.be.Array().and.have.length( 3 );
			result.myvar.should.be.eql( ["test", null, true] );
			result.anothervar.should.be.true();
		} );
	} );

	test( "supports constructing object on using non-empty element names in brackets", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[foo]=oof&myvar[bar]=&myvar[baz]" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Object().and.have.size( 3 );
			result.myvar.should.have.value( "foo", "oof" );
			result.myvar.should.have.value( "bar", null );
			result.myvar.should.have.value( "baz", true );
		} );
	} );

	test( "feeds array like object when oddly mixing empty brackets with non-empty ones", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[]=foo&myvar[bar]=&myvar[baz]" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Array().and.have.length( 1 );
			result.myvar.should.be.Array().and.have.size( 3 );
			result.myvar.should.have.value( 0, "foo" );
			result.myvar.should.have.value( "bar", null );
			result.myvar.should.have.value( "baz", true );
		} );
	} );

	test( "chooses numeric property names when oddly mixing non-empty brackets with empty ones", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[baz]=foo&myvar[bar]=&myvar[]" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Object().and.have.size( 3 );
			result.myvar.should.have.value( "baz", "foo" );
			result.myvar.should.have.value( "bar", null );
			result.myvar.should.have.value( 2, true );
		} );
	} );

	test( "obeys last of multiple occurrences addressing same element", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[baz]=foo&myvar[bar]=&myvar[]&myvar[bar]=3" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Object().and.have.size( 3 );
			result.myvar.should.have.value( "baz", "foo" );
			result.myvar.should.have.value( "bar", "3" );
			result.myvar.should.have.value( 2, true );
		} );
	} );

	test( "supports URL-encoded names", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar%5Bbaz%5D=foo&m%79%76ar[bar]=&myvar[]&myvar[%66%3D%6F%6F]=3" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Object().and.have.size( 4 );
			result.myvar.should.have.value( "baz", "foo" );
			result.myvar.should.have.value( "bar", null );
			result.myvar.should.have.value( 2, true );
			result.myvar.should.have.value( "f=oo", "3" );
		} );
	} );

	test( "supports URL-encoded values", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[baz]=%66%3D%26%6F%6F&myvar[bar]=&myvar[]&myvar[foo]=%33" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Object().and.have.size( 4 );
			result.myvar.should.have.value( "baz", "f=&oo" );
			result.myvar.should.have.value( "bar", null );
			result.myvar.should.have.value( 2, true );
			result.myvar.should.have.value( "foo", "3" );
		} );
	} );

	test( "supports URL- and UTF8-encoded names and values", function() {
		return ApiMockUp.then( function( { Parser } ) {
			let result = Parser.query( "myvar[%F0%9F%91%BA]=%c3%a4%c3%a9%e2%90%a0%e5%bc%88" );

			result.should.be.Object();
			result.should.have.size( 1 );
			result.should.have.ownProperty( "myvar" );
			result.myvar.should.be.Object().and.have.size( 1 );
			result.myvar.should.have.value( "👺", "äé␠弈" );
		} );
	} );
} );
