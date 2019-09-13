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

const Normalizer = require( "../../../../../lib/router/normalize/definition" );

const Should = require( "should" );
require( "should-http" );


suite( "Route definition normalizer", function() {
	test( "exposes function for normalizing route definitions of plugins", function() {
		Should.exist( Normalizer.Plugin );
		Normalizer.Plugin.should.be.Function();
	} );

	test( "exposes function for normalizing custom route definitions of any current application", function() {
		Should.exist( Normalizer.Custom );
		Normalizer.Custom.should.be.Function();
	} );
} );

suite( "Normalizer for module-related route definitions", function() {
	test( "does not throw on processing empty route definition", function() {
		Normalizer.Plugin.should.not.throw();
		Normalizer.Plugin.bind( Normalizer, null ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, undefined ).should.not.throw();
	} );

	test( "throws on processing invalid route definition", function() {
		Normalizer.Plugin.bind( Normalizer, false ).should.throw();
		Normalizer.Plugin.bind( Normalizer, true ).should.throw();
		Normalizer.Plugin.bind( Normalizer, 0 ).should.throw();
		Normalizer.Plugin.bind( Normalizer, 1 ).should.throw();
		Normalizer.Plugin.bind( Normalizer, -2 ).should.throw();
		Normalizer.Plugin.bind( Normalizer, "" ).should.throw();
		Normalizer.Plugin.bind( Normalizer, "0" ).should.throw();
		Normalizer.Plugin.bind( Normalizer, "/route" ).should.throw();
		Normalizer.Plugin.bind( Normalizer, function() {} ).should.throw();
		Normalizer.Plugin.bind( Normalizer, () => {} ).should.throw();
	} );

	test( "does not throw on processing valid definition without any element", function() {
		Normalizer.Plugin.bind( Normalizer, {} ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, [] ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, new Map() ).should.not.throw();
	} );

	test( "provides object always covering either supported stage", function() {
		const a = Normalizer.Plugin( {} );

		Should.exist( a );
		a.should.be.Object();
		a.should.have.properties( "before", "after" ).and.have.size( 2 );
	} );

	test( "basically cares for wellformedness of provided route definitions", function() {
		Normalizer.Plugin.bind( Normalizer, { null: null } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { false: false } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { true: true } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { undefined: undefined } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { emptyString: "" } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { string: "some value" } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { emptyArray: [] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { array: ["some value"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { emptyObject: {} } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { object: { someValue: "some value" } } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { function: () => {} } ).should.throw();

		// test cases value due to least difference from cases tested above
		// @note THIS DOES NOT MEAN THESE CASES ARE VALID AT LAST, but passing
		//       simple tests included with normalization.
		Normalizer.Plugin.bind( Normalizer, { "/null": null } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/false": false } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/true": true } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/undefined": undefined } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/emptyString": "" } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/string": "some value" } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/emptyArray": [] } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/array": ["some value"] } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/emptyObject": {} } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/object": { someValue: "some value" } } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { "/function": () => {} } ).should.not.throw();

		// using array for collecting route definitions
		Normalizer.Plugin.bind( Normalizer, [null] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [false] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [true] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [undefined] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [""] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, ["some value"] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [[]] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [["some value"]] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [{}] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [{ someValue: "some value" }] ).should.throw();
		Normalizer.Plugin.bind( Normalizer, [() => {}] ).should.throw();

		// test cases value due to least difference from cases tested above
		// @note THIS DOES NOT MEAN THESE CASES ARE VALID AT LAST, but passing
		//       simple tests included with normalization.
		Normalizer.Plugin.bind( Normalizer, ["/"] ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, ["/some value"] ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, ["some /value"] ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, [[ "/some", "value" ]] ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, [{ "/someValue": "some value" }] ).should.throw();
	} );

	test( "accepts set of routes explicitly bound to before-stage", function() {
		const definition = {
			before: ["/ => anything"],
		};

		const normalized = Normalizer.Plugin( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "before", "after" ).and.have.size( 2 );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "/ => anything" );
		normalized.after.should.be.instanceof( Map ).and.be.empty();
	} );

	test( "accepts set of routes explicitly bound to after-stage", function() {
		const definition = {
			after: ["/ => anything"],
		};

		const normalized = Normalizer.Plugin( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "before", "after" ).and.have.size( 2 );
		normalized.before.should.be.instanceof( Map ).and.be.empty();
		normalized.after.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.after.values().next().value.should.equal( "/ => anything" );
	} );

	test( "accepts combined provision of sets of routes explicitly bound to before- and after-stage", function() {
		const definition = {
			before: ["/ => something"],
			after: ["/ => anything"],
		};

		const normalized = Normalizer.Plugin( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "before", "after" ).and.have.size( 2 );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "/ => something" );
		normalized.after.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.after.values().next().value.should.equal( "/ => anything" );
	} );

	test( "implicitly binds set of routes to before-stage", function() {
		let normalized = Normalizer.Plugin( {
			"/something": "something",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "something" );
		normalized.after.should.be.instanceof( Map ).and.be.empty();

		normalized = Normalizer.Plugin( [
			"/something => something",
		] );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "/something => something" );
		normalized.after.should.be.instanceof( Map ).and.be.empty();
	} );

	test( "rejects set of routes explicitly bound to unknown stage", function() {
		Normalizer.Plugin.bind( Normalizer, {
			foo: [],
		} ).should.throw();

		Normalizer.Plugin.bind( Normalizer, {
			foo: ["/ => something"],
		} ).should.throw();
	} );

	test( "rejects definition combining sets bound to known stage with sets bound to unknown stage", function() {
		Normalizer.Plugin.bind( Normalizer, {
			before: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Plugin.bind( Normalizer, {
			before: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Plugin.bind( Normalizer, {
			after: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Plugin.bind( Normalizer, {
			after: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Plugin.bind( Normalizer, {
			before: ["/ => something"],
			after: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Plugin.bind( Normalizer, {
			before: ["/ => something"],
			after: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();
	} );

	test( "rejects explicitly bound sets of routes mixed with implicitly bound routes", function() {
		Normalizer.Plugin.bind( Normalizer, {
			// explicit:
			before: ["/ => anything"],
			after: ["/ => nothing"],
			// implicit:
			"/something": "something",
		} ).should.throw();
	} );

	test( "rejects definition including stages basically known, but not supported for plugins", function() {
		Normalizer.Plugin.bind( Normalizer, { before: ["/ => anything"] } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { after: ["/ => anything"] } ).should.not.throw();
		Normalizer.Plugin.bind( Normalizer, { early: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { late: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { early: ["/ => something"], late: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { before: ["/ => something"], early: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { before: ["/ => something"], late: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { after: ["/ => something"], early: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { after: ["/ => something"], late: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { before: ["/ => everything"], after: ["/ => something"], early: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { before: ["/ => everything"], after: ["/ => something"], late: ["/ => anything"] } ).should.throw();
		Normalizer.Plugin.bind( Normalizer, { before: ["/ => everything"], after: ["/ => something"], early: ["/ => anything"], late: ["/ => nothing"] } ).should.throw();
	} );
} );

suite( "Normalizer for application-related custom route definitions", function() {
	test( "does not throw on processing empty route definition", function() {
		Normalizer.Custom.should.not.throw();
		Normalizer.Custom.bind( Normalizer, null ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, undefined ).should.not.throw();
	} );

	test( "throws on processing invalid route definition", function() {
		Normalizer.Custom.bind( Normalizer, false ).should.throw();
		Normalizer.Custom.bind( Normalizer, true ).should.throw();
		Normalizer.Custom.bind( Normalizer, 0 ).should.throw();
		Normalizer.Custom.bind( Normalizer, 1 ).should.throw();
		Normalizer.Custom.bind( Normalizer, -2 ).should.throw();
		Normalizer.Custom.bind( Normalizer, "" ).should.throw();
		Normalizer.Custom.bind( Normalizer, "0" ).should.throw();
		Normalizer.Custom.bind( Normalizer, "/route" ).should.throw();
		Normalizer.Custom.bind( Normalizer, function() {} ).should.throw();
		Normalizer.Custom.bind( Normalizer, () => {} ).should.throw();
	} );

	test( "does not throw on processing valid definition without any element", function() {
		Normalizer.Custom.bind( Normalizer, {} ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, [] ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, new Map() ).should.not.throw();
	} );

	test( "provides object always covering either supported stage", function() {
		const a = Normalizer.Custom( {} );

		Should.exist( a );
		a.should.be.Object();
		a.should.have.properties( "early", "before", "after", "late" ).and.have.size( 4 );
	} );

	test( "basically cares for wellformedness of provided route definitions", function() {
		Normalizer.Custom.bind( Normalizer, { null: null } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { false: false } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { true: true } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { undefined: undefined } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { emptyString: "" } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { string: "some value" } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { emptyArray: [] } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { array: ["some value"] } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { emptyObject: {} } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { object: { someValue: "some value" } } ).should.throw();
		Normalizer.Custom.bind( Normalizer, { function: () => {} } ).should.throw();

		// test cases value due to least difference from cases tested above
		// @note THIS DOES NOT MEAN THESE CASES ARE VALID AT LAST, but passing
		//       simple tests included with normalization.
		Normalizer.Custom.bind( Normalizer, { "/null": null } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/false": false } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/true": true } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/undefined": undefined } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/emptyString": "" } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/string": "some value" } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/emptyArray": [] } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/array": ["some value"] } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/emptyObject": {} } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/object": { someValue: "some value" } } ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, { "/function": () => {} } ).should.not.throw();

		// using array for collecting route definitions
		Normalizer.Custom.bind( Normalizer, [null] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [false] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [true] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [undefined] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [""] ).should.throw();
		Normalizer.Custom.bind( Normalizer, ["some value"] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [[]] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [["some value"]] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [{}] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [{ someValue: "some value" }] ).should.throw();
		Normalizer.Custom.bind( Normalizer, [() => {}] ).should.throw();

		// test cases value due to least difference from cases tested above
		// @note THIS DOES NOT MEAN THESE CASES ARE VALID AT LAST, but passing
		//       simple tests included with normalization.
		Normalizer.Custom.bind( Normalizer, ["/"] ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, ["/some value"] ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, ["some /value"] ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, [[ "/some", "value" ]] ).should.not.throw();
		Normalizer.Custom.bind( Normalizer, [{ "/someValue": "some value" }] ).should.throw();
	} );

	test( "accepts set of routes explicitly bound to early-stage", function() {
		const definition = {
			early: ["/ => anything"],
		};

		const normalized = Normalizer.Custom( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "early", "before", "after", "late" ).and.have.size( 4 );
		normalized.early.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.early.values().next().value.should.equal( "/ => anything" );
		normalized.before.should.be.instanceof( Map ).and.be.empty();
		normalized.after.should.be.instanceof( Map ).and.be.empty();
		normalized.late.should.be.instanceof( Map ).and.be.empty();
	} );

	test( "accepts set of routes explicitly bound to before-stage", function() {
		const definition = {
			before: ["/ => anything"],
		};

		const normalized = Normalizer.Custom( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "early", "before", "after", "late" ).and.have.size( 4 );
		normalized.early.should.be.instanceof( Map ).and.be.empty();
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "/ => anything" );
		normalized.after.should.be.instanceof( Map ).and.be.empty();
		normalized.late.should.be.instanceof( Map ).and.be.empty();
	} );

	test( "accepts set of routes explicitly bound to after-stage", function() {
		const definition = {
			after: ["/ => anything"],
		};

		const normalized = Normalizer.Custom( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "early", "before", "after", "late" ).and.have.size( 4 );
		normalized.early.should.be.instanceof( Map ).and.be.empty();
		normalized.before.should.be.instanceof( Map ).and.be.empty();
		normalized.after.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.after.values().next().value.should.equal( "/ => anything" );
		normalized.late.should.be.instanceof( Map ).and.be.empty();
	} );

	test( "accepts set of routes explicitly bound to late-stage", function() {
		const definition = {
			late: ["/ => anything"],
		};

		const normalized = Normalizer.Custom( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "early", "before", "after", "late" ).and.have.size( 4 );
		normalized.early.should.be.instanceof( Map ).and.be.empty();
		normalized.before.should.be.instanceof( Map ).and.be.empty();
		normalized.after.should.be.instanceof( Map ).and.be.empty();
		normalized.late.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.late.values().next().value.should.equal( "/ => anything" );
	} );

	test( "accepts combined provision of sets of routes explicitly bound to early-, before-, after- and late-stage", function() {
		const definition = {
			early: ["/ => everything"],
			before: ["/ => something"],
			after: ["/ => anything"],
			late: ["/ => nothing"],
		};

		const normalized = Normalizer.Custom( definition );

		normalized.should.not.equal( definition );

		normalized.should.be.Object().and.have.properties( "early", "before", "after", "late" ).and.have.size( 4 );
		normalized.early.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.early.values().next().value.should.equal( "/ => everything" );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "/ => something" );
		normalized.after.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.after.values().next().value.should.equal( "/ => anything" );
		normalized.late.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.late.values().next().value.should.equal( "/ => nothing" );
	} );

	test( "implicitly binds set of routes to before-stage", function() {
		let normalized = Normalizer.Custom( {
			"/something": "something",
		} );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "something" );
		normalized.after.should.be.instanceof( Map ).and.be.empty();

		normalized = Normalizer.Custom( [
			"/something => something",
		] );

		normalized.should.be.Object().and.have.properties( "before", "after" );
		normalized.before.should.be.instanceof( Map ).and.have.size( 1 );
		normalized.before.values().next().value.should.equal( "/something => something" );
		normalized.after.should.be.instanceof( Map ).and.be.empty();
	} );

	test( "rejects set of routes explicitly bound to unknown stage", function() {
		Normalizer.Custom.bind( Normalizer, {
			foo: [],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			foo: ["/ => something"],
		} ).should.throw();
	} );

	test( "rejects definition combining sets bound to known stage with sets bound to unknown stage", function() {
		Normalizer.Custom.bind( Normalizer, {
			early: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			early: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			before: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			before: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			after: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			after: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			late: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			late: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			early: ["/ => something"],
			before: ["/ => something"],
			after: ["/ => something"],
			late: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Custom.bind( Normalizer, {
			early: ["/ => something"],
			before: ["/ => something"],
			after: ["/ => something"],
			late: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();
	} );

	test( "rejects explicitly bound sets of routes mixed with implicitly bound routes", function() {
		Normalizer.Custom.bind( Normalizer, {
			// explicit:
			early: ["/ => anything"],
			before: ["/ => anything"],
			after: ["/ => nothing"],
			late: ["/ => anything"],
			// implicit:
			"/something": "something",
		} ).should.throw();
	} );
} );

suite( "Normalizer for blueprint route definitions", function() {
	test( "does not throw on processing empty route definition", function() {
		Normalizer.Blueprint.should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, null ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, undefined ).should.not.throw();
	} );

	test( "throws on processing invalid route definition", function() {
		Normalizer.Blueprint.bind( Normalizer, false ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, true ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, 0 ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, 1 ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, -2 ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, "" ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, "0" ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, "/route" ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, function() {} ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, () => {} ).should.throw();
	} );

	test( "does not throw on processing valid definition without any element", function() {
		Normalizer.Blueprint.bind( Normalizer, {} ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, [] ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, new Map() ).should.not.throw();
	} );

	test( "does not provide wrapping object always covering either supported stage", function() {
		const a = Normalizer.Blueprint( {} );

		Should.exist( a );
		a.should.be.instanceof( Map );
		a.should.not.have.properties( "early", "before", "after", "late" ).and.be.empty();
	} );

	test( "basically cares for wellformedness of provided route definitions", function() {
		Normalizer.Blueprint.bind( Normalizer, { null: null } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { false: false } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { true: true } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { undefined: undefined } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { emptyString: "" } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { string: "some value" } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { emptyArray: [] } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { array: ["some value"] } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { emptyObject: {} } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { object: { someValue: "some value" } } ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, { function: () => {} } ).should.throw();

		// test cases value due to least difference from cases tested above
		// @note THIS DOES NOT MEAN THESE CASES ARE VALID AT LAST, but passing
		//       simple tests included with normalization.
		Normalizer.Blueprint.bind( Normalizer, { "/null": null } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/false": false } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/true": true } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/undefined": undefined } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/emptyString": "" } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/string": "some value" } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/emptyArray": [] } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/array": ["some value"] } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/emptyObject": {} } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/object": { someValue: "some value" } } ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, { "/function": () => {} } ).should.not.throw();

		// using array for collecting route definitions
		Normalizer.Blueprint.bind( Normalizer, [null] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [false] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [true] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [undefined] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [""] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, ["some value"] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [[]] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [["some value"]] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [{}] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [{ someValue: "some value" }] ).should.throw();
		Normalizer.Blueprint.bind( Normalizer, [() => {}] ).should.throw();

		// test cases value due to least difference from cases tested above
		// @note THIS DOES NOT MEAN THESE CASES ARE VALID AT LAST, but passing
		//       simple tests included with normalization.
		Normalizer.Blueprint.bind( Normalizer, ["/"] ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, ["/some value"] ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, ["some /value"] ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, [[ "/some", "value" ]] ).should.not.throw();
		Normalizer.Blueprint.bind( Normalizer, [{ "/someValue": "some value" }] ).should.throw();
	} );

	test( "rejects set of routes explicitly bound to early-stage due to not supporting any staging", function() {
		const definition = {
			early: ["/ => anything"],
		};

		Normalizer.Blueprint.bind( Normalizer, definition ).should.throw();
	} );

	test( "rejects set of routes explicitly bound to before-stage due to not supporting any staging", function() {
		const definition = {
			before: ["/ => anything"],
		};

		Normalizer.Blueprint.bind( Normalizer, definition ).should.throw();
	} );

	test( "rejects set of routes explicitly bound to after-stage due to not supporting any staging", function() {
		const definition = {
			after: ["/ => anything"],
		};

		Normalizer.Blueprint.bind( Normalizer, definition ).should.throw();
	} );

	test( "rejects set of routes explicitly bound to late-stage due to not supporting any staging", function() {
		const definition = {
			late: ["/ => anything"],
		};

		Normalizer.Blueprint.bind( Normalizer, definition ).should.throw();
	} );

	test( "rejects combined provision of sets of routes explicitly bound to early-, before-, after- and late-stage due to not supporting any staging", function() {
		const definition = {
			early: ["/ => everything"],
			before: ["/ => something"],
			after: ["/ => anything"],
			late: ["/ => nothing"],
		};

		Normalizer.Blueprint.bind( Normalizer, definition ).should.throw();
	} );

	test( "accepts set of routes not bound to any stage due to not supporting any staging", function() {
		let normalized = Normalizer.Blueprint( {
			"/something": "something",
		} );

		normalized.should.be.instanceof( Map ).and.have.size( 1 ).and.not.have.properties( "before" );
		normalized.values().next().value.should.equal( "something" );

		normalized = Normalizer.Blueprint( [
			"/something => something",
		] );

		normalized.should.be.instanceof( Map ).and.have.size( 1 ).and.not.have.properties( "before" );
		normalized.values().next().value.should.equal( "/something => something" );
	} );

	test( "rejects set of routes explicitly bound to unknown stage due to not supporting any staging", function() {
		Normalizer.Blueprint.bind( Normalizer, {
			foo: [],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			foo: ["/ => something"],
		} ).should.throw();
	} );

	test( "rejects definition combining sets bound to known stage with sets bound to unknown stage due to not supporting any staging", function() {
		Normalizer.Blueprint.bind( Normalizer, {
			early: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			early: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			before: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			before: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			after: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			after: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			late: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			late: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			early: ["/ => something"],
			before: ["/ => something"],
			after: ["/ => something"],
			late: ["/ => something"],
			foo: [],
		} ).should.throw();

		Normalizer.Blueprint.bind( Normalizer, {
			early: ["/ => something"],
			before: ["/ => something"],
			after: ["/ => something"],
			late: ["/ => something"],
			foo: ["/ => something"],
		} ).should.throw();
	} );

	test( "rejects explicitly bound sets of routes mixed with implicitly bound routes due to not supporting any staging", function() {
		Normalizer.Blueprint.bind( Normalizer, {
			// explicit:
			early: ["/ => anything"],
			before: ["/ => anything"],
			after: ["/ => nothing"],
			late: ["/ => anything"],
			// implicit:
			"/something": "something",
		} ).should.throw();
	} );
} );
