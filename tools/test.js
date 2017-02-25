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
 * Implements tools for common tasks in developing tests.
 */

"use strict";

const Http = require( "http" );
const Url  = require( "url" );


let recentlyStartedServers = [];

module.exports = {

	/**
	 * Starts hitchy service using node's http server.
	 *
	 * @param {HitchyNodeInstance} hitchy
	 * @returns {Promise<Server>}
	 */
	startServer: function( hitchy ) {
		switch ( process.env.HITCHY_MODE || "node" ) {
			case "node" :
				return new Promise( function( resolve, reject ) {
					let server = Http.createServer( hitchy );

					recentlyStartedServers.unshift( server );

					server.listen( function() {
						hitchy.onStarted.then( function() {
							resolve( server );
						}, reject );
					} );

					server.on( "error", reject );
					server.on( "close", () => { recentlyStartedServers.shift(); } );
				} );

			default :
				throw new Error( "this injection mode of hitchy is not fully supported yet" );
		}
	},

	get: request.bind( undefined, "GET" ),
	post: request.bind( undefined, "POST" ),
	put: request.bind( undefined, "PUT" ),
	delete: request.bind( undefined, "DELETE" ),
};

function request( method, options, data ) {
	return new Promise( function( resolve, reject ) {
		let server = recentlyStartedServers[0];
		if ( !server ) {
			throw new Error( "server not started yet" );
		}

		if ( typeof options === "string" ) {
			options = Url.parse( options );
			options.method = method;
		}

		if ( !options.hostname ) {
			options.hostname = "127.0.0.1";
			options.port = server.address().port;
		}

		let request = Http.request( options, function( res ) {
			resolve( res );
		} );

		request.on( "error", reject );
		request.end( data );
	} );
}
