/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

module.exports = {
	json( req, res ) {
		res.json( { success: true } );
	},
	send( req, res ) {
		res.send( "success" );
	},
	write( req, res ) {
		res.write( "success" );
		res.end();
	},
	end( req, res ) {
		res.end( "success" );
	},
	setHeader( req, res ) {
		res.setHeader( "x-a", 1 );
		res.setHeader( "x-content-type", 2 );
		res.setHeader( "content-type", "text/plain" );
		res.setHeader( "x-b", "3" );
		res.end( "success" );
	},
	writeHead( req, res ) {
		res.writeHead( 200, {
			"x-a": 1,
			"x-content-type": 2,
			"content-type": "text/plain",
			"x-b": "3",
		} );
		res.end( "success" );
	},
	singleSet( req, res ) {
		res
			.set( "x-a", 1 )
			.set( "x-content-type", 2 )
			.set( "content-type", "text/plain" )
			.set( "x-b", "3" )
			.end( "success" );
	},
	multiSet( req, res ) {
		res.set( {
			"x-a": 1,
			"x-content-type": 2,
			"content-type": "text/plain",
			"x-b": "3",
		} )
			.end( "success" );
	},
	format( req, res ) {
		res.format( {
			html( _req, _res ) {
				_res.end( "<p>success</p>" );
			},
			json( _req, _res ) {
				_res.json( { success: true } );
			},
			text( _req, _res ) {
				_res.end( "success" );
			},
			default( _req, _res ) {
				_res.end( Buffer.from( "\x01success\x02" ) );
			},
		} );
	},
};
