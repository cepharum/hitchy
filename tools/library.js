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

const Path = require( "path" );

const Promises = require( "./promise" );

const LibraryComponents = [ "utility", "bootstrap", "responder", "router" ];

module.exports = {

	/** @borrows _toolLibraryCreateAPI as createAPI */
	createAPI: _toolLibraryCreateAPI,

	/** @borrows _toolLibraryLoad as load */
	load: _toolLibraryLoad,

	/** @borrows _toolLibraryCMP as cmp */
	cmp: _toolLibraryCMP,

	/** @borrows _toolLibraryCMFP as cmfp */
	cmfp: _toolLibraryCMFP,

};


/**
 * Creates initial skeleton API instance.
 *
 * @param {object} options global options customizing Hitchy
 * @returns {HitchyLibraryAPI} library exposed as Hitchy's  API
 * @private
 */
function _toolLibraryCreateAPI( options = {} ) {
	const _api = {
		config: {
			hitchy: {},
		},
		runtime: {
			models: {},
			controllers: {},
			services: {},
			policies: {}
		},
		plugins: {},
		loader: _nop,
		data: {},
		folder( name ) {
			return Path.resolve( options.projectFolder, String( name || "" ).replace( /^@(hitchy|project)/, ( _, key ) => options[`${key}Folder`] ) );
		},
	};

	// support singular names of either group of components as well
	_api.runtime.model = _api.runtime.models;
	_api.runtime.controller = _api.runtime.controllers;
	_api.runtime.service = _api.runtime.services;
	_api.runtime.policy = _api.runtime.policies;

	// inject tools for supporting common-module (function) pattern
	_api.cmp = _toolLibraryCMP.bind( _api, _api, options );
	_api.cmfp = _toolLibraryCMFP.bind( _api, _api, options );

	return _api;
}

/**
 * Doesn't do anything.
 *
 * @returns {void}
 */
function _nop() {} // eslint-disable-line no-empty-function

/**
 * Loads library contained in given folder.
 *
 * @param {HitchyAPI} _api reference on Hitchy API to be used by loaded components of library
 * @param {string} libFolder path name of folder containing Hitchy library
 * @param {HitchyOptions=} options options for customizing hitchy
 * @returns {Promise.<HitchyAPI>} promises provided reference on Hitchy API qualified with loaded library
 */
function _toolLibraryLoad( _api, libFolder, options = {} ) {
	_api.loader = _toolLibraryCommonModulePatternLoader;

	return Promises.each( LibraryComponents, moduleName => {
		return Promise.resolve( require( Path.join( libFolder, moduleName ) ).call( _api, options ) )
			.then( moduleApi => {
				Object.defineProperty( _api, moduleName, {
					value: Object.seal( moduleApi ),
					enumerable: true,
				} );

				// additionally inject shortcut aliases per part of library
				switch ( moduleName ) {
					case "utility" :
						// provide shortcut for accessing logger factory
						Object.defineProperties( _api, {
							/**
							 * @name HitchyLibraryAPI.log
							 * @property {function(prefix:string):function(message:string)}
							 * @readonly
							 */
							log: {
								value: _api.utility.logger.get,
								enumerable: true,
							},
						} );
						break;

					case "router" :
						// provide shortcut for accessing router client
						Object.defineProperties( _api, {
							/**
							 * @name HitchyLibraryAPI.Client
							 * @property {class<HitchyClientRequest>}
							 * @readonly
							 */
							Client: {
								value: _api.router.client,
								enumerable: true,
							},
						} );
						break;
				}
			} );
	} )
		.then( () => _api );


	/**
	 * Loads component of current project obeying support for common module
	 * pattern (CMP).
	 *
	 * @param {string} pathname name of module to load, considered relative to
	 *        project folder, but may be absolute pathname, too
	 * @param {*[]} moduleArguments arguments to provide on support for CMP
	 * @returns {Promise<*>} promises API of loaded component
	 * @private
	 */
	function _toolLibraryCommonModulePatternLoader( pathname, moduleArguments = [] ) {
		return new Promise( function( resolve ) {
			let moduleApi = require( Path.resolve( options.projectFolder, pathname ) );

			if ( typeof moduleApi === "function" ) {
				moduleApi = moduleApi.apply( _api, [options].concat( moduleArguments ) );
			}

			resolve( moduleApi );
		} );
	}
}

/**
 * Conveniently loads module supporting _common module pattern_ paradigm of
 * Hitchy.
 *
 * This paradigm invokes function returned by loaded module passing Hitchy's API
 * and globally provided options and waiting for any promise e.g. returned by
 * that function to provide the API of selected module eventually.
 *
 * @param {HitchyAPI} _api compiled API exposing library and runtime configuration
 * @param {HitchyOptions} options global options customizing Hitchy
 * @param {string} modulePathname pathname of module to load (is forwarded to `require()`)
 * @param {Array} moduleArguments list of arguments passed into module additionally
 * @returns {Promise<object>} promises API of loaded module
 * @private
 */
function _toolLibraryCMP( _api, options = {}, modulePathname, moduleArguments = [] ) {
	let module = require( modulePathname );
	if ( typeof module === "function" ) {
		module = module.call( _api, options, ...moduleArguments );
	}

	return module instanceof Promise ? module : Promise.resolve( module );
}

/**
 * Conveniently invokes function supporting _common module function pattern_
 * paradigm of Hitchy.
 *
 * This paradigm invokes function in context of Hitchy's API and always passes
 * globally provided options in first argument followed by any custom argument
 * provided here. It waits for any promise e.g. returned by that function to
 * provide the API of selected module eventually.
 *
 * @param {HitchyAPI} _api compiled API exposing library and runtime configuration
 * @param {HitchyOptions} options global options customizing Hitchy
 * @param {function} fn function to invoke
 * @param {Array} fnArguments additional arguments passed on invoking provided function
 * @returns {*} result of invoked function
 * @private
 */
function _toolLibraryCMFP( _api, options = {}, fn, fnArguments = [] ) {
	return fn.call( _api, options, ...fnArguments );
}
