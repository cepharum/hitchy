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
const _ = require( "lodash" );


/**
 * Provides implementation of bootstrap stage gathering API elements to be
 * exposed.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(modules:HitchyComponentHandle[]):Promise.<HitchyComponentHandle[]>} function for collecting components per module
 */
module.exports = function( options ) {
	const that = this;
	const { utility: { promise, file, case: { kebabToPascal } } } = that;

	return _bootstrapExpose;


	/**
	 * Collects components exposed by either discovered module.
	 *
	 * @param {HitchyComponentHandle[]} componentHandles descriptions of discovered modules
	 * @returns {Promise<HitchyComponentHandle[]>} promises components of discovered modules collected
	 * @private
	 */
	function _bootstrapExpose( componentHandles ) {
		return promise.each( componentHandles, handle => {
			const fn = handle.api.onExposing;
			if ( typeof fn === "function" ) {
				return fn.call( that, options, handle );
			}

			// this module doesn't provide onExposing() -> skip
			return undefined;
		} )
			.then( _mergeComponentElements )
			.then( _mergeApplicationElements )
			.then( () => promise.each( componentHandles, handle => {
				const fn = handle.api.onExposed;
				if ( typeof fn === "function" ) {
					return fn.call( that, options, handle );
				}

				// this module doesn't provide onExposed() -> skip
				return undefined;
			} ) )
			.then( () => componentHandles );
	}

	/**
	 * Loads components provided by every discovered module and exposes them in
	 * runtime section of Hitchy's API.
	 *
	 * @param {HitchyComponentHandle[]} componentHandles descriptions of discovered modules
	 * @returns {Promise<HitchyComponentHandle[]>} promises components of modules exposed
	 * @private
	 */
	function _mergeComponentElements( componentHandles ) {
		return promise.each( componentHandles, handle => _mergeElementsInFolder( Path.resolve( handle.folder, "api" ) ) );
	}

	/**
	 * Loads components found in current application and exposes them in runtime
	 * section of Hitchy's API.
	 *
	 * @returns {Promise} promises components of application exposed
	 * @private
	 */
	function _mergeApplicationElements() {
		return _mergeElementsInFolder( Path.resolve( options.projectFolder, "api" ) );
	}

	/**
	 * Loads components found in particular folder of a discovered module or
	 * current application and exposes them in runtime section of Hitchy's API.
	 *
	 * @param {string} folder pathname of folder containing components of a module or current application
	 * @returns {Promise} promises components of application exposed
	 * @private
	 */
	function _mergeElementsInFolder( folder ) {
		return loadComponents( folder, "model", "models" )
			.then( () => loadComponents( folder, "models", "models" ) )
			.then( () => loadComponents( folder, "controller", "controllers" ) )
			.then( () => loadComponents( folder, "controllers", "controllers" ) )
			.then( () => loadComponents( folder, "policy", "policies" ) )
			.then( () => loadComponents( folder, "policies", "policies" ) )
			.then( () => loadComponents( folder, "service", "services" ) )
			.then( () => loadComponents( folder, "services", "services" ) );

		/**
		 * Loads components in a particular folder exposing either component's
		 * API in a selected slot of runtime section of Hitchy's API.
		 *
		 * @param {string} pathname pathname of base folder containing subfolders per kind of components
		 * @param {string} subFolder subfolder in base folder to be processed this time
		 * @param {string} slotName name of collection in runtime section of Hitchy's API for exposing found components
		 * @returns {Promise} promises having loaded and exposed all components in selected subfolder
		 * @private
		 */
		function loadComponents( pathname, subFolder, slotName ) {
			const slot = that.runtime[slotName];

			// FIXME use FileEssentials here
			// FIXME add support for recursively discovering modules in subordinated folders
			return file.list( Path.resolve( pathname, subFolder ) )
				.then( files => promise.each( files, _file => {
					const baseName = kebabToPascal( Path.basename( _file ).replace( /\.js$/, "" ) );
					const moduleApi = require( _file );

					if ( typeof moduleApi === "function" ) {
						return Promise.resolve( moduleApi.call( that, options, slot[baseName] || {} ) )
							.then( componentApi => {
								slot[baseName] = _.extend( slot[baseName] || {}, componentApi );
							} );
					}

					slot[baseName] = _.extend( slot[baseName] || {}, moduleApi );

					return undefined;
				} ) );
		}
	}
};
