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

const apiOverlay = {
	runtime: {
		controllers: {
			custom: class CustomController {
				static myHandler( req, res ) {} // eslint-disable-line no-unused-vars, require-jsdoc
			}
		},
		policies: {
			filter: class FilterPolicy {
				static myImplementation( req, res, next ) {} // eslint-disable-line no-unused-vars, require-jsdoc
			}
		},
	}
};

const modules = {
	ListModule: "lib/router/types/list",
	RouteModule: "lib/router/types/route",
};

const { suite, test } = require( "mocha" );

const Should = require( "should" );
require( "should-http" );

const ApiMockUp = require( "../../../../../tools" ).apiMockUp( { apiOverlay, modules } );

// ----------------------------------------------------------------------------

suite( "Library.Router.Types.List.RoutesPerMethod", function() {
	test( "exists", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			RoutesPerMethod.should.be.ok().and.should.be.Object();
		} );
	} );

	test( "can be instantiated", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			( () => { new RoutesPerMethod(); } ).should.not.throw();
		} );
	} );

	test( "exposes collection of routes per method", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			const collector = new RoutesPerMethod();
			collector.should.have.property( "methods" );
			collector.methods.should.be.Object().and.be.ok();
		} );
	} );

	test( "exposes flag indicating whether instance is adjustable or not", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			const collector = new RoutesPerMethod();
			collector.should.have.property( "isAdjustable" );
			collector.isAdjustable.should.be.Boolean();
		} );
	} );

	test( "provides method for adding routes", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();
			collector.append.should.be.Function().and.have.length( 1 );

			collector.append.bind( collector ).should.throw();
			collector.append.bind( collector, undefined ).should.throw();
			collector.append.bind( collector, null ).should.throw();
			collector.append.bind( collector, true ).should.throw();
			collector.append.bind( collector, false ).should.throw();
			collector.append.bind( collector, 0 ).should.throw();
			collector.append.bind( collector, "0" ).should.throw();
			collector.append.bind( collector, "" ).should.throw();
			collector.append.bind( collector, {} ).should.throw();
			collector.append.bind( collector, { prefix: "/" } ).should.throw();
			collector.append.bind( collector, [] ).should.throw();
			collector.append.bind( collector, ["/"] ).should.throw();

			collector.append.bind( collector, new TerminalRoute( "/", () => {}, API ) ).should.not.throw();

			collector.concat( new RoutesPerMethod() ).should.equal( collector );
		} );
	} );

	test( "provides method for concatenating two sets of lists", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			const collector = new RoutesPerMethod();
			collector.concat.should.be.Function().and.have.length( 1 );

			collector.concat.bind( collector ).should.throw();
			collector.concat.bind( collector, undefined ).should.throw();
			collector.concat.bind( collector, null ).should.throw();
			collector.concat.bind( collector, true ).should.throw();
			collector.concat.bind( collector, false ).should.throw();
			collector.concat.bind( collector, 0 ).should.throw();
			collector.concat.bind( collector, "0" ).should.throw();
			collector.concat.bind( collector, "" ).should.throw();
			collector.concat.bind( collector, {} ).should.throw();
			collector.concat.bind( collector, { prefix: "/" } ).should.throw();
			collector.concat.bind( collector, [] ).should.throw();
			collector.concat.bind( collector, ["/"] ).should.throw();

			collector.concat.bind( collector, new RoutesPerMethod() ).should.not.throw();

			collector.concat( new RoutesPerMethod() ).should.equal( collector );
		} );
	} );

	test( "provides method for fetching routes associated with an HTTP method", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod, RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			let collector = new RoutesPerMethod();
			collector.onMethod.should.be.Function().and.have.length( 1 );

			collector.onMethod.bind( collector ).should.throw();
			collector.onMethod.bind( collector, undefined ).should.throw();
			collector.onMethod.bind( collector, null ).should.throw();
			collector.onMethod.bind( collector, true ).should.throw();
			collector.onMethod.bind( collector, false ).should.throw();
			collector.onMethod.bind( collector, 0 ).should.throw();
			collector.onMethod.bind( collector, "" ).should.throw();
			collector.onMethod.bind( collector, {} ).should.throw();
			collector.onMethod.bind( collector, { prefix: "/" } ).should.throw();
			collector.onMethod.bind( collector, [] ).should.throw();
			collector.onMethod.bind( collector, ["/"] ).should.throw();

			collector.onMethod.bind( collector, "0" ).should.not.throw();
			collector.onMethod.bind( collector, "GET" ).should.not.throw();

			Should( collector.onMethod( "GET" ) ).be.Null();

			collector = new RoutesPerMethod();
			collector.append( new TerminalRoute( "/", () => {}, API ) );

			collector.onMethod( "GET" ).should.be.instanceof( RoutesPerPrefix );
		} );
	} );

	test( "provides method for optimizing sets of routes", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			const collector = new RoutesPerMethod();
			collector.optimizeByPrefix.should.be.Function().have.length( 0 );

			collector.optimizeByPrefix.bind( collector ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, undefined ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, null ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, true ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, false ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, 0 ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, "" ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, {} ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, { prefix: "/" } ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, [] ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, ["/"] ).should.not.throw();

			collector.optimizeByPrefix.bind( collector, "0" ).should.not.throw();
			collector.optimizeByPrefix.bind( collector, "GET" ).should.not.throw();

			collector.optimizeByPrefix().should.equal( collector );
		} );
	} );

	test( "becomes inadjustable on optimizing sets of routes", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();

			collector.isAdjustable.should.be.ok();
			collector.append.bind( collector, new TerminalRoute( "/", () => {}, API ) ).should.not.throw();

			collector.optimizeByPrefix();

			collector.isAdjustable.should.be.false();
			collector.append.bind( collector, new TerminalRoute( "/", () => {}, API ) ).should.throw();
		} );
	} );

	test( "exposes initially empty map of method names into sorted lists of routes bound it", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();
			const route = new TerminalRoute( "GET /", () => {}, API );

			collector.methods.should.be.empty();

			collector.append( route );
			collector.methods.should.not.be.empty();
		} );
	} );

	test( "collects sets of non-unique routes per method each route is bound to", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();

			collector.methods.should.be.empty();

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.methods.should.have.properties( "GET" ).and.have.size( 1 );
			collector.methods.GET.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.methods.GET.should.be.Array().and.have.length( 2 );

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.methods.GET.should.be.Array().and.have.length( 3 );
		} );
	} );

	test( "collects appended routes in context of method each route is bound to", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();

			collector.methods.should.be.empty();

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.methods.should.have.properties( "GET" ).and.have.size( 1 );
			collector.methods.GET.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "GET /test", () => {}, API ) );
			collector.methods.GET.should.be.Array().and.have.length( 2 );

			collector.append( new TerminalRoute( "POST /", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST" ).and.have.size( 2 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.POST.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "POST /test", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST" ).and.have.size( 2 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.POST.should.be.Array().and.have.length( 2 );

			collector.append( new TerminalRoute( "PUT /test", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST", "PUT" ).and.have.size( 3 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.POST.should.be.Array().and.have.length( 2 );
			collector.methods.PUT.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "PUT /", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST", "PUT" ).and.have.size( 3 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.POST.should.be.Array().and.have.length( 2 );
			collector.methods.PUT.should.be.Array().and.have.length( 2 );

			collector.methods.GET[0].path.should.equal( "/" );
			collector.methods.GET[1].path.should.equal( "/test" );
			collector.methods.POST[0].path.should.equal( "/" );
			collector.methods.POST[1].path.should.equal( "/test" );
			collector.methods.PUT[0].path.should.equal( "/test" );
			collector.methods.PUT[1].path.should.equal( "/" );
		} );
	} );

	test( "collects appended routes not bound to any method in context of any previously collected method, too", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();

			collector.methods.should.be.empty();

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.methods.should.have.properties( "GET" ).and.have.size( 1 );
			collector.methods.GET.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "GET /test", () => {}, API ) );
			collector.methods.GET.should.be.Array().and.have.length( 2 );

			collector.append( new TerminalRoute( "POST /", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST" ).and.have.size( 2 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.POST.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "POST /test", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST" ).and.have.size( 2 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.POST.should.be.Array().and.have.length( 2 );

			collector.append( new TerminalRoute( "ALL /test", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST", "ALL" ).and.have.size( 3 );
			collector.methods.GET.should.be.Array().and.have.length( 3 );
			collector.methods.POST.should.be.Array().and.have.length( 3 );
			collector.methods.ALL.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "ALL /", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "POST", "ALL" ).and.have.size( 3 );
			collector.methods.GET.should.be.Array().and.have.length( 4 );
			collector.methods.POST.should.be.Array().and.have.length( 4 );
			collector.methods.ALL.should.be.Array().and.have.length( 2 );

			collector.methods.GET[0].path.should.equal( "/" );
			collector.methods.GET[1].path.should.equal( "/test" );
			collector.methods.GET[2].path.should.equal( "/test" );
			collector.methods.GET[3].path.should.equal( "/" );
			collector.methods.POST[0].path.should.equal( "/" );
			collector.methods.POST[1].path.should.equal( "/test" );
			collector.methods.POST[2].path.should.equal( "/test" );
			collector.methods.POST[3].path.should.equal( "/" );
			collector.methods.ALL[0].path.should.equal( "/test" );
			collector.methods.ALL[1].path.should.equal( "/" );
		} );
	} );

	test( "starts sets for any new method with previously collected routes not bound to any method", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();

			collector.methods.should.be.empty();

			collector.append( new TerminalRoute( "GET /get", () => {}, API ) );
			collector.methods.should.have.properties( "GET" ).and.have.size( 1 );
			collector.methods.GET.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "ALL /all", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "ALL" ).and.have.size( 2 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.ALL.should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "POST /post", () => {}, API ) );
			collector.methods.should.have.properties( "GET", "ALL", "POST" ).and.have.size( 3 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.ALL.should.be.Array().and.have.length( 1 );
			collector.methods.POST.should.be.Array().and.have.length( 2 );

			collector.methods.GET[0].path.should.equal( "/get" );
			collector.methods.GET[1].path.should.equal( "/all" );
			collector.methods.ALL[0].path.should.equal( "/all" );
			collector.methods.POST[0].path.should.equal( "/all" );
			collector.methods.POST[1].path.should.equal( "/post" );
		} );
	} );

	test( "converts simple lists of routes per method into instances of RoutesPerPrefix per method on optimizing", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod, RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();

			collector.methods.should.be.empty();

			collector.append( new TerminalRoute( "GET /get", () => {}, API ) );
			collector.append( new TerminalRoute( "GET /get2", () => {}, API ) );
			collector.append( new TerminalRoute( "POST /post", () => {}, API ) );
			collector.append( new TerminalRoute( "POST /post2", () => {}, API ) );
			collector.append( new TerminalRoute( "PUT /put", () => {}, API ) );
			collector.append( new TerminalRoute( "PUT /put2", () => {}, API ) );

			collector.methods.GET.should.be.Array();
			collector.methods.POST.should.be.Array();
			collector.methods.PUT.should.be.Array();

			collector.optimizeByPrefix();

			collector.methods.GET.should.be.instanceof( RoutesPerPrefix );
			collector.methods.POST.should.be.instanceof( RoutesPerPrefix );
			collector.methods.PUT.should.be.instanceof( RoutesPerPrefix );
		} );
	} );

	test( "concatenates all routes per method of two instances by appended a given one's routes to current one's", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerMethod();
			const provider = new RoutesPerMethod();

			collector.append( new TerminalRoute( "GET /get", () => {}, API ) );
			collector.append( new TerminalRoute( "ALL /all", () => {}, API ) );

			collector.methods.should.have.properties( "GET", "ALL" ).and.have.size( 2 );
			collector.methods.GET.should.be.Array().and.have.length( 2 );
			collector.methods.ALL.should.be.Array().and.have.length( 1 );

			collector.methods.GET.map( r => r.path ).should.eql( [ "/get", "/all" ] );
			collector.methods.ALL.map( r => r.path ).should.eql( ["/all"] );


			provider.append( new TerminalRoute( "GET /get2", () => {}, API ) );
			provider.append( new TerminalRoute( "POST /post", () => {}, API ) );
			provider.append( new TerminalRoute( "POST /post2", () => {}, API ) );
			provider.append( new TerminalRoute( "PUT /put", () => {}, API ) );

			provider.methods.should.have.properties( "GET", "POST", "PUT" ).and.have.size( 3 );
			provider.methods.GET.should.be.Array().and.have.length( 1 );
			provider.methods.POST.should.be.Array().and.have.length( 2 );
			provider.methods.PUT.should.be.Array().and.have.length( 1 );

			provider.methods.GET.map( r => r.path ).should.eql( ["/get2"] );
			provider.methods.POST.map( r => r.path ).should.eql( [ "/post", "/post2" ] );
			provider.methods.PUT.map( r => r.path ).should.eql( ["/put"] );


			collector.concat( provider );

			collector.methods.should.have.properties( "GET", "ALL", "POST", "PUT" );
			collector.methods.GET.should.be.Array().and.have.length( 3 );
			collector.methods.ALL.should.be.Array().and.have.length( 1 );
			collector.methods.POST.should.be.Array().and.have.length( 3 );
			collector.methods.PUT.should.be.Array().and.have.length( 2 );

			collector.methods.GET.map( r => r.path ).should.eql( [ "/get", "/all", "/get2" ] );
			collector.methods.ALL.map( r => r.path ).should.eql( ["/all"] );
			collector.methods.POST.map( r => r.path ).should.eql( [ "/all", "/post", "/post2" ] );
			collector.methods.PUT.map( r => r.path ).should.eql( [ "/all", "/put" ] );
		} );
	} );
} );

