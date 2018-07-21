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

let session = {
	method: {
		early: null,
		late: null,
	},
	params: {},
	query: {},
	args: {
		early: [],
		late: [],
	},
};

function filter( pattern, req, res, next ) {
	session.method.late = req.method;

	["params", "query"]
		.forEach( set => {
			for ( let name in req[set] || {} ) {
				if ( req[set].hasOwnProperty( name ) ) {
					let match = pattern.exec( name );
					if ( match ) {
						session[set][match[1]] = req[set][name];
					}
				}
			}
		} );

	let args = [].slice( arguments, 3 );
	if ( args.length ) {
		session.args.late = args;
	}

	next();
}


module.exports = {
	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res
	 * @param {function(error:Error=)} next
	 */
	inject: function( req, res, next ) {
		req.session = session;

		next();
	},

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res
	 * @param {function(error:Error=)} next
	 */
	early: filter.bind( {}, /^early(\w+)$/ ),

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res
	 * @param {function(error:Error=)} next
	 */
	late: filter.bind( {}, /^late(\w+)$/ ),
};