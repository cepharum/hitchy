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

const File = require( "fs" );
const Path = require( "path" );
const _ = require( "lodash" );

/**
 * Provides implementation of bootstrap stage gathering API elements to be
 * exposed.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {function(modules:HitchyComponentHandle[]):Promise.<HitchyComponentHandle[]>}
 */
module.exports = function( options ) {
	const api = this;

	const Log = api.log( "hitchy:bootstrap" );

	return _bootstrapExpose;


	function _bootstrapExpose( componentHandles ) {
		return api.utility.promise.each( componentHandles, function( handle ) {
			let fn = handle.api.onExposing;
			if ( typeof fn === "function" ) {
				return fn.call( api, options, handle );
			}

			// this module doesn't provide onExposing() -> skip
		} )
			.then( _mergeComponentElements )
			.then( _mergeApplicationElements )
			.then( function() {
				return api.utility.promise.each( componentHandles, function( handle ) {
					let fn = handle.api.onExposed;
					if ( typeof fn === "function" ) {
						return fn.call( api, options, handle );
					}

					// this module doesn't provide onExposed() -> skip
				} );
			} )
			.then( () => componentHandles );
	}

	function _mergeComponentElements( componentHandles ) {
		return api.utility.promise.each( componentHandles, function( handle ) {
			return _mergeElementsInFolder( Path.resolve( handle.folder, "api" ) );
		} );
	}

	function _mergeApplicationElements() {
		return _mergeElementsInFolder( Path.resolve( options.projectFolder, "api" ) );
	}

	function kebabToPascal( text ) {
		return text.toLowerCase().replace( /(^\s*|-)([a-z])/g, ( _, preceding, leading ) => {
			return ( preceding === "-" ? "" : preceding ) + leading.toUpperCase();
		} );
	}

	function _mergeElementsInFolder( folder ) {
		return _loadModules( folder, "model", "models" )
			.then( () => _loadModules( folder, "models", "models" ) )
			.then( () => _loadModules( folder, "controller", "controllers" ) )
			.then( () => _loadModules( folder, "controllers", "controllers" ) )
			.then( () => _loadModules( folder, "policy", "policies" ) )
			.then( () => _loadModules( folder, "policies", "policies" ) )
			.then( () => _loadModules( folder, "service", "services" ) )
			.then( () => _loadModules( folder, "services", "services" ) );

		function _loadModules( pathname, subFolder, slotName ) {
			const slot = api.runtime[slotName];

			// FIXME use FileEssentials here
			// FIXME add support for recursively discovering modules in subordinated folders
			return api.utility.file
				.list( Path.resolve( pathname, subFolder ) )
				.then( files => api.utility.promise.each( files, file => {
					const baseName  = kebabToPascal( Path.basename( file ).replace( /\.js$/, "" ) );
					const moduleApi = require( file );

					if ( typeof moduleApi === "function" ) {
						return Promise.resolve( moduleApi.call( api, options, slot[baseName] || {} ) )
							.then( moduleApi => {
								slot[baseName] = _.extend( slot[baseName] || {}, moduleApi );
							} );
					}

					slot[baseName] = _.extend( slot[baseName] || {}, moduleApi );
				} ) );
		}

		function _merge( dest, src ) {
			let names = Object.keys( src ),
				length, index, name;

			for ( length = names.length, index = 0; index < length; index++ ) {
				name = names[index];

				if ( name !== "__proto__" && src[name] ) {
					dest[name] = _.extend( dest[name] || {}, src[name] );
				}
			}
		}
	}
};
