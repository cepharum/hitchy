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
const EventEmitter = require( "events" );

const PromiseUtils = require( "promise-essentials" );

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
	/**
	 * Implements Hitchy's API based on EventEmitter.
	 */
	class HitchyAPI extends EventEmitter {}

	const _api = new HitchyAPI();

	_api.config = {
		hitchy: {},
	};

	_api.runtime = {
		models: {},
		controllers: {},
		services: {},
		policies: {}
	};

	_api.plugins = {};
	_api.loader = _nop;
	_api.data = {};

	_api.folder = name => {
		return Path.resolve( options.projectFolder, String( name || "" )
			.replace( /^@(hitchy|project)(?=$|[/\\])/i, ( _, key ) => options[`${key}Folder`] ) );
	};

	_api.cmp = _toolLibraryCMP.bind( _api, _api, options );
	_api.cmfp = _toolLibraryCMFP.bind( _api, _api, options );

	// support singular names of either group of components as well
	Object.defineProperties( _api.runtime, {
		model: { value: _api.runtime.models },
		controller: { value: _api.runtime.controllers },
		policy: { value: _api.runtime.policies },
		service: { value: _api.runtime.services },
	} );

	_api.__onShutdown = null;

	_api.crash = cause => { _api.emit( "crash", cause ); };
	_api.shutdown = () => {
		if ( _api.__onShutdown == null ) {
			// prepare promise to be resolved after server and Hitchy have been shut down
			_api.__onShutdown = new Promise( ( resolve, reject ) => {
				_api.once( "close", resolve );
				_api.once( "error", reject );
			} );

			// emit shutdown event to notify injecting server to shut down
			_api.emit( "shutdown" );
		}

		return _api.__onShutdown;
	};

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

	return PromiseUtils.each( LibraryComponents, moduleName => {
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
		return new Promise( resolve => {
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
