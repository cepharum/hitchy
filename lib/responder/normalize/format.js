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

const ExtensionToMime = {
	html: ["text/html"],
	xhtml: ["application/xhtml+xml"],
	json: [ "text/json", "application/json" ],
	text: ["text/plain"],
	xml: [ "text/xml", "application/xml" ],
	csv: ["text/csv"],
};

/**
 * Implements simple version of `res.format()` as provided by expressjs.
 *
 * @name ServerResponse#format
 * @this HitchyRequestContext
 * @param {object<string,function>} formatHandlers maps type names into callbacks generating either kind of response
 * @returns {ServerResponse} fluent interface
 */
module.exports = function _responseFormat( formatHandlers ) {
	if ( !formatHandlers || typeof formatHandlers !== "object" ) {
		throw new TypeError( "invalid set of format handlers" );
	}

	const { request, response } = this;
	const { accept } = request;

	const numAccepted = accept.length;
	const handlerNames = Object.keys( formatHandlers );
	const numNames = handlerNames.length;


	// qualify handler names (for they might use extension names instead of MIME)
	const qualified = {};

	for ( let i = 0; i < numNames; i++ ) {
		const handlerName = handlerNames[i];
		const mapping = ExtensionToMime[handlerName] || [handlerName];

		for ( let j = 0, l = mapping.length; j < l; j++ ) {
			qualified[mapping[j]] = handlerName;
		}
	}

	const qualifiedNames = Object.keys( qualified );


	// iterate over accepted MIME types looking for the first one supported by current set of handlers
	let found = null;

	for ( let i = 0; found == null && i < numAccepted; i++ ) {
		const accepted = accept[i];

		if ( accepted === "*/*" || accepted === "*" ) {
			const candidates = [ "text/html", "text/json" ].concat( qualifiedNames );
			const numCandidates = candidates.length;

			for ( let j = 0; j < numCandidates; j++ ) {
				const name = candidates[j];

				if ( name !== "default" && qualified[name] ) {
					found = name;
					break;
				}
			}

			break;
		}

		if ( accepted.startsWith( "*/" ) || accepted.endsWith( "/*" ) ) {
			const [ aMajor, aMinor ] = accepted.split( "/" );

			for ( let j = 0; j < numNames; j++ ) {
				const qName = qualifiedNames[j];
				const [ nMajor, nMinor ] = qName.split( "/" );

				if ( ( aMajor === "*" || aMajor === nMajor ) && ( aMinor === "*" || aMinor === nMinor ) ) {
					found = qName;
					break;
				}
			}
		} else if ( accepted !== "default" && qualified[accepted] ) {
			found = accepted;
		}
	}

	// create response using found or default handler if available
	if ( found != null ) {
		response.setHeader( "Content-Type", found );
		formatHandlers[qualified[found]].call( this, request, response );
		return response;
	}

	if ( typeof formatHandlers.default === "function" ) {
		formatHandlers.default.call( this, request, response );
		return response;
	}

	response.writeHead( 406 );
	response.end();

	return response;
};
