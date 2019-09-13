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

const session = {
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

/**
 * @param {RegExp} pattern controls current use case
 * @param {IncomingMessage} req request descriptor
 * @param {ServerResponse} res response manager
 * @param {function(error:Error=)} next callback invoked for triggering next handler
 * @param {Array} args additional arguments tracked in session
 * @returns {void}
 */
function filter( pattern, req, res, next, ...args ) {
	session.method.late = req.method;

	[ "params", "query" ]
		.forEach( set => {
			for ( const name in req[set] || {} ) {
				if ( req[set].hasOwnProperty( name ) ) {
					const match = pattern.exec( name );
					if ( match ) {
						session[set][match[1]] = req[set][name];
					}
				}
			}
		} );

	if ( args.length ) {
		session.args.late = args.slice();
	}

	next();
}


module.exports = {
	/**
	 * @param {IncomingMessage} req request descriptor
	 * @param {ServerResponse} res response manager
	 * @param {function(error:Error=)} next callback invoked for triggering next handler
	 * @returns {void}
	 */
	inject: function( req, res, next ) {
		req.session = session;

		next();
	},

	/**
	 * @param {IncomingMessage} req request descriptor
	 * @param {ServerResponse} res response manager
	 * @param {function(error:Error=)} next callback invoked for triggering next handler
	 * @returns {void}
	 */
	early: filter.bind( {}, /^early(\w+)$/ ),

	/**
	 * @param {IncomingMessage} req request descriptor
	 * @param {ServerResponse} res response manager
	 * @param {function(error:Error=)} next callback invoked for triggering next handler
	 * @returns {void}
	 */
	late: filter.bind( {}, /^late(\w+)$/ ),
};
