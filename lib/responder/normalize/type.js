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
 * Implements simple version of `res.type()` as provided by expressjs.
 *
 * @name ServerResponse#type
 * @this HitchyRequestContext
 * @param {string} mime MIME type of content to be advertised in response header
 * @returns {ServerResponse} fluent interface
 * @private
 */
module.exports = function _responseType( mime ) {
	const response = this.response;

	switch ( mime ) {
		case "json" :
		case ".json" :
		case "text/json" :
		case "application/json" :
			response.setHeader( "content-type", "application/json" );
			break;

		case "html" :
		case ".html" :
		case "text/html" :
			response.setHeader( "content-type", "text/html" );
			break;

		case "xml" :
		case ".xml" :
		case "text/xml" :
		case "application/xml" :
			response.setHeader( "content-type", "application/xml" );
			break;

		case "text" :
		case "txt" :
		case ".txt" :
		case "text/plain" :
			response.setHeader( "content-type", "text/plain" );
			break;

		case "png" :
		case ".png" :
		case "image/png" :
			response.setHeader( "content-type", "image/png" );
			break;

		case "jpg" :
		case "jpeg" :
		case ".jpg" :
		case ".jpeg" :
		case "image/jpeg" :
			response.setHeader( "content-type", "image/jpeg" );
			break;

		case "gif" :
		case ".gif" :
		case "image/gif" :
			response.setHeader( "content-type", "image/gif" );
			break;
	}

	return response;
};