suite( "Library.Router.Types.List.RoutesPerPrefix", function() {
	test( "exists", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerPrefix } } ) {
			RoutesPerPrefix.should.be.ok().and.should.be.Object();
		} );
	} );

	test( "can be instantiated", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerPrefix } } ) {
			( () => { new RoutesPerPrefix(); } ).should.not.throw();
		} );
	} );

	test( "exposes collection of routes per prefix", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerPrefix } } ) {
			const collector = new RoutesPerPrefix();
			collector.should.have.property( "prefixes" );
			collector.prefixes.should.be.Object().and.be.ok();
		} );
	} );

	test( "exposes flag indicating whether list of supported prefixes can be extended or not", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerPrefix } } ) {
			const collector = new RoutesPerPrefix();
			collector.should.have.property( "extensible" );
			collector.extensible.should.be.Boolean();
		} );
	} );

	test( "provides method for adding routes", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerPrefix();
			collector.append.should.be.Function().and.have.length( 1 );

			collector.append.bind( collector ).should.throw();
			collector.append.bind( collector, undefined ).should.throw();
			collector.append.bind( collector, null ).should.throw();
			collector.append.bind( collector, true ).should.throw();
			collector.append.bind( collector, false ).should.throw();
			collector.append.bind( collector, 0 ).should.throw();
			collector.append.bind( collector, "0" ).should.throw();
			collector.append.bind( collector, "" ).should.throw();
			collector.append.bind( collector, {} ).should.throw();
			collector.append.bind( collector, { prefix: "/" } ).should.throw();
			collector.append.bind( collector, [] ).should.throw();
			collector.append.bind( collector, ["/"] ).should.throw();

			collector.append.bind( collector, new TerminalRoute( "/", () => {}, API ) ).should.not.throw();
		} );
	} );

	test( "provides method for getting prefix addressing list of routes matching best some given prefix", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			let collector = new RoutesPerPrefix();
			collector.getLongestMatchingPrefix.should.be.Function().and.have.length( 1 );

			collector.getLongestMatchingPrefix.bind( collector ).should.throw();
			collector.getLongestMatchingPrefix.bind( collector, "" ).should.throw();

			collector.getLongestMatchingPrefix.bind( collector, "/" ).should.not.throw();

			let prefix = collector.getLongestMatchingPrefix( "/" );
			Should( prefix ).be.Null();

			collector = new RoutesPerPrefix();
			collector.append( new TerminalRoute( "/", () => {}, API ) );

			prefix = collector.getLongestMatchingPrefix( "/" );
			prefix.should.be.String();
			collector.prefixes.should.have.property( prefix );
		} );
	} );

	test( "provides method for getting sorted list of routes bound to prefix matching best some given one", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			let collector = new RoutesPerPrefix();
			collector.onPrefix.should.be.Function().and.have.length( 1 );

			collector.onPrefix.bind( collector ).should.throw();
			collector.onPrefix.bind( collector, "" ).should.throw();

			collector.onPrefix.bind( collector, "/" ).should.not.throw();

			let sortedList = collector.onPrefix( "/" );
			Should( sortedList ).be.Null();

			collector = new RoutesPerPrefix();
			collector.append( new TerminalRoute( "/", () => {}, API ) );

			sortedList = collector.onPrefix( "/" );
			sortedList.should.be.Array();
		} );
	} );

	test( "is marked extensible unless providing explicit set of supported prefixes on constructing", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerPrefix } } ) {
			let collector = new RoutesPerPrefix();
			collector.extensible.should.be.true();

			collector = new RoutesPerPrefix( [] );
			collector.extensible.should.be.false();

			collector = new RoutesPerPrefix( [ "/", "/prefix" ] );
			collector.extensible.should.be.false();
		} );
	} );

	test( "exposes initially empty map of prefixes into routes unless fixing set of supported prefixes to be provided initially", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerPrefix } } ) {
			let collector = new RoutesPerPrefix();
			collector.prefixes.should.be.empty();

			collector = new RoutesPerPrefix( [] );
			collector.prefixes.should.be.empty();   // still empty due to empty list of prefixes to support

			collector = new RoutesPerPrefix( [ "/", "/prefix" ] );
			collector.prefixes.should.not.be.false();
		} );
	} );

	test( "collects routes by group on appending each keeping sorting order prefix", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerPrefix();
			const route1 = new TerminalRoute( "GET /", () => {}, API );
			const route2 = new TerminalRoute( "GET /", () => {}, API );
			const route3 = new TerminalRoute( "GET /", () => {}, API );

			collector.prefixes.should.be.empty();

			collector.append( route1 );
			collector.prefixes.should.have.properties( "/" ).and.have.size( 1 );
			collector.prefixes["/"].should.be.Array().and.eql( [route1] ).and.have.length( 1 );
			collector.append( route2 );
			collector.prefixes.should.have.properties( "/" ).and.have.size( 1 );
			collector.prefixes["/"].should.be.Array().and.eql( [ route1, route2 ] ).and.have.length( 2 );
			collector.append( route3 );
			collector.prefixes.should.have.properties( "/" ).and.have.size( 1 );
			collector.prefixes["/"].should.be.Array().and.eql( [ route1, route2, route3 ] ).and.have.length( 3 );
		} );
	} );

	test( "creates new group on appending route not matching any existing prefix", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerPrefix();

			collector.prefixes.should.be.empty();
			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.prefixes.should.have.properties( "/" ).and.have.size( 1 );
			collector.prefixes["/"].should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.prefixes.should.have.properties( "/" ).and.have.size( 1 );
			collector.prefixes["/"].should.be.Array().and.have.length( 2 );

			collector.append( new TerminalRoute( "POST /", () => {}, API ) );
			collector.prefixes.should.have.properties( "/" ).and.have.size( 1 );
			collector.prefixes["/"].should.be.Array().and.have.length( 3 );

			collector.append( new TerminalRoute( "GET /test", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test" ).and.have.size( 2 );
			collector.prefixes["/"].should.be.Array().and.have.length( 3 );
			collector.prefixes["/test"].should.be.Array().and.have.length( 1 );
		} );
	} );

	test( "does not create new group on appending route not matching any of the pre-defined prefixes", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			let collector = new RoutesPerPrefix( [] );

			collector.prefixes.should.be.empty();
			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.prefixes.should.be.empty();

			collector = new RoutesPerPrefix( ["/"] );

			collector.prefixes.should.not.be.empty().and.have.size( 1 );
			collector.prefixes.should.not.be.empty().and.have.property( "/" ).and.have.length( 0 );
			collector.prefixes.should.not.be.empty().and.not.have.property( "/test" );
			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.prefixes.should.not.be.empty().and.have.property( "/" ).and.have.length( 1 );
			collector.append( new TerminalRoute( "GET /test", () => {}, API ) );
			collector.prefixes.should.not.be.empty().and.not.have.property( "/test" );

			collector = new RoutesPerPrefix( [ "/", "/test" ] );

			collector.prefixes.should.not.be.empty().and.have.size( 2 );
			collector.prefixes.should.not.be.empty().and.have.property( "/" ).and.have.length( 0 );
			collector.prefixes.should.not.be.empty().and.have.property( "/test" ).and.have.size( 0 );

			collector.append( new TerminalRoute( "GET /", () => {}, API ) );
			collector.prefixes.should.not.be.empty().and.have.property( "/" ).and.have.length( 1 );
			collector.prefixes.should.not.be.empty().and.have.property( "/test" ).and.have.size( 0 );

			collector.append( new TerminalRoute( "GET /test", () => {}, API ) );
			collector.prefixes.should.not.be.empty().and.have.property( "/" ).and.have.length( 1 );
			collector.prefixes.should.not.be.empty().and.have.property( "/test" ).and.have.size( 1 );
		} );
	} );

	test( "collects routes with divergent prefixes in separate groups, only", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerPrefix();

			collector.append( new TerminalRoute( "/test1", () => {}, API ) );
			collector.prefixes.should.have.properties( "/test1" ).and.have.size( 1 );
			collector.prefixes["/test1"].should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "/test2", () => {}, API ) );
			collector.prefixes.should.have.properties( "/test1", "/test2" ).and.have.size( 2 );
			collector.prefixes["/test1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test2"].should.be.Array().and.have.length( 1 );
		} );
	} );

	test( "collects policy routes with more generic prefixes in all groups of more specific matching prefixes, too", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { PolicyRoute } } ) {
			const collector = new RoutesPerPrefix();

			collector.append( new PolicyRoute( "/", () => {}, API ) );
			collector.append( new PolicyRoute( "/test1/sub1", () => {}, API ) );
			collector.append( new PolicyRoute( "/test2/sub1", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test1/sub1", "/test2/sub1" ).and.have.size( 3 );
			collector.prefixes["/"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1/sub1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test2/sub1"].should.be.Array().and.have.length( 1 );

			collector.append( new PolicyRoute( "/test1", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test1", "/test1/sub1", "/test2/sub1" ).and.have.size( 4 );
			collector.prefixes["/"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1/sub1"].should.be.Array().and.have.length( 2 );
			collector.prefixes["/test2/sub1"].should.be.Array().and.have.length( 1 );

			collector.append( new PolicyRoute( "/", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test1", "/test1/sub1", "/test2/sub1" ).and.have.size( 4 );
			collector.prefixes["/"].should.be.Array().and.have.length( 2 );
			collector.prefixes["/test1"].should.be.Array().and.have.length( 2 );
			collector.prefixes["/test1/sub1"].should.be.Array().and.have.length( 3 );
			collector.prefixes["/test2/sub1"].should.be.Array().and.have.length( 2 );
		} );
	} );

	test( "does not also collect terminal routes with more generic prefixes in all groups of more specific matching prefixes", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { TerminalRoute } } ) {
			const collector = new RoutesPerPrefix();

			collector.append( new TerminalRoute( "/", () => {}, API ) );
			collector.append( new TerminalRoute( "/test1/sub1", () => {}, API ) );
			collector.append( new TerminalRoute( "/test2/sub1", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test1/sub1", "/test2/sub1" ).and.have.size( 3 );
			collector.prefixes["/"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1/sub1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test2/sub1"].should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "/test1", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test1", "/test1/sub1", "/test2/sub1" ).and.have.size( 4 );
			collector.prefixes["/"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1/sub1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test2/sub1"].should.be.Array().and.have.length( 1 );

			collector.append( new TerminalRoute( "/", () => {}, API ) );
			collector.prefixes.should.have.properties( "/", "/test1", "/test1/sub1", "/test2/sub1" ).and.have.size( 4 );
			collector.prefixes["/"].should.be.Array().and.have.length( 2 );
			collector.prefixes["/test1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test1/sub1"].should.be.Array().and.have.length( 1 );
			collector.prefixes["/test2/sub1"].should.be.Array().and.have.length( 1 );
		} );
	} );

	test( "collects generic path w/ regexp on existing prefix, too", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerPrefix }, RouteModule: { PolicyRoute } } ) {
			const collector = new RoutesPerPrefix();

			collector.append( new PolicyRoute( "/test/sub", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 1 );

			collector.append( new PolicyRoute( "/te(st)?", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 2 );

			collector.append( new PolicyRoute( "/te(st)+", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 3 );

			collector.append( new PolicyRoute( "/test*", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 4 );

			collector.append( new PolicyRoute( "/:major/sub", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 5 );

			collector.append( new PolicyRoute( "/:major?/test", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 6 );


			collector.append( new PolicyRoute( "/test/su/b", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 6 );

			collector.append( new PolicyRoute( "/te/st/sub", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 6 );

			collector.append( new PolicyRoute( "/tast/sub", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 6 );

			collector.append( new PolicyRoute( "/:major+/sup", () => {}, API ) );
			collector.prefixes.should.have.property( "/test/sub" ).and.be.Array().and.have.length( 6 );
		} );
	} );
} );
