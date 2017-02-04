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

	return responderNormalize;

	/**
	 * Normalizes response to support some assumed API.
	 *
	 * @this HitchyRequestContext
	 */
	function responderNormalize() {
		this.response = new Proxy( this.response, {
			get: _responseGet.bind( undefined, this )
		} );
	}

	function _responseGet( context, original, requestedProperty, proxied ) {
		let handler = proxied[requestedProperty];
		if ( handler !== undefined ) {
			return handler;
		}

		handler = original[requestedProperty];
		if ( handler !== undefined ) {
			return handler;
		}

		switch ( requestedProperty ) {
			case "status" :
				return require( "./normalize/status" ).bind( context, original, proxied );
			case "format" :
				return require( "./normalize/format" ).bind( context, original, proxied );

			default :
				console.error( "injector missing response property: res." + requestedProperty );
		}
	}
};
