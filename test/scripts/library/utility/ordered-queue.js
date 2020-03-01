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

const { describe, it, beforeEach } = require( "mocha" );
const Should = require( "should" );

const OrderedQueue = require( "../../../../lib/utility/ordered-queue" );


describe( "OrderedQueue", function() {
	it( "can be instantiated", function() {
		Should.exist( OrderedQueue );
		( function() { new OrderedQueue( 10 ); } ).should.not.throw();
	} );

	it( "requires positive number of plugins to support on instantiating", function() {
		Should.exist( OrderedQueue );
		( function() { new OrderedQueue(); } ).should.throw();
		( function() { new OrderedQueue( undefined ); } ).should.throw();
		( function() { new OrderedQueue( null ); } ).should.throw();
		( function() { new OrderedQueue( false ); } ).should.throw();
		( function() { new OrderedQueue( true ); } ).should.throw();
		( function() { new OrderedQueue( "" ); } ).should.throw();
		( function() { new OrderedQueue( "true" ); } ).should.throw();
		( function() { new OrderedQueue( {} ); } ).should.throw();
		( function() { new OrderedQueue( { prop: 1 } ); } ).should.throw();
		( function() { new OrderedQueue( [] ); } ).should.throw();
		( function() { new OrderedQueue( [1] ); } ).should.throw();
		( function() { new OrderedQueue( () => {} ); } ).should.throw();
		( function() { new OrderedQueue( () => 1 ); } ).should.throw();
		( function() { new OrderedQueue( -1 ); } ).should.throw();

		( function() { new OrderedQueue( 2.5 ); } ).should.not.throw();

		( function() { new OrderedQueue( 0 ); } ).should.not.throw();
		( function() { new OrderedQueue( 1 ); } ).should.not.throw();
		( function() { new OrderedQueue( "1" ); } ).should.not.throw();
	} );
} );

describe( "An instance of OrderedQueue", function() {
	let queue;
	const pluginNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( pluginNumber );
	} );

	it( "exposes number of supported plugins as defined on instantiating queue", function() {
		queue.should.have.property( "pluginSlotCount" );
		queue.pluginSlotCount.should.be.greaterThanOrEqual( 0 );
	} );

	it( "exposes two separate list of slots", function() {
		queue.should.have.properties( "before", "after" );

		queue.before.should.be.Array();
		queue.before.length.should.be.greaterThanOrEqual( pluginNumber );

		queue.after.should.be.Array();
		queue.after.length.should.be.greaterThanOrEqual( pluginNumber );

		queue.before.should.not.equal( queue.after );
	} );

	it( "exposes flag indicating whether queue is still capable of accessing slots for reading/writing", function() {
		queue.should.have.property( "isAdjustable" );
	} );

	it( "is flagged 'adjustable' initially", function() {
		queue.isAdjustable.should.be.equal( true );
	} );

	it( "exposes method for compacting managed lists making them non-adjustable", function() {
		queue.should.have.property( "compact" );
		queue.compact.should.be.Function();

		queue.isAdjustable.should.be.equal( true );
		queue.compact.bind( queue ).should.not.throw();
		queue.isAdjustable.should.be.equal( false );
	} );

	it( "exposes method for compacting managed lists making them non-adjustable", function() {
		let i = 0;

		const countThree = () => i++ < 3;

		queue.should.have.property( "compact" );
		queue.compact.should.be.Function();

		queue.before.length.should.be.greaterThan( 3 );
		queue.after.length.should.be.greaterThan( 3 );
		queue.compact.bind( queue, countThree ).should.not.throw();
		queue.before.length.should.be.equal( 3 );
		queue.after.length.should.be.equal( 0 );
	} );

	it( "initially consists of unset slots, only (to be removed on compacting)", function() {
		Should( queue.before.length + queue.after.length ).be.greaterThanOrEqual( 2 * pluginNumber );
		queue.compact();
		Should( queue.before.length + queue.after.length ).be.equal( 0 );
	} );
} );

