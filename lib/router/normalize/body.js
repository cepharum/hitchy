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

const mimePtn = /^([^,;]*)/;

/**
 * @typedef {object<string,*>} ParsedBody
 */

/**
 * @typedef {(Buffer|ParsedBody)} RawOrParsedBody
 */

/**
 * @typedef {function(Buffer):ParsedBody} BodyParser
 */

/**
 * Generates function extracting body of current request.
 *
 * @this HitchyRequestContext
 * @returns {function(parse:(boolean|BodyParser)=):Promise<RawOrParsedBody>} function promising request body
 * @private
 */
module.exports = function _requestBody() {
	const { api } = this;
	const { runtime: { config } } = api;

	const request = this.request;
	const urlQueryParser = api.utility.parser.query;
	const headers = request.headers;

	let rawBodyPromise = null;
	const parsedBodyPromises = new Map();

	return fetchBody;

	/**
	 * Extracts body data of current request.
	 *
	 * @name IncomingMessage#fetchBody
	 * @param {boolean|BodyParser} parse enables/disables body parsing, provide callback for actual parsing
	 * @returns {Promise<RawOrParsedBody>} promises extracted request body
	 */
	function fetchBody( parse = null ) {
		if ( !rawBodyPromise ) {
			rawBodyPromise = new Promise( ( resolve, reject ) => {
				if ( request.body ) {
					// support existing output of bodyParser e.g. when injected into ExpressJS
					resolve( request.body );
				} else {
					const chunks = [];

					request.on( "data", chunk => chunks.push( chunk ) );
					request.on( "end", () => resolve( Buffer.concat( chunks ) ) );

					request.on( "error", reject );
					request.on( "aborted", reject );
				}
			} );
		}

		const _parse = parse == null ? config.bodyParser == null ? true : config.bodyParser : parse;

		if ( _parse === false ) {
			return rawBodyPromise;
		}

		if ( !parsedBodyPromises.has( _parse ) ) {
			parsedBodyPromises.set( _parse, rawBodyPromise
				.then( body => {
					if ( !Buffer.isBuffer( body ) ) {
						return body;
					}

					return processBody( body, _parse );
				} ) );
		}

		return parsedBodyPromises.get( _parse );
	}

	/**
	 * Optionally parses provided body content according to selected parser
	 * configuration value.
	 *
	 * @param {Buffer} body body to be parsed
	 * @param {boolean|BodyParser} parse enables/disables parsing or provides actual parser as callback
	 * @return {RawOrParsedBody} raw or parsed content of provided body
	 */
	function processBody( body, parse ) {
		if ( parse ) {
			if ( typeof parse === "function" ) {
				return parse( body );
			}

			const mime = mimePtn.exec( headers["content-type"] ) || [];

			switch ( mime[1].trim().toLowerCase() ) {
				case "application/json" :
				case "text/json" :
					return JSON.parse( body.toString( "utf8" ) );

				case "application/x-www-form-urlencoded" :
					return urlQueryParser( body.toString( "utf8" ) );

				default :
					return body;
			}
		}

		return body;
	}
};
