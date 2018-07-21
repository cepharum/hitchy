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

/**
 * Implements simple version of `res.redirect()` as provided by expressjs.
 *
 * @name ServerResponse#redirect
 * @this HitchyRequestContext
 * @param {boolean,int} code HTTP status code to be sent, true to redirect permanently
 * @param {string} url URL to redirect to
 * @returns {ServerResponse}
 * @private
 */
module.exports = function _responseRedirect( code = 302, url = null ) {
	let response = this.response;

	if ( url == null && typeof code === "string" ) {
		url = code;
		code = 302;
	}

	if ( url == null || typeof url !== "string" ) {
		throw new TypeError( "invalid URL for redirecting to" );
	}

	let status = parseInt( code );
	if ( isNaN( status ) ) {
		status = code ? 301 : 302;
	}

	response.writeHead( code, {
		Location: url,
	} );
	response.end();

	return response;
};