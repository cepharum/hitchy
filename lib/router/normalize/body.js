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

const Debug = require( "debug" )( "debug" );

const mimePtn = /^([^,;]*)/;

/**
 * Reads request body and optionally extracts contained data structure.
 *
 * @this HitchyRequestContext
 * @returns {Promise<object<string,*>>}
 * @private
 */
module.exports = function _requestBody() {
	let request = this.request,
	    url     = this.api.utility.parser.url,
		headers = request.headers,
		length  = headers["content-length"];

	return new Promise( function( resolve, reject ) {
		if ( length > 1024 * 1024 ) {
			// Impose limit on processing body here to prevent this code from
			// wasting memory. Larger request bodies should be processed in a
			// stream.
			Debug( "parsing oversize request body skipped" );

			return resolve( {} );
		}

		let buffers = [];

		request.on( "data", chunk => buffers.push( chunk ) );
		request.on( "end", () => resolve( _extract( Buffer.concat( buffers ) ) ) );

		request.on( "error", error => reject( error ) );
		request.on( "aborted", error => reject( error ) );
	} );


	function _extract( body ) {
		let mime = mimePtn.exec( headers["content-type"] ) || [];

		switch ( mime[1].trim().toLowerCase() ) {
			case "application/json" :
			case "text/json" :
				return JSON.parse( body.toString( "utf8" ) );

			case "application/x-www-form-urlencoded" :
				return url( body.toString( "utf8" ) );

			default :
				return body;
		}
	}

};
