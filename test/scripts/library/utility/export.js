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
	Utility: "lib/utility",
	FileUtility: "lib/utility/file",
	IntroduceUtility: "lib/utility/introduce",
	LoggerUtility: "lib/utility/logger",
	ParserUtility: "lib/utility/parser",
	PromiseUtility: "lib/utility/promise",
};

const ApiMockUp = require( "../../../../tools" ).apiMockUp( { modules } );

// ----------------------------------------------------------------------------

const Should = require( "should" );

// ----------------------------------------------------------------------------

suite( "Library.Utility", function() {
	test( "exports collection of submodules", function() {
		return ApiMockUp.then( function( { Utility, FileUtility, IntroduceUtility, LoggerUtility, ParserUtility, PromiseUtility } ) {
			// NOTE This test compares provision of APIs using different ways
			//      for accessing parts of it ... due to CMP providing code
			//      bound to API
			Utility.file.should.be.eql( FileUtility );
			Utility.introduce.should.be.eql( IntroduceUtility );
			Utility.logger.should.be.eql( LoggerUtility );
			Utility.parser.should.be.eql( ParserUtility );
			Utility.promise.should.be.eql( PromiseUtility );
		} );
	} );
} );
