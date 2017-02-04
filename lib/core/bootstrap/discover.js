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
 * Provides implementation for first stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options
 * @returns {Function}
 */
module.exports = function( options ) {
	let api = this;

	return bootstrapDiscover;


	function bootstrapDiscover() {
		if ( !options.rootFolder ) {
			throw new Error( "missing information on folder to use" );
		}

		return Promise.all( [
			discoverExtensions.call( api, options ),
			discoverCore.call( api, options ),
		] )
			.then( function( [extensions, core] ) {
				return _sortHitchyExtensions( ( extensions || [] ).concat( core || [] ) );
			} )
			.then( function( components ) {
				return _loadHitchyExtensions( components );
			} );
	}


	/**
	 * Sorts extensions according to dependencies described in either extension.
	 *
	 * @this HitchyAPI
	 * @param {HitchyExtensionHandle[]} moduleHandles
	 * @return {HitchyExtensionHandle[]}
	 */
	function _sortHitchyExtensions( moduleHandles ) {
		let weights = {};

		moduleHandles
			.forEach( function( handle ) {
				if ( handle && handle.data && handle.data.hicky ) {
					let dependencies = handle.data.hicky.dependencies || [];

					if ( !Array.isArray( dependencies ) ) {
						dependencies = [dependencies];
					}

					dependencies
						.forEach( function( dep ) {
							weights[dep]++;
						} );
				}
			} );

		// sort handles from most weight to least
		moduleHandles = moduleHandles
			.sort( function( left, right ) {
				return ( weights[right.name] || 0 ) - ( weights[left.name] || 0 );
			} );

		return moduleHandles;
	}

	/**
	 * Loads all extensions in order of provided extension handles.
	 *
	 * @this HitchyAPI
	 * @param {HitchyExtensionHandle[]} moduleHandles
	 * @return {Promise<HitchyComponent[]>}
	 */
	function _loadHitchyExtensions( moduleHandles ) {
		let api   = this,
		    queue = moduleHandles.slice( 0 );

		return new Promise( function( resolve, reject ) {
			loadNext();

			function loadNext() {
				let handle = queue.shift();
				if ( handle ) {
					Promise.resolve( require( handle.folder ) )
				}
			}
		} );
	}
};
