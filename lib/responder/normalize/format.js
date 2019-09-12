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
	html: "text/html",
	json: "text/json",
	text: "text/plain",
	xml: "text/xml",
	csv: "text/csv",
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
	const { request, response } = this;
	const { accept } = request;

	const numAccepted = accept.length;
	const names = Object.keys( formatHandlers );
	const numNames = names.length;

	const qualifiedNames = new Array( numNames );

	for ( let i = 0; i < numNames; i++ ) {
		const name = names[i];

		qualifiedNames[i] = ( ExtensionToMime[name] || name ).toLowerCase();
	}

	let found = -1;

	for ( let i = 0; found < 0 && i < numAccepted; i++ ) {
		const accepted = accept[i];

		if ( accepted === "*/*" || accepted === "*" ) {
			let j = qualifiedNames.indexOf( "text/html" );
			if ( j > -1 ) {
				found = j;
				break;
			}

			j = qualifiedNames.indexOf( "text/json" );
			if ( j > -1 ) {
				found = j;
				break;
			}
		} else if ( accepted.startsWith( "*/" ) || accepted.endsWith( "/*" ) ) {
			const [ aMajor, aMinor ] = accepted.split( "/" );

			for ( let j = 0; j < numNames; j++ ) {
				const qName = qualifiedNames[j];
				const [ nMajor, nMinor ] = qName.split( "/" );

				if ( ( aMajor === "*" || aMajor === nMajor ) && ( aMinor === "*" || aMinor === nMinor ) ) {
					found = j;
					break;
				}
			}
		} else if ( accepted !== "default" ) {
			const j = qualifiedNames.indexOf( accepted );
			if ( j > -1 ) {
				found = j;
			}
		}
	}

	if ( found > -1 ) {
		response.setHeader( "Content-Type", qualifiedNames[found] );
		formatHandlers[names[found]].call( this, request, response );
		return response;
	}

	if ( typeof formatHandlers.default === "function" ) {
		response.setHeader( "Content-Type", "application/octet-stream" );
		formatHandlers.default.call( this, request, response );
		return response;
	}

	response.writeHead( 406 );
	response.end();

	return response;
};
