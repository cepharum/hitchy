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
 * @returns {HitchyUtilityParseAPI}
 */
module.exports = function( options ) {
	//const api = this;

	const pairPtn = /([^#&=]+)(?:=([^#&]*))?(?:$|&)/g;
	const bracketPtn = /^([^\[]+)(?:\[(.*)])?/;

	return /** @lends {HitchyUtilityParseAPI} */ {
		url: _utilityParseUrl,
	};


	/**
	 * Parses provided string for containing URL-encoded data structure
	 *
	 * @param {string} serialized
	 * @returns object parse
	 */
	function _utilityParseUrl( serialized ) {
		let parsed = {}, match;

		if ( typeof serialized === "string" ) {
			while ( match = pairPtn.exec( serialized ) ) {
				let name  = decodeURIComponent( match[1] );
				let value = decodeURIComponent( match[2] );

				if ( value === undefined ) {
					value = true;
				}

				let key = bracketPtn.exec( name );
				if ( key ) {
					name = key[1];
					key  = key[2];

					if ( key !== undefined ) {
						if ( key === "" || parseInt( key ) > -1 ) {
							if ( typeof parsed[name] !== "object" ) {
								parsed[name] = [];
							}

							if ( key === "" ) {
								parsed[name].push( value );
							} else {
								parsed[name][parseInt( key )] = value;
							}
						} else {
							if ( typeof parsed[name] !== "object" ) {
								parsed[name] = {};
							}

							parsed[name][key] = value;
						}
					} else {
						parsed[name] = value;
					}
				}
			}
		}

		return parsed;
	}
};
