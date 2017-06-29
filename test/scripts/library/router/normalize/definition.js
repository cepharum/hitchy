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
 * @author: cepharum
 */

"use strict";

const Normalizer = require( "../../../../../lib/router/normalize/definition" );

const Should = require( "should" );


suite( "Route definition normalizer", function() {
	test( "exposes function for normalizing route definitions of extensions/modules", function() {
		Should.exist( Normalizer.Module );
		Normalizer.Module.should.be.Function();
	} );

	test( "exposes function for normalizing custom route definitions of any current application", function() {
		Should.exist( Normalizer.Custom );
		Normalizer.Custom.should.be.Function();
	} );
} );

suite( "Normalizer for module-related route definitions", function() {
	test( "does not throw on processing empty module route definition", function() {
		Normalizer.Module.should.not.throw();
		Normalizer.Module.bind( Normalizer, null ).should.not.throw();
		Normalizer.Module.bind( Normalizer, undefined ).should.not.throw();
	} );

	test( "throws on processing invalid module route definition", function() {
		Normalizer.Module.bind( Normalizer, false ).should.throw();
		Normalizer.Module.bind( Normalizer, true ).should.throw();
		Normalizer.Module.bind( Normalizer, 0 ).should.throw();
		Normalizer.Module.bind( Normalizer, 1 ).should.throw();
		Normalizer.Module.bind( Normalizer, -2 ).should.throw();
		Normalizer.Module.bind( Normalizer, "" ).should.throw();
		Normalizer.Module.bind( Normalizer, "0" ).should.throw();
		Normalizer.Module.bind( Normalizer, function() {} ).should.throw();
		Normalizer.Module.bind( Normalizer, () => {} ).should.throw();
	} );

	test( "does not throw on processing valid definition without any element", function() {
		Normalizer.Module.bind( Normalizer, {} ).should.not.throw();
		Normalizer.Module.bind( Normalizer, [] ).should.not.throw();
	} );

	test( "provides object always covering either supported stage", function() {
		let a = Normalizer.Module( Normalizer, {} );

		Should.exist( a );
		a.should.be.Object();
		a.should.have.properties( "before", "after" );
		Object.keys( a ).should.have.length( 2 );
	} );

	test( "does not care for actually provided definitions", function() {
		Normalizer.Module.bind( Normalizer, {
			null: null,
			false: false,
			true: true,
			undefined: undefined,
			emptyString: "",
			string: "some value",
			emptyArray: [],
			array: [ "some value" ],
			emptyObject: {},
			object: { someValue: "some value" },
			function: () => {},
		} ).should.not.throw();
	} );

	test( "detects explicit provision of definitions for before-stage", function() {
		let normalized = Normalizer.Module( {
			before: "anything",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.equal( "anything" );
		normalized.after.should.be.Object().and.be.empty();
	} );

	test( "detects explicit provision of definitions for after-stage", function() {
		let normalized = Normalizer.Module( {
			after: "anything",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.Object().and.be.empty();
		normalized.after.should.equal( "anything" );
	} );

	test( "detects explicit provisions of definitions for before- and after-stage", function() {
		let normalized = Normalizer.Module( {
			before: "something",
			after: "anything",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.equal( "something" );
		normalized.after.should.equal( "anything" );
	} );

	test( "considers any definition 'non-conforming' on including at least one property not addressing some known stage", function() {
		// fully conforming with explicit provision of route definitions
		let normalized = Normalizer.Module( {
			before: "anything",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.eql( "anything" );
		normalized.after.should.be.Object().and.be.empty();

		// fully conforming with explicit provision of route definitions
		normalized = Normalizer.Module( {
			after: "nothing",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.Object().and.be.empty();
		normalized.after.should.eql( "nothing" );

		// fully conforming with explicit provision of route definitions
		normalized = Normalizer.Module( {
			before: "anything",
			after: "nothing",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.eql( "anything" );
		normalized.after.should.eql( "nothing" );

		// partially NOT conforming with explicit provision of route definitions
		normalized = Normalizer.Module( {
			before: "anything",
			after: "nothing",
			something: "something",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.Object().and.have.properties( "before", "after", "something" );
		normalized.after.should.be.Object().and.be.empty();
	} );

	test( "considers any non-conforming definition related to before-stage implicitly", function() {
		let normalized = Normalizer.Module( {
			something: "something",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.Object().and.have.properties( "something" );
		Object.keys( normalized.before ).should.have.length( 1 );
		normalized.after.should.be.Object().and.be.empty();
	} );

	test( "throws on definition including stages not supported for modules", function() {
		Normalizer.Module.bind( Normalizer, { before: "anything" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { after: "anything" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { early: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { late: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { early: "something", late: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { before: "something", early: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { before: "something", late: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { after: "something", early: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { after: "something", late: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { before: "everything", after: "something", early: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { before: "everything", after: "something", late: "anything" } ).should.throw();
		Normalizer.Module.bind( Normalizer, { before: "everything", after: "something", early: "anything", late: "nothing" } ).should.throw();
	} );

	test( "does not throw on definition including stages not supported for modules when combined with non-stage properties for considered neither stage explicitly provided then", function() {
		Normalizer.Module.bind( Normalizer, { extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { before: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { after: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { early: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { late: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { early: "something", late: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { before: "something", early: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { before: "something", late: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { after: "something", early: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { after: "something", late: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { before: "everything", after: "something", early: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { before: "everything", after: "something", late: "anything", extra: "extra" } ).should.not.throw();
		Normalizer.Module.bind( Normalizer, { before: "everything", after: "something", early: "anything", late: "nothing", extra: "extra" } ).should.not.throw();
	} );
} );
