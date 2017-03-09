"use strict";

const ApiMockUp = require( "../../../tools" ).apiMockUp();

const Utility = ApiMockUp( "lib/utility" );
const FileUtility = ApiMockUp( "lib/utility/file" );
const IntroduceUtility = ApiMockUp( "lib/utility/introduce" );
const LoggerUtility = ApiMockUp( "lib/utility/logger" );
const ParserUtility = ApiMockUp( "lib/utility/parser" );
const PromiseUtility = ApiMockUp( "lib/utility/promise" );

// ----------------------------------------------------------------------------

suite( "Utilities", function() {
	test( "are available using property of index as well as using subordinated file directly", function() {
		Utility.file.should.be.eql( FileUtility );
		Utility.introduce.should.be.eql( IntroduceUtility );
		Utility.logger.should.be.eql( LoggerUtility );
		Utility.parser.should.be.eql( ParserUtility );
		Utility.promise.should.be.eql( PromiseUtility );
	} );
} );
