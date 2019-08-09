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
	// const api = this;

	const pairPtn = /([^#&=]+)(=([^#&]+)?)?(?:$|&)/g;
	const bracketPtn = /^([^\[]+)(?:\[(.*)])?/;

	return /** @lends {HitchyUtilityParseAPI} */ {
		query: _utilityParseQuery,
	};


	/**
	 * Parses provided string for containing URL-encoded query consisting of
	 * key-value-pairs.
	 *
	 * @param {string} serialized
	 * @returns object parsed query data
	 */
	function _utilityParseQuery( serialized ) {
		let parsed = {}, match;

		if ( typeof serialized === "string" ) {
			while ( match = pairPtn.exec( serialized ) ) {
				let name = decodeURIComponent( match[1] );
				const value = typeof match[3] === "undefined" ? match[2] ? null : true : decodeURIComponent( match[3] );

				let key = bracketPtn.exec( name );
				if ( key ) {
					name = key[1];
					key = key[2];

					if ( key !== undefined ) {
						if ( key === "" ) {
							let store = parsed[name];

							if ( !store || typeof store !== "object" ) {
								store = parsed[name] = [];
							}

							if ( key === "" ) {
								if ( Array.isArray( store ) ) {
									store.push( value );
								} else {
									store[Object.keys( store ).length] = value;
								}
							}
						} else {
							let store = parsed[name];

							if ( !store || typeof store !== "object" ) {
								store = parsed[name] = {};
							}

							const index = parseInt( key );
							if ( index > -1 ) {
								store[index] = value;
							} else {
								store[key] = value;
							}
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