describe( "On managing plugin-related slots using an instance of OrderedQueue", function() {
	let queue;
	const pluginNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( pluginNumber );
	} );

	it( "exposes methods for getting/setting value of plugin-related slots", function() {
		queue.getOnPlugin.should.be.Function();
		queue.setOnPlugin.should.be.Function();
	} );

	it( "requires valid plugin index on addressing related slot for reading", function() {
		queue.getOnPlugin.bind( queue ).should.throw();
		queue.getOnPlugin.bind( queue, null ).should.throw();
		queue.getOnPlugin.bind( queue, undefined ).should.throw();
		queue.getOnPlugin.bind( queue, false ).should.throw();
		queue.getOnPlugin.bind( queue, true ).should.throw();
		queue.getOnPlugin.bind( queue, "" ).should.throw();
		queue.getOnPlugin.bind( queue, "something" ).should.throw();
		queue.getOnPlugin.bind( queue, [] ).should.throw();
		queue.getOnPlugin.bind( queue, [1] ).should.throw();
		queue.getOnPlugin.bind( queue, {} ).should.throw();
		queue.getOnPlugin.bind( queue, { something: 1 } ).should.throw();
		queue.getOnPlugin.bind( queue, function() {} ).should.throw();
		queue.getOnPlugin.bind( queue, () => 1 ).should.throw();

		queue.getOnPlugin.bind( queue, -1 ).should.throw();
		queue.getOnPlugin.bind( queue, 0 ).should.not.throw();
		queue.getOnPlugin.bind( queue, 1 ).should.not.throw();
		queue.getOnPlugin.bind( queue, 9 ).should.not.throw();
		queue.getOnPlugin.bind( queue, 10 ).should.throw();
	} );

	it( "requires valid plugin index on addressing related slot for writing", function() {
		queue.setOnPlugin.bind( queue ).should.throw();
		queue.setOnPlugin.bind( queue, null ).should.throw();
		queue.setOnPlugin.bind( queue, undefined ).should.throw();
		queue.setOnPlugin.bind( queue, false ).should.throw();
		queue.setOnPlugin.bind( queue, true ).should.throw();
		queue.setOnPlugin.bind( queue, "" ).should.throw();
		queue.setOnPlugin.bind( queue, "something" ).should.throw();
		queue.setOnPlugin.bind( queue, [] ).should.throw();
		queue.setOnPlugin.bind( queue, [1] ).should.throw();
		queue.setOnPlugin.bind( queue, {} ).should.throw();
		queue.setOnPlugin.bind( queue, { something: 1 } ).should.throw();
		queue.setOnPlugin.bind( queue, function() {} ).should.throw();
		queue.setOnPlugin.bind( queue, () => 1 ).should.throw();

		queue.setOnPlugin.bind( queue, -1 ).should.throw();
		queue.setOnPlugin.bind( queue, 0 ).should.not.throw();
		queue.setOnPlugin.bind( queue, 1 ).should.not.throw();
		queue.setOnPlugin.bind( queue, 9 ).should.not.throw();
		queue.setOnPlugin.bind( queue, 10 ).should.throw();
	} );

	it( "takes supported stage on selecting slot by index in either one's related list", function() {
		queue.getOnPlugin.bind( queue, 0 ).should.not.throw();
		queue.getOnPlugin.bind( queue, 1 ).should.not.throw();
		queue.getOnPlugin.bind( queue, 9 ).should.not.throw();
		queue.getOnPlugin.bind( queue, 0, "before" ).should.not.throw();
		queue.getOnPlugin.bind( queue, 1, "before" ).should.not.throw();
		queue.getOnPlugin.bind( queue, 9, "before" ).should.not.throw();
		queue.getOnPlugin.bind( queue, 0, "after" ).should.not.throw();
		queue.getOnPlugin.bind( queue, 1, "after" ).should.not.throw();
		queue.getOnPlugin.bind( queue, 9, "after" ).should.not.throw();
		queue.getOnPlugin.bind( queue, 0, true ).should.not.throw();
		queue.getOnPlugin.bind( queue, 1, true ).should.not.throw();
		queue.getOnPlugin.bind( queue, 9, true ).should.not.throw();
		queue.getOnPlugin.bind( queue, 0, false ).should.not.throw();
		queue.getOnPlugin.bind( queue, 1, false ).should.not.throw();
		queue.getOnPlugin.bind( queue, 9, false ).should.not.throw();
		queue.getOnPlugin.bind( queue, 0, "early" ).should.throw();
		queue.getOnPlugin.bind( queue, 1, "early" ).should.throw();
		queue.getOnPlugin.bind( queue, 9, "early" ).should.throw();
		queue.getOnPlugin.bind( queue, 0, "late" ).should.throw();
		queue.getOnPlugin.bind( queue, 1, "late" ).should.throw();
		queue.getOnPlugin.bind( queue, 9, "late" ).should.throw();
		queue.getOnPlugin.bind( queue, 0, "arbitrary" ).should.throw();
		queue.getOnPlugin.bind( queue, 1, "arbitrary" ).should.throw();
		queue.getOnPlugin.bind( queue, 9, "arbitrary" ).should.throw();

		queue.setOnPlugin.bind( queue, 0 ).should.not.throw();
		queue.setOnPlugin.bind( queue, 1 ).should.not.throw();
		queue.setOnPlugin.bind( queue, 9 ).should.not.throw();
		queue.setOnPlugin.bind( queue, 0, "before" ).should.not.throw();
		queue.setOnPlugin.bind( queue, 1, "before" ).should.not.throw();
		queue.setOnPlugin.bind( queue, 9, "before" ).should.not.throw();
		queue.setOnPlugin.bind( queue, 0, "after" ).should.not.throw();
		queue.setOnPlugin.bind( queue, 1, "after" ).should.not.throw();
		queue.setOnPlugin.bind( queue, 9, "after" ).should.not.throw();
		queue.setOnPlugin.bind( queue, 0, true ).should.not.throw();
		queue.setOnPlugin.bind( queue, 1, true ).should.not.throw();
		queue.setOnPlugin.bind( queue, 9, true ).should.not.throw();
		queue.setOnPlugin.bind( queue, 0, false ).should.not.throw();
		queue.setOnPlugin.bind( queue, 1, false ).should.not.throw();
		queue.setOnPlugin.bind( queue, 9, false ).should.not.throw();
		queue.setOnPlugin.bind( queue, 0, "early" ).should.throw();
		queue.setOnPlugin.bind( queue, 1, "early" ).should.throw();
		queue.setOnPlugin.bind( queue, 9, "early" ).should.throw();
		queue.setOnPlugin.bind( queue, 0, "late" ).should.throw();
		queue.setOnPlugin.bind( queue, 1, "late" ).should.throw();
		queue.setOnPlugin.bind( queue, 9, "late" ).should.throw();
		queue.setOnPlugin.bind( queue, 0, "arbitrary" ).should.throw();
		queue.setOnPlugin.bind( queue, 1, "arbitrary" ).should.throw();
		queue.setOnPlugin.bind( queue, 9, "arbitrary" ).should.throw();
	} );

	it( "implicitly initializes selected plugin's slot on reading", function() {
		queue.getOnPlugin( 0, "before", "test" ).should.equal( "test" );
		queue.getOnPlugin( 0, "before", "another test" ).should.equal( "test" );
	} );

	it( "always provides same value on fetching same slot", function() {
		const original = {};
		const a = queue.getOnPlugin( 0, "before", original );
		const b = queue.getOnPlugin( 0, "before" );

		a.should.equal( b );
	} );

	it( "provides different value on fetching same slot index from different stage", function() {
		const original = {};
		const a = queue.getOnPlugin( 0, "before", original );
		const b = queue.getOnPlugin( 0, "after" );

		a.should.not.equal( b );
	} );

	it( "works with 'before' stage by default", function() {
		const before = {}, after = {};

		queue.getOnPlugin( 0, "before", before );
		queue.getOnPlugin( 0, "after", after );

		queue.getOnPlugin( 0 ).should.equal( before );
		queue.getOnPlugin( 0 ).should.not.equal( after );
	} );

	it( "provides queue on setting value of a slot for fluently chaining method invocations", function() {
		queue.setOnPlugin( 0 ).should.equal( queue );
	} );

	it( "rejects access via plugin's index after compacting queue", function() {
		queue.setOnPlugin.bind( queue, 0, "before", {} ).should.not.throw();
		queue.getOnPlugin.bind( queue, 0, "before" ).should.not.throw();
		queue.compact();
		queue.setOnPlugin.bind( queue, 0, "before", {} ).should.throw();
		queue.getOnPlugin.bind( queue, 0, "before" ).should.throw();
	} );

	it( "removes any slot with falsy value on compacting", function() {
		queue
			.setOnPlugin( 0, "before", 0 )
			.setOnPlugin( 1, "before", undefined )
			.setOnPlugin( 2, "before", null )
			.setOnPlugin( 3, "before", "" )
			.setOnPlugin( 4, "before", false )
			.setOnPlugin( 5, "before", true )
			.setOnPlugin( 6, "before", 1 )
			.setOnPlugin( 7, "before", "0" );

		queue.before.length.should.be.greaterThanOrEqual( queue.pluginSlotCount );

		queue.compact();

		queue.before.should.have.length( 3 );
		queue.before[0].should.equal( true );
		queue.before[1].should.equal( 1 );
		queue.before[2].should.equal( "0" );
	} );

	it( "manages all slots in stage 'before' in order of index of slots", function() {
		queue
			.setOnPlugin( 9, "before", 10 )
			.setOnPlugin( 8, "before", 9 )
			.setOnPlugin( 7, "before", 8 )
			.setOnPlugin( 6, "before", 7 )
			.setOnPlugin( 5, "before", 6 )
			.setOnPlugin( 4, "before", 5 )
			.setOnPlugin( 3, "before", 4 )
			.setOnPlugin( 2, "before", 3 )
			.setOnPlugin( 1, "before", 2 )
			.setOnPlugin( 0, "before", 1 )
			.compact();

		for ( let i = 0, s = queue.before, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );

	it( "manages all slots in stage 'after' in reverse order of index of slots", function() {
		queue
			.setOnPlugin( 0, "after", 10 )
			.setOnPlugin( 1, "after", 9 )
			.setOnPlugin( 2, "after", 8 )
			.setOnPlugin( 3, "after", 7 )
			.setOnPlugin( 4, "after", 6 )
			.setOnPlugin( 5, "after", 5 )
			.setOnPlugin( 6, "after", 4 )
			.setOnPlugin( 7, "after", 3 )
			.setOnPlugin( 8, "after", 2 )
			.setOnPlugin( 9, "after", 1 )
			.compact();

		for ( let i = 0, s = queue.after, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );
} );

describe( "On managing custom slots using an instance of OrderedQueue", function() {
	let queue;
	const pluginNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( pluginNumber );
	} );

	it( "exposes methods for getting/setting value of custom slots", function() {
		queue.getCustomSlot.should.be.Function();
		queue.setCustomSlot.should.be.Function();
	} );

	it( "supports use of related getter w/o any argument", function() {
		queue.getCustomSlot.bind( queue ).should.not.throw();
	} );

	it( "optionally supports selection of custom slot in one out of several positions within managed sequence", function() {
		queue.getCustomSlot.bind( queue ).should.not.throw();
		queue.getCustomSlot.bind( queue ).should.not.throw();
		queue.getCustomSlot.bind( queue ).should.not.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "after" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "after" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "after" ).should.not.throw();
		queue.getCustomSlot.bind( queue, true ).should.not.throw();
		queue.getCustomSlot.bind( queue, true ).should.not.throw();
		queue.getCustomSlot.bind( queue, true ).should.not.throw();
		queue.getCustomSlot.bind( queue, false ).should.not.throw();
		queue.getCustomSlot.bind( queue, false ).should.not.throw();
		queue.getCustomSlot.bind( queue, false ).should.not.throw();
		queue.getCustomSlot.bind( queue, "early" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "early" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "early" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "late" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "late" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "late" ).should.not.throw();
		queue.getCustomSlot.bind( queue, "arbitrary" ).should.throw();
		queue.getCustomSlot.bind( queue, "arbitrary" ).should.throw();
		queue.getCustomSlot.bind( queue, "arbitrary" ).should.throw();

		queue.setCustomSlot.bind( queue ).should.not.throw();
		queue.setCustomSlot.bind( queue ).should.not.throw();
		queue.setCustomSlot.bind( queue ).should.not.throw();
		queue.setCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "after" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "after" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "after" ).should.not.throw();
		queue.setCustomSlot.bind( queue, true ).should.not.throw();
		queue.setCustomSlot.bind( queue, true ).should.not.throw();
		queue.setCustomSlot.bind( queue, true ).should.not.throw();
		queue.setCustomSlot.bind( queue, false ).should.not.throw();
		queue.setCustomSlot.bind( queue, false ).should.not.throw();
		queue.setCustomSlot.bind( queue, false ).should.not.throw();
		queue.setCustomSlot.bind( queue, "early" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "early" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "early" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "late" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "late" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "late" ).should.not.throw();
		queue.setCustomSlot.bind( queue, "arbitrary" ).should.throw();
		queue.setCustomSlot.bind( queue, "arbitrary" ).should.throw();
		queue.setCustomSlot.bind( queue, "arbitrary" ).should.throw();
	} );

	it( "implicitly initializes selected plugin's slot on reading", function() {
		queue.getCustomSlot( "before", "test" ).should.equal( "test" );
		queue.getCustomSlot( "before", "another test" ).should.equal( "test" );
		queue.getCustomSlot( "after", "test 2" ).should.equal( "test 2" );
		queue.getCustomSlot( "after", "another test 2" ).should.equal( "test 2" );
		queue.getCustomSlot( "early", "test 3" ).should.equal( "test 3" );
		queue.getCustomSlot( "early", "another test 3" ).should.equal( "test 3" );
		queue.getCustomSlot( "late", "test 4" ).should.equal( "test 4" );
		queue.getCustomSlot( "late", "another test 4" ).should.equal( "test 4" );

		queue.getCustomSlot( "before", "another test" ).should.equal( "test" );
		queue.getCustomSlot( "after", "another test 2" ).should.equal( "test 2" );
		queue.getCustomSlot( "early", "another test 3" ).should.equal( "test 3" );
		queue.getCustomSlot( "late", "another test 4" ).should.equal( "test 4" );
	} );

	it( "always provides same value on fetching same slot", function() {
		const original = {};
		const a = queue.getCustomSlot( "before", original );
		const b = queue.getCustomSlot( "before" );

		a.should.equal( b );
	} );

	it( "provides different value on fetching same slot index from different stage", function() {
		const original = {};
		const a = queue.getCustomSlot( "before", original );
		const b = queue.getCustomSlot( "after" );

		a.should.not.equal( b );
	} );

	it( "works with 'before' stage by default", function() {
		const before = {}, after = {};

		queue.getCustomSlot( "before", before );
		queue.getCustomSlot( "after", after );

		queue.getCustomSlot().should.equal( before );
		queue.getCustomSlot().should.not.equal( after );
	} );

	it( "provides queue on setting value of a slot for fluently chaining method invocations", function() {
		queue.setCustomSlot().should.equal( queue );
	} );

	it( "rejects access via plugin's index after compacting queue", function() {
		queue.setCustomSlot.bind( queue, "before", {} ).should.not.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.compact();
		queue.setCustomSlot.bind( queue, "before", {} ).should.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.throw();
	} );

	it( "removes any slot with falsy value on compacting", function() {
		queue
			.setCustomSlot( "early", "0" )
			.setCustomSlot( "before", undefined )
			.setCustomSlot( "after", null )
			.setCustomSlot( "late", 1 );

		queue.before.length.should.be.greaterThanOrEqual( queue.pluginSlotCount );

		queue.compact();

		queue.before.should.have.length( 1 );
		queue.before[0].should.equal( "0" );

		queue.after.should.have.length( 1 );
		queue.after[0].should.equal( 1 );
	} );

	it( "manages custom slots in list preceding inner slot in proper order", function() {
		queue
			.setCustomSlot( "before", 12 )
			.setOnPlugin( 9, "before", 11 )
			.setOnPlugin( 8, "before", 10 )
			.setOnPlugin( 7, "before", 9 )
			.setOnPlugin( 6, "before", 8 )
			.setOnPlugin( 5, "before", 7 )
			.setOnPlugin( 4, "before", 6 )
			.setOnPlugin( 3, "before", 5 )
			.setOnPlugin( 2, "before", 4 )
			.setOnPlugin( 1, "before", 3 )
			.setOnPlugin( 0, "before", 2 )
			.setCustomSlot( "early", 1 )
			.compact();

		for ( let i = 0, s = queue.before, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );

	it( "manages custom slots in list succeeding inner slot in proper (reverse) order", function() {
		queue
			.setCustomSlot( "late", 12 )
			.setOnPlugin( 0, "after", 11 )
			.setOnPlugin( 1, "after", 10 )
			.setOnPlugin( 2, "after", 9 )
			.setOnPlugin( 3, "after", 8 )
			.setOnPlugin( 4, "after", 7 )
			.setOnPlugin( 5, "after", 6 )
			.setOnPlugin( 6, "after", 5 )
			.setOnPlugin( 7, "after", 4 )
			.setOnPlugin( 8, "after", 3 )
			.setOnPlugin( 9, "after", 2 )
			.setCustomSlot( "after", 1 )
			.compact();

		for ( let i = 0, s = queue.after, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );
} );

describe( "On managing inner-action slot using an instance of OrderedQueue", function() {
	let queue;
	const pluginNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( pluginNumber );
	} );

	it( "exposes methods for getting/setting value of slot containing data related to inner action of queue", function() {
		queue.getInnerSlot.should.be.Function();
		queue.setInnerSlot.should.be.Function();
	} );

	it( "supports use of related getter w/o any argument", function() {
		queue.getInnerSlot.bind( queue ).should.not.throw();
	} );

	it( "does not require additional arguments on reading slot taking any given one as value optionally used to initialize slot", function() {
		queue.getInnerSlot.bind( queue, null ).should.not.throw();
		queue.getInnerSlot.bind( queue, undefined ).should.not.throw();
		queue.getInnerSlot.bind( queue, false ).should.not.throw();
		queue.getInnerSlot.bind( queue, true ).should.not.throw();
		queue.getInnerSlot.bind( queue, "" ).should.not.throw();
		queue.getInnerSlot.bind( queue, "something" ).should.not.throw();
		queue.getInnerSlot.bind( queue, [] ).should.not.throw();
		queue.getInnerSlot.bind( queue, [1] ).should.not.throw();
		queue.getInnerSlot.bind( queue, {} ).should.not.throw();
		queue.getInnerSlot.bind( queue, { something: 1 } ).should.not.throw();
		queue.getInnerSlot.bind( queue, function() {} ).should.not.throw();
		queue.getInnerSlot.bind( queue, () => 1 ).should.not.throw();

		queue.getInnerSlot.bind( queue, -1 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 0 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 1 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 9 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 10 ).should.not.throw();
	} );

	it( "optionally takes value on writing slot", function() {
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue, null ).should.not.throw();
		queue.setInnerSlot.bind( queue, undefined ).should.not.throw();
		queue.setInnerSlot.bind( queue, false ).should.not.throw();
		queue.setInnerSlot.bind( queue, true ).should.not.throw();
		queue.setInnerSlot.bind( queue, "" ).should.not.throw();
		queue.setInnerSlot.bind( queue, "something" ).should.not.throw();
		queue.setInnerSlot.bind( queue, [] ).should.not.throw();
		queue.setInnerSlot.bind( queue, [1] ).should.not.throw();
		queue.setInnerSlot.bind( queue, {} ).should.not.throw();
		queue.setInnerSlot.bind( queue, { something: 1 } ).should.not.throw();
		queue.setInnerSlot.bind( queue, function() {} ).should.not.throw();
		queue.setInnerSlot.bind( queue, () => 1 ).should.not.throw();

		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
	} );

	it( "implicitly initializes slot on reading", function() {
		queue.getInnerSlot( "test" ).should.equal( "test" );
		queue.getInnerSlot( "another test" ).should.equal( "test" );
	} );

	it( "always provides same value on fetching slot", function() {
		const original = {};
		const a = queue.getInnerSlot( original );
		const b = queue.getInnerSlot();

		a.should.equal( b );
	} );

	it( "provides queue on setting value of slot for fluently chaining method invocations", function() {
		queue.setInnerSlot().should.equal( queue );
	} );

	it( "rejects access after compacting queue", function() {
		queue.setInnerSlot.bind( queue, {} ).should.not.throw();
		queue.compact();
		queue.setInnerSlot.bind( queue, {} ).should.throw();
	} );

	it( "ignores slot with falsy value on compacting", function() {
		queue
			.setInnerSlot( 0 );

		queue.before.length.should.be.greaterThanOrEqual( queue.pluginSlotCount );

		queue.compact();

		queue.before.should.have.length( 0 );
	} );

	it( "obeys slot with truthy value on compacting", function() {
		queue
			.setInnerSlot( 1 );

		queue.before.length.should.be.greaterThanOrEqual( queue.pluginSlotCount );

		queue.compact();

		queue.before.should.have.length( 1 );
		queue.before[0].should.equal( 1 );
	} );

	it( "manages all slots in stage 'before' in order of index of slots", function() {
		queue
			.setInnerSlot( 13 )
			.setCustomSlot( "before", 12 )
			.setOnPlugin( 9, "before", 11 )
			.setOnPlugin( 8, "before", 10 )
			.setOnPlugin( 7, "before", 9 )
			.setOnPlugin( 6, "before", 8 )
			.setOnPlugin( 5, "before", 7 )
			.setOnPlugin( 4, "before", 6 )
			.setOnPlugin( 3, "before", 5 )
			.setOnPlugin( 2, "before", 4 )
			.setOnPlugin( 1, "before", 3 )
			.setOnPlugin( 0, "before", 2 )
			.setCustomSlot( "early", 1 )
			.compact();

		for ( let i = 0, s = queue.before, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );
} );
