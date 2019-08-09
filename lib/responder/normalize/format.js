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
 * Implements simple version of `res.format()` as provided by expressjs.
 *
 * @name ServerResponse#format
 * @this HitchyRequestContext
 * @param {object<string,function>} formatHandlers maps type names into callbacks generating either kind of response
 * @returns {ServerResponse} fluent interface
 * @private
 */
module.exports = function _responseFormat( formatHandlers ) {
	const { request, response } = this;
	const { accept } = request.headers;

	let match = /\b(?:application|text)\/json\b/.exec( accept );
	if ( match && typeof formatHandlers.json === "function" ) {
		response.setHeader( "Content-Type", "application/json" );
		formatHandlers.json();
		return response;
	}

	match = /\btext\/html\b/.exec( accept );
	if ( match && typeof formatHandlers.html === "function" ) {
		response.setHeader( "Content-Type", "text/html" );
		formatHandlers.html();
		return response;
	}

	match = /\btext\/plain\b/.exec( accept );
	if ( match && typeof formatHandlers.text === "function" ) {
		response.setHeader( "Content-Type", "text/plain" );
		formatHandlers.text();
		return response;
	}

	if ( typeof formatHandlers.default === "function" ) {
		response.setHeader( "Content-Type", "application/octet-stream" );
		formatHandlers.default();
	}

	return response;
};
