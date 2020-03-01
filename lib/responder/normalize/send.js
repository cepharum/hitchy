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

/**
 * Implements simple version of `res.send()` as provided by expressjs.
 *
 * @name ServerResponse#send
 * @this HitchyRequestContext
 * @param {string|object} output data to be sent
 * @returns {ServerResponse} fluent interface
 */
module.exports = function _responseSend( output = "" ) {
	const response = this.response;

	if ( typeof output === "string" ) {
		if ( !response.getHeader( "content-type" ) ) {
			response.setHeader( "Content-Type", "text/plain; charset=UTF-8" );
		}

		response.end( output );
	} else if ( output instanceof Buffer ) {
		if ( !response.getHeader( "content-type" ) ) {
			response.setHeader( "Content-Type", "application/octet-stream" );
		}

		response.end( output );
	} else if ( output && typeof output === "object" ) {
		if ( !response.getHeader( "content-type" ) ) {
			response.setHeader( "Content-Type", "application/json; charset=UTF-8" );
		}

		response.end( JSON.stringify( output ) );
	} else {
		if ( !response.getHeader( "content-type" ) ) {
			response.setHeader( "Content-Type", "application/octet-stream" );
		}

		response.end();
	}

	return response;
};
