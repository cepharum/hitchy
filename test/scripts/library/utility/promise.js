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
	PromiseUtility: "lib/utility/promise",
};

const Tools = require( "../../../../tools" );
const ApiMockUp = Tools.apiMockUp( { modules } );
const PromiseTool = Tools.promise;

// ----------------------------------------------------------------------------

const Should = require( "should" );

// ----------------------------------------------------------------------------

suite( "Library.Utility.Promise", function() {
	test( "provides same API as Tools.Promise", function() {
		return ApiMockUp.then( function( { PromiseUtility } ) {
			PromiseUtility.each.should.be.exactly( PromiseTool.each );
			PromiseUtility.filter.should.be.exactly( PromiseTool.filter );
			PromiseUtility.map.should.be.exactly( PromiseTool.map );
			PromiseUtility.multiMap.should.be.exactly( PromiseTool.multiMap );
			PromiseUtility.find.should.be.exactly( PromiseTool.find );
			PromiseUtility.indexOf.should.be.exactly( PromiseTool.indexOf );
			PromiseUtility.delay.should.be.exactly( PromiseTool.delay );
		} );
	} );
} );
