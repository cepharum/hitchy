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

const OrderedQueue = require( "../../../../lib/utility/ordered-queue" );

const Should = require( "should" );


suite( "OrderedQueue", function() {
	test( "can be instantiated", function() {
		Should.exist( OrderedQueue );
		(function() { new OrderedQueue( 10 ) }).should.not.throw();
	} );

	test( "requires positive number on modules to support on instantiating", function() {
		Should.exist( OrderedQueue );
		(function() { new OrderedQueue() }).should.throw();
		(function() { new OrderedQueue( undefined ) }).should.throw();
		(function() { new OrderedQueue( null ) }).should.throw();
		(function() { new OrderedQueue( false ) }).should.throw();
		(function() { new OrderedQueue( true ) }).should.throw();
		(function() { new OrderedQueue( "" ) }).should.throw();
		(function() { new OrderedQueue( "true" ) }).should.throw();
		(function() { new OrderedQueue( {} ) }).should.throw();
		(function() { new OrderedQueue( { prop: 1 } ) }).should.throw();
		(function() { new OrderedQueue( [] ) }).should.throw();
		(function() { new OrderedQueue( [ 1 ] ) }).should.throw();
		(function() { new OrderedQueue( () => {} ) }).should.throw();
		(function() { new OrderedQueue( () => 1 ) }).should.throw();
		(function() { new OrderedQueue( -1 ) }).should.throw();

		(function() { new OrderedQueue( 2.5 ) }).should.not.throw();    // for obeying integer part, only (=2)

		(function() { new OrderedQueue( 0 ) }).should.not.throw();
		(function() { new OrderedQueue( 1 ) }).should.not.throw();
		(function() { new OrderedQueue( "1" ) }).should.not.throw();
	} );
} );

suite( "An instance of OrderedQueue", function() {
	let queue;
	const moduleNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( moduleNumber );
	} );

	test( "exposes number of supported modules as defined on instantiating queue", function() {
		queue.should.have.property( "moduleSlotCount" );
		queue.moduleSlotCount.should.be.greaterThanOrEqual( 0 );
	} );

	test( "exposes two separate list of slots", function() {
		queue.should.have.properties( "before", "after" );

		queue.before.should.be.Array();
		queue.before.length.should.be.greaterThanOrEqual( moduleNumber );

		queue.after.should.be.Array();
		queue.after.length.should.be.greaterThanOrEqual( moduleNumber );

		queue.before.should.not.equal( queue.after );
	} );

	test( "exposes flag indicating whether queue is still capable of accessing slots for reading/writing", function() {
		queue.should.have.property( "isAdjustable" );
	} );

	test( "is flagged 'adjustable' initially", function() {
		queue.isAdjustable.should.be.equal( true );
	} );

	test( "exposes method for compacting managed lists making them non-adjustable", function() {
		queue.should.have.property( "compact" );
		queue.compact.should.be.Function();

		queue.isAdjustable.should.be.equal( true );
		queue.compact.bind( queue ).should.not.throw();
		queue.isAdjustable.should.be.equal( false );
	} );

	test( "initially consists of unset slots, only (to be removed on compacting)", function() {
		Should( queue.before.length + queue.after.length ).be.greaterThanOrEqual( 2 * moduleNumber );
		queue.compact();
		Should( queue.before.length + queue.after.length ).be.equal( 0 );
	} );
} );

