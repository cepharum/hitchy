"use strict";

const options = {
	projectFolder: "test/projects/routing-params",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../../tools/index" ).test;

// ----------------------------------------------------------------------------

describe( "Dispatching requests supports request path", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	[ "get", "post", "put" ]
		.forEach( method => {
			describe( "containing one variable segment which", () => {
				it( `matches string value (${method.toUpperCase()})`, function() {
					return ctx[method]( "/scalar/test" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test" );
							response.data.foo.should.be.equal( "test" );
						} );
				} );

				it( `matches string value with spaces (${method.toUpperCase()})`, function() {
					return ctx[method]( "/scalar/test with spaces" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test with spaces" );
							response.data.foo.should.be.equal( "test with spaces" );
						} );
				} );

				it( `matches string value with spaces encoded as %20 (${method.toUpperCase()})`, function() {
					return ctx[method]( "/scalar/test%20with%20spaces" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test with spaces" );
							response.data.foo.should.be.equal( "test with spaces" );
						} );
				} );

				it( `matches string value with + to be kept as-is (${method.toUpperCase()})`, function() {
					return ctx[method]( "/scalar/test+with+plus" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test+with+plus" );
							response.data.foo.should.be.equal( "test+with+plus" );
						} );
				} );

				it( `matches list of string values (${method.toUpperCase()})`, function() {
					return ctx[method]( "/list/test/with/separate/segments" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test,with,separate,segments" );
							response.data.foo.should.be.deepEqual( [ "test", "with", "separate", "segments" ] );
						} );
				} );

				it( `matches list of string values containing spaces (${method.toUpperCase()})`, function() {
					return ctx[method]( "/list/te st/wi th/sepa rate/segm ents" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "te st,wi th,sepa rate,segm ents" );
							response.data.foo.should.be.deepEqual( [ "te st", "wi th", "sepa rate", "segm ents" ] );
						} );
				} );

				it( `matches list of string values containing spaces encoded as %20 (${method.toUpperCase()})`, function() {
					return ctx[method]( "/list/te%20st/wi%20th/sepa%20rate/segm%20ents" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "te st,wi th,sepa rate,segm ents" );
							response.data.foo.should.be.deepEqual( [ "te st", "wi th", "sepa rate", "segm ents" ] );
						} );
				} );

				it( `matches list of string values containing forward slashes encoded as %2f (${method.toUpperCase()})`, function() {
					return ctx[method]( "/list/te%2fst/wi%2fth/sepa%2frate/segm%2fents" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "te/st,wi/th,sepa/rate,segm/ents" );
							response.data.foo.should.be.deepEqual( [ "te/st", "wi/th", "sepa/rate", "segm/ents" ] );
						} );
				} );

				it( `delivers list of string values even on providing single segment (${method.toUpperCase()})`, function() {
					return ctx[method]( "/list/test" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test" );
							response.data.foo.should.be.deepEqual( ["test"] );
						} );
				} );
			} );

			describe( "containing two variable segments separated by static segment which", () => {
				it( `both contain string values each exposed in different parameters (${method.toUpperCase()})`, function() {
					return ctx[method]( "/double/scalar/first/separated/second" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "first" );
							response.headers["x-param-bar"].should.be.equal( "second" );
							response.data.foo.should.be.equal( "first" );
							response.data.bar.should.be.equal( "second" );
						} );
				} );

				it( `both contain lists of string values each exposed in different parameters (${method.toUpperCase()})`, function() {
					return ctx[method]( "/double/list/test/with/separate/segments/separated/by/static/segment" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test,with,separate,segments" );
							response.headers["x-param-bar"].should.be.equal( "by,static,segment" );
							response.data.foo.should.be.deepEqual( [ "test", "with", "separate", "segments" ] );
							response.data.bar.should.be.deepEqual( [ "by", "static", "segment" ] );
						} );
				} );
			} );

			describe( "containing two variable segments separated by static segment with space which", () => {
				it( `both contain string values each exposed in different parameters (${method.toUpperCase()})`, function() {
					return ctx[method]( "/spec%20ial/scalar/first/sep%20arated/second" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "first" );
							response.headers["x-param-bar"].should.be.equal( "second" );
							response.data.foo.should.be.equal( "first" );
							response.data.bar.should.be.equal( "second" );
						} );
				} );

				it( `both contain lists of string values each exposed in different parameters (${method.toUpperCase()})`, function() {
					return ctx[method]( "/spec%20ial/list/test/with/separate/segments/sep%20arated/by/static/segment" )
						.then( response => {
							response.headers["x-param-foo"].should.be.equal( "test,with,separate,segments" );
							response.headers["x-param-bar"].should.be.equal( "by,static,segment" );
							response.data.foo.should.be.deepEqual( [ "test", "with", "separate", "segments" ] );
							response.data.bar.should.be.deepEqual( [ "by", "static", "segment" ] );
						} );
				} );
			} );
		} );
} );
