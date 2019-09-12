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
 * Extracts properly sorted list of accepted types of response content from
 * current request header.
 *
 * @this HitchyRequestContext
 * @returns {string[]} sorted list of accepted response types
 * @private
 */
module.exports = function _requestAccept() {
	const { accept } = this.request.headers;
	if ( accept == null ) {
		return [];
	}

	const ptnRange = /^\s*([^/\s]+\/[^;\s]+)(?:\s*;\s*q\s*=\s*(\d(?:\.\d+)?))?/i;

	const ranges = String( accept ).trim().split( /,/ );
	const numRanges = ranges.length;
	const collected = [];

	for ( let ri = 0; ri < numRanges; ri++ ) {
		const info = ptnRange.exec( ranges[ri].trim() );

		if ( info ) {
			collected.push( {
				range: info[1],
				quality: info[2] ? parseFloat( info[2] ) : 1,
				index: ri,
			} );
		}
	}

	collected.sort( ( l, r ) => {
		return l.quality === r.quality ? l.index - r.index : r.quality - l.quality;
	} );

	const numCollected = collected.length;
	const result = new Array( numCollected );

	for ( let ci = 0; ci < numCollected; ci++ ) {
		result[ci] = collected[ci].range.toLowerCase();
	}

	return result;
};
