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
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function(this:HitchyRequestContext)}
 */
module.exports = function( options ) {

	let api = this;

	/**
	 * Normalizes response to support some assumed API.
	 *
	 * @this HitchyRequestContext
	 */
	return function responderNormalize() {
		this.response = new Proxy( this.response, {
			get: _responseGet.bind( undefined, this )
		} );
	};

	function _responseGet( context, original, requestedProperty, proxied ) {
		let handler = proxied[requestedProperty];
		if ( handler ) {
			return handler;
		}

		handler = original[requestedProperty];
		if ( handler ) {
			return handler;
		}

		switch ( requestedProperty ) {
			case "status" :
				return _responseStatus.bind( context, original, proxied );
			case "format" :
				return _responseFormat.bind( context, original, proxied );
			default :
				console.error( "injector missing response property: res." + requestedProperty );
		}
	}

	/**
	 * Implements simple version of `res.status()` as provided by expressjs.
	 *
	 * @this HitchyRequestContext
	 * @param {ServerResponse} original original response
	 * @param {ServerResponse} proxied proxied response
	 * @param {number} code
	 * @returns {ServerResponse}
	 * @private
	 */
	function _responseStatus( original, proxied, code ) {
		original.statusCode = code;

		return proxied;
	}

	/**
	 * Implements simple version of `res.format()` as provided by expressjs.
	 *
	 * @this HitchyRequestContext
	 * @param {ServerResponse} original original response
	 * @param {ServerResponse} proxied proxied response
	 * @param {object<string,function>} formatHandlers
	 * @returns {ServerResponse}
	 * @private
	 */
	function _responseFormat( original, proxied, formatHandlers ) {
		let accept = this.request.headers.accept,
		    match;

		match = /\b(?:application|text)\/json\b/;
		if ( match && typeof formatHandlers.json === "function" ) {
			formatHandlers.json();
			return proxied;
		}

		match = /\btext\/html\b/;
		if ( match && typeof formatHandlers.html === "function" ) {
			formatHandlers.html();
			return proxied;
		}

		match = /\btext\/plain\b/;
		if ( match && typeof formatHandlers.text === "function" ) {
			formatHandlers.text();
			return proxied;
		}

		if ( typeof formatHandlers.default === "function" ) {
			formatHandlers.default();
		}

		return proxied;
	}
};