suite( "For managing module-related slots an instance of OrderedQueue", function() {
	let queue;
	const moduleNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( moduleNumber );
	} );

	test( "exposes methods for getting/setting value of module-related slots", function() {
		queue.getOnModule.should.be.Function();
		queue.setOnModule.should.be.Function();
	} );

	test( "requires valid module index on addressing related slot for reading", function() {
		queue.getOnModule.bind( queue ).should.throw();
		queue.getOnModule.bind( queue, null ).should.throw();
		queue.getOnModule.bind( queue, undefined ).should.throw();
		queue.getOnModule.bind( queue, false ).should.throw();
		queue.getOnModule.bind( queue, true ).should.throw();
		queue.getOnModule.bind( queue, "" ).should.throw();
		queue.getOnModule.bind( queue, "something" ).should.throw();
		queue.getOnModule.bind( queue, [] ).should.throw();
		queue.getOnModule.bind( queue, [1] ).should.throw();
		queue.getOnModule.bind( queue, {} ).should.throw();
		queue.getOnModule.bind( queue, {something: 1} ).should.throw();
		queue.getOnModule.bind( queue, function() {} ).should.throw();
		queue.getOnModule.bind( queue, () => 1 ).should.throw();

		queue.getOnModule.bind( queue, -1 ).should.throw();
		queue.getOnModule.bind( queue, 0 ).should.not.throw();
		queue.getOnModule.bind( queue, 1 ).should.not.throw();
		queue.getOnModule.bind( queue, 9 ).should.not.throw();
		queue.getOnModule.bind( queue, 10 ).should.throw();
	} );

	test( "requires valid module index on addressing related slot for writing", function() {
		queue.setOnModule.bind( queue ).should.throw();
		queue.setOnModule.bind( queue, null ).should.throw();
		queue.setOnModule.bind( queue, undefined ).should.throw();
		queue.setOnModule.bind( queue, false ).should.throw();
		queue.setOnModule.bind( queue, true ).should.throw();
		queue.setOnModule.bind( queue, "" ).should.throw();
		queue.setOnModule.bind( queue, "something" ).should.throw();
		queue.setOnModule.bind( queue, [] ).should.throw();
		queue.setOnModule.bind( queue, [1] ).should.throw();
		queue.setOnModule.bind( queue, {} ).should.throw();
		queue.setOnModule.bind( queue, {something: 1} ).should.throw();
		queue.setOnModule.bind( queue, function() {} ).should.throw();
		queue.setOnModule.bind( queue, () => 1 ).should.throw();

		queue.setOnModule.bind( queue, -1 ).should.throw();
		queue.setOnModule.bind( queue, 0 ).should.not.throw();
		queue.setOnModule.bind( queue, 1 ).should.not.throw();
		queue.setOnModule.bind( queue, 9 ).should.not.throw();
		queue.setOnModule.bind( queue, 10 ).should.throw();
	} );

	test( "takes supported stage on selecting slot by index in either one's related list", function() {
		queue.getOnModule.bind( queue, 0 ).should.not.throw();
		queue.getOnModule.bind( queue, 1 ).should.not.throw();
		queue.getOnModule.bind( queue, 9 ).should.not.throw();
		queue.getOnModule.bind( queue, 0, "before" ).should.not.throw();
		queue.getOnModule.bind( queue, 1, "before" ).should.not.throw();
		queue.getOnModule.bind( queue, 9, "before" ).should.not.throw();
		queue.getOnModule.bind( queue, 0, "after" ).should.not.throw();
		queue.getOnModule.bind( queue, 1, "after" ).should.not.throw();
		queue.getOnModule.bind( queue, 9, "after" ).should.not.throw();
		queue.getOnModule.bind( queue, 0, true ).should.not.throw();
		queue.getOnModule.bind( queue, 1, true ).should.not.throw();
		queue.getOnModule.bind( queue, 9, true ).should.not.throw();
		queue.getOnModule.bind( queue, 0, false ).should.not.throw();
		queue.getOnModule.bind( queue, 1, false ).should.not.throw();
		queue.getOnModule.bind( queue, 9, false ).should.not.throw();
		queue.getOnModule.bind( queue, 0, "early" ).should.throw();
		queue.getOnModule.bind( queue, 1, "early" ).should.throw();
		queue.getOnModule.bind( queue, 9, "early" ).should.throw();
		queue.getOnModule.bind( queue, 0, "late" ).should.throw();
		queue.getOnModule.bind( queue, 1, "late" ).should.throw();
		queue.getOnModule.bind( queue, 9, "late" ).should.throw();
		queue.getOnModule.bind( queue, 0, "arbitrary" ).should.throw();
		queue.getOnModule.bind( queue, 1, "arbitrary" ).should.throw();
		queue.getOnModule.bind( queue, 9, "arbitrary" ).should.throw();

		queue.setOnModule.bind( queue, 0 ).should.not.throw();
		queue.setOnModule.bind( queue, 1 ).should.not.throw();
		queue.setOnModule.bind( queue, 9 ).should.not.throw();
		queue.setOnModule.bind( queue, 0, "before" ).should.not.throw();
		queue.setOnModule.bind( queue, 1, "before" ).should.not.throw();
		queue.setOnModule.bind( queue, 9, "before" ).should.not.throw();
		queue.setOnModule.bind( queue, 0, "after" ).should.not.throw();
		queue.setOnModule.bind( queue, 1, "after" ).should.not.throw();
		queue.setOnModule.bind( queue, 9, "after" ).should.not.throw();
		queue.setOnModule.bind( queue, 0, true ).should.not.throw();
		queue.setOnModule.bind( queue, 1, true ).should.not.throw();
		queue.setOnModule.bind( queue, 9, true ).should.not.throw();
		queue.setOnModule.bind( queue, 0, false ).should.not.throw();
		queue.setOnModule.bind( queue, 1, false ).should.not.throw();
		queue.setOnModule.bind( queue, 9, false ).should.not.throw();
		queue.setOnModule.bind( queue, 0, "early" ).should.throw();
		queue.setOnModule.bind( queue, 1, "early" ).should.throw();
		queue.setOnModule.bind( queue, 9, "early" ).should.throw();
		queue.setOnModule.bind( queue, 0, "late" ).should.throw();
		queue.setOnModule.bind( queue, 1, "late" ).should.throw();
		queue.setOnModule.bind( queue, 9, "late" ).should.throw();
		queue.setOnModule.bind( queue, 0, "arbitrary" ).should.throw();
		queue.setOnModule.bind( queue, 1, "arbitrary" ).should.throw();
		queue.setOnModule.bind( queue, 9, "arbitrary" ).should.throw();
	} );

	test( "implicitly initializes selected module's slot on reading", function() {
		queue.getOnModule( 0, "before", "test" ).should.equal( "test" );
		queue.getOnModule( 0, "before", "another test" ).should.equal( "test" );
	} );

	test( "always provides same value on fetching same slot", function() {
		let original = {};
		let a = queue.getOnModule( 0, "before", original );
		let b = queue.getOnModule( 0, "before" );

		a.should.equal( b );
	} );

	test( "provides different value on fetching same slot index from different stage", function() {
		let original = {};
		let a = queue.getOnModule( 0, "before", original );
		let b = queue.getOnModule( 0, "after" );

		a.should.not.equal( b );
	} );

	test( "works with 'before' stage by default", function() {
		let before = {}, after = {};

		queue.getOnModule( 0, "before", before );
		queue.getOnModule( 0, "after", after );

		queue.getOnModule( 0 ).should.equal( before );
		queue.getOnModule( 0 ).should.not.equal( after );
	} );

	test( "provides queue on setting value of a slot for fluently chaining method invocations", function() {
		queue.setOnModule( 0 ).should.equal( queue );
	} );

	test( "rejects access via module's index after compacting queue", function() {
		queue.setOnModule.bind( queue, 0, "before", {} ).should.not.throw();
		queue.getOnModule.bind( queue, 0, "before" ).should.not.throw();
		queue.compact();
		queue.setOnModule.bind( queue, 0, "before", {} ).should.throw();
		queue.getOnModule.bind( queue, 0, "before" ).should.throw();
	} );

	test( "removes any slot with falsy value on compacting", function() {
		queue
			.setOnModule( 0, "before", 0 )
			.setOnModule( 1, "before", undefined )
			.setOnModule( 2, "before", null )
			.setOnModule( 3, "before", "" )
			.setOnModule( 4, "before", false )
			.setOnModule( 5, "before", true )
			.setOnModule( 6, "before", 1 )
			.setOnModule( 7, "before", "0" );

		queue.before.length.should.be.greaterThanOrEqual( queue.moduleSlotCount );

		queue.compact();

		queue.before.should.have.length( 3 );
		queue.before[0].should.equal( true );
		queue.before[1].should.equal( 1 );
		queue.before[2].should.equal( "0" );
	} );

	test( "manages all slots in stage 'before' in order of index of slots", function() {
		queue
			.setOnModule( 9, "before", 10 )
			.setOnModule( 8, "before", 9 )
			.setOnModule( 7, "before", 8 )
			.setOnModule( 6, "before", 7 )
			.setOnModule( 5, "before", 6 )
			.setOnModule( 4, "before", 5 )
			.setOnModule( 3, "before", 4 )
			.setOnModule( 2, "before", 3 )
			.setOnModule( 1, "before", 2 )
			.setOnModule( 0, "before", 1 )
			.compact();

		for ( let i = 0, s = queue.before, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );

	test( "manages all slots in stage 'after' in reverse order of index of slots", function() {
		queue
			.setOnModule( 0, "after", 10 )
			.setOnModule( 1, "after", 9 )
			.setOnModule( 2, "after", 8 )
			.setOnModule( 3, "after", 7 )
			.setOnModule( 4, "after", 6 )
			.setOnModule( 5, "after", 5 )
			.setOnModule( 6, "after", 4 )
			.setOnModule( 7, "after", 3 )
			.setOnModule( 8, "after", 2 )
			.setOnModule( 9, "after", 1 )
			.compact();

		for ( let i = 0, s = queue.after, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );
} );

suite( "For managing custom slots an instance of OrderedQueue", function() {
	let queue;
	const moduleNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( moduleNumber );
	} );

	test( "exposes methods for getting/setting value of custom slots", function() {
		queue.getCustomSlot.should.be.Function();
		queue.setCustomSlot.should.be.Function();
	} );

	test( "supports use of related getter w/o any argument", function() {
		queue.getCustomSlot.bind( queue ).should.not.throw();
	} );

	test( "optionally supports selection of custom slot in one out of several positions within managed sequence", function() {
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

	test( "implicitly initializes selected module's slot on reading", function() {
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

	test( "always provides same value on fetching same slot", function() {
		let original = {};
		let a = queue.getCustomSlot( "before", original );
		let b = queue.getCustomSlot( "before" );

		a.should.equal( b );
	} );

	test( "provides different value on fetching same slot index from different stage", function() {
		let original = {};
		let a = queue.getCustomSlot( "before", original );
		let b = queue.getCustomSlot( "after" );

		a.should.not.equal( b );
	} );

	test( "works with 'before' stage by default", function() {
		let before = {}, after = {};

		queue.getCustomSlot( "before", before );
		queue.getCustomSlot( "after", after );

		queue.getCustomSlot().should.equal( before );
		queue.getCustomSlot().should.not.equal( after );
	} );

	test( "provides queue on setting value of a slot for fluently chaining method invocations", function() {
		queue.setCustomSlot().should.equal( queue );
	} );

	test( "rejects access via module's index after compacting queue", function() {
		queue.setCustomSlot.bind( queue, "before", {} ).should.not.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.not.throw();
		queue.compact();
		queue.setCustomSlot.bind( queue, "before", {} ).should.throw();
		queue.getCustomSlot.bind( queue, "before" ).should.throw();
	} );

	test( "removes any slot with falsy value on compacting", function() {
		queue
			.setCustomSlot( "early", "0" )
			.setCustomSlot( "before", undefined )
			.setCustomSlot( "after", null )
			.setCustomSlot( "late", 1 );

		queue.before.length.should.be.greaterThanOrEqual( queue.moduleSlotCount );

		queue.compact();

		queue.before.should.have.length( 1 );
		queue.before[0].should.equal( "0" );

		queue.after.should.have.length( 1 );
		queue.after[0].should.equal( 1 );
	} );

	test( "manages custom slots in list preceding inner slot in proper order", function() {
		queue
			.setCustomSlot( "before", 12 )
			.setOnModule( 9, "before", 11 )
			.setOnModule( 8, "before", 10 )
			.setOnModule( 7, "before", 9 )
			.setOnModule( 6, "before", 8 )
			.setOnModule( 5, "before", 7 )
			.setOnModule( 4, "before", 6 )
			.setOnModule( 3, "before", 5 )
			.setOnModule( 2, "before", 4 )
			.setOnModule( 1, "before", 3 )
			.setOnModule( 0, "before", 2 )
			.setCustomSlot( "early", 1 )
			.compact();

		for ( let i = 0, s = queue.before, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );

	test( "manages custom slots in list succeeding inner slot in proper (reverse) order", function() {
		queue
			.setCustomSlot( "late", 12 )
			.setOnModule( 0, "after", 11 )
			.setOnModule( 1, "after", 10 )
			.setOnModule( 2, "after", 9 )
			.setOnModule( 3, "after", 8 )
			.setOnModule( 4, "after", 7 )
			.setOnModule( 5, "after", 6 )
			.setOnModule( 6, "after", 5 )
			.setOnModule( 7, "after", 4 )
			.setOnModule( 8, "after", 3 )
			.setOnModule( 9, "after", 2 )
			.setCustomSlot( "after", 1 )
			.compact();

		for ( let i = 0, s = queue.after, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );
} );

suite( "For managing inner-action slot an instance of OrderedQueue", function() {
	let queue;
	const moduleNumber = 10;

	beforeEach( function() {
		queue = new OrderedQueue( moduleNumber );
	} );

	test( "exposes methods for getting/setting value of slot containing data related to inner action of queue", function() {
		queue.getInnerSlot.should.be.Function();
		queue.setInnerSlot.should.be.Function();
	} );

	test( "supports use of related getter w/o any argument", function() {
		queue.getInnerSlot.bind( queue ).should.not.throw();
	} );

	test( "does not require additional arguments on reading slot taking any given one as value optionally used to initialize slot", function() {
		queue.getInnerSlot.bind( queue, null ).should.not.throw();
		queue.getInnerSlot.bind( queue, undefined ).should.not.throw();
		queue.getInnerSlot.bind( queue, false ).should.not.throw();
		queue.getInnerSlot.bind( queue, true ).should.not.throw();
		queue.getInnerSlot.bind( queue, "" ).should.not.throw();
		queue.getInnerSlot.bind( queue, "something" ).should.not.throw();
		queue.getInnerSlot.bind( queue, [] ).should.not.throw();
		queue.getInnerSlot.bind( queue, [1] ).should.not.throw();
		queue.getInnerSlot.bind( queue, {} ).should.not.throw();
		queue.getInnerSlot.bind( queue, {something: 1} ).should.not.throw();
		queue.getInnerSlot.bind( queue, function() {} ).should.not.throw();
		queue.getInnerSlot.bind( queue, () => 1 ).should.not.throw();

		queue.getInnerSlot.bind( queue, -1 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 0 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 1 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 9 ).should.not.throw();
		queue.getInnerSlot.bind( queue, 10 ).should.not.throw();
	} );

	test( "optionally takes value on writing slot", function() {
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
		queue.setInnerSlot.bind( queue, {something: 1} ).should.not.throw();
		queue.setInnerSlot.bind( queue, function() {} ).should.not.throw();
		queue.setInnerSlot.bind( queue, () => 1 ).should.not.throw();

		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
		queue.setInnerSlot.bind( queue ).should.not.throw();
	} );

	test( "implicitly initializes slot on reading", function() {
		queue.getInnerSlot( "test" ).should.equal( "test" );
		queue.getInnerSlot( "another test" ).should.equal( "test" );
	} );

	test( "always provides same value on fetching slot", function() {
		let original = {};
		let a = queue.getInnerSlot( original );
		let b = queue.getInnerSlot();

		a.should.equal( b );
	} );

	test( "provides queue on setting value of slot for fluently chaining method invocations", function() {
		queue.setInnerSlot().should.equal( queue );
	} );

	test( "rejects access after compacting queue", function() {
		queue.setInnerSlot.bind( queue, {} ).should.not.throw();
		queue.compact();
		queue.setInnerSlot.bind( queue, {} ).should.throw();
	} );

	test( "ignores slot with falsy value on compacting", function() {
		queue
			.setInnerSlot( 0 );

		queue.before.length.should.be.greaterThanOrEqual( queue.moduleSlotCount );

		queue.compact();

		queue.before.should.have.length( 0 );
	} );

	test( "obeys slot with truthy value on compacting", function() {
		queue
			.setInnerSlot( 1 );

		queue.before.length.should.be.greaterThanOrEqual( queue.moduleSlotCount );

		queue.compact();

		queue.before.should.have.length( 1 );
		queue.before[0].should.equal( 1 );
	} );

	test( "manages all slots in stage 'before' in order of index of slots", function() {
		queue
			.setInnerSlot( 13 )
			.setCustomSlot( "before", 12 )
			.setOnModule( 9, "before", 11 )
			.setOnModule( 8, "before", 10 )
			.setOnModule( 7, "before", 9 )
			.setOnModule( 6, "before", 8 )
			.setOnModule( 5, "before", 7 )
			.setOnModule( 4, "before", 6 )
			.setOnModule( 3, "before", 5 )
			.setOnModule( 2, "before", 4 )
			.setOnModule( 1, "before", 3 )
			.setOnModule( 0, "before", 2 )
			.setCustomSlot( "early", 1 )
			.compact();

		for ( let i = 0, s = queue.before, l = s.length; i < l; i++ ) {
			s[i].should.equal( i + 1 );
		}
	} );
} );
