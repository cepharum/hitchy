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

const apiOverlay = {
	runtime: {
		controllers: {
			custom: class CustomController {
				static myHandler( req, res ) {}
			}
		},
		policies: {
			filter: class FilterPolicy {
				static myImplementation( req, res, next ) {}
			}
		},
	}
};

const modules = {
	ListModule: "lib/router/types/list",
	RouteModule: "lib/router/types/route",
};

const ApiMockUp = require( "../../../../../tools" ).apiMockUp( { apiOverlay, modules } );

const Should = require( "should" );

// ----------------------------------------------------------------------------

suite( "Library.Router.Types.List.RoutesPerMethod", function() {
	test( "exists", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			RoutesPerMethod.should.be.ok().and.should.be.Object();
		} );
 	} );

	test( "can be instantiated", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			( () => { new RoutesPerMethod() } ).should.not.throw();
		} );
	} );

	test( "provides method for adding routes", function() {
		return ApiMockUp.then( function( { ListModule: { RoutesPerMethod } } ) {
			let collector = new RoutesPerMethod();
			collector.append.should.be.Function();
		} );
	} );

	test( "exposes initially empty map of method names into sorted lists of routes bound it", function() {
		return ApiMockUp.then( function( { API, ListModule: { RoutesPerMethod }, RouteModule: { TerminalRoute } } ) {
			let collector = new RoutesPerMethod();
			let route = new TerminalRoute( "GET /", () => {}, API );

			collector.methods.should.be.empty();

			collector.append( route );
			collector.methods.should.not.be.empty();
		} );
	} );
} );
