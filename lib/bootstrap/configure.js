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

const File = require( "fs" );
const Path = require( "path" );

const PromiseUtils = require( "promise-essentials" );

const NormalizeRoutingDefinition = require( "../router/normalize/definition" );

/**
 * Provides implementation for second stage of bootstrapping hitchy instance.
 *
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(HitchyPluginHandle[]):Promise<HitchyPluginHandle[]>} function configuring discovered plugins
 */
module.exports = function( options ) {
	const that = this;
	const logInfo = that.log( "hitchy:bootstrap:info" );

	return _bootstrapConfigure;

	/**
	 * Asks every discovered plugin for its configuration.
	 *
	 * @param {HitchyPluginHandle[]} plugins descriptions of discovered plugins
	 * @returns {Promise<HitchyPluginHandle[]>} promises having asked all plugins for their configuration
	 * @private
	 */
	function _bootstrapConfigure( plugins ) {
		return PromiseUtils.each( plugins, plugin => {
			return _readConfigurationFiles( Path.resolve( plugin.folder, "config" ), true )
				.then( config => {
					plugin.config = plugin.api.$config = config;
				} );
		} )
			.then( () => {
				return _readConfigurationFiles( Path.resolve( options.projectFolder, "config" ), false )
					.then( config => {
						Object.defineProperties( that.config, {
							/**
							 * Silently injects application's individual configuration
							 * into resulting global configuration object for use
							 * by other stages of bootstrap like exposure.
							 *
							 * @private
							 */
							$appConfig: { value: config },
						} );
					} );
			} )
			.then( () => PromiseUtils.each( plugins, pluginHandle => {
				const fn = pluginHandle.api.configure;
				if ( typeof fn === "function" ) {
					return fn.call( that, options, pluginHandle );
				}

				// this plugin doesn't provide configure() -> skip
				return undefined;
			} ) );
	}


	/**
	 * Reads all files with extension ".js" found in provided folder and injects
	 * their exported API into api.config.
	 *
	 * If any configuration file is exporting function instead of object this
	 * function is invoked according to the pattern used to load plugins etc.
	 * in hitchy expecting function to return object to be injected actually. On
	 * returning Promise injection is delayed until promise is resolved.
	 *
	 * @param {string} configFolder path name of folder containing files to be read
	 * @param {boolean} isPlugin true if provided folder is part of some discovered plugin
	 * @returns {Promise<object>} promises configuration read and merged from all files in selected folder
	 * @private
	 */
	function _readConfigurationFiles( configFolder, isPlugin ) {
		const localConfig = {};

		return new Promise( ( resolve, reject ) => {
			// shallowly search for configuration files in related folder
			File.readdir( configFolder, ( error, entries ) => {
				if ( error ) {
					if ( error.code === "ENOENT" ) {
						// there is no configuration folder -> skip
						if ( !isPlugin ) {
							logInfo( "missing configuration folder, thus using empty configuration" );
						}

						resolve( localConfig );
					} else {
						reject( error );
					}

					return;
				}


				// use simple tests to detect actual configuration files
				// (e.g. consider names of sub folders don't end with .js)
				const numEntries = entries.length;
				const filtered = new Array( numEntries );
				let write = 0;

				for ( let read = 0; read < numEntries; read++ ) {
					const name = entries[read];

					if ( name && name[0] !== "." && name.slice( -3 ) === ".js" ) {
						filtered[write++] = name.slice( 0, -3 );
					}
				}

				filtered.splice( write );

				// sort all configuration files by name
				filtered.sort( ( l, r ) => l.localeCompare( r ) );

				// make sure any config/local.js is processed last
				const localIndex = filtered.indexOf( "local" );
				if ( localIndex > -1 ) {
					filtered.splice( localIndex, 1 );
					filtered.push( "local" );
				}


				PromiseUtils.each( filtered, name => {
					return that.loader( Path.resolve( configFolder, name ) )
						.then( config => {
							that.utility.object.merge( localConfig, config || {}, strategySelector );
						} );
				} )
					.then( () => {
						[ "policies", "routes" ].forEach( section => {
							if ( localConfig.hasOwnProperty( section ) ) {
								if ( isPlugin ) {
									localConfig[section] = NormalizeRoutingDefinition.Plugin( localConfig[section] );
								} else {
									localConfig[section] = NormalizeRoutingDefinition.Custom( localConfig[section] );
								}
							}
						} );

						that.utility.object.merge( that.config, localConfig, strategySelector );

						resolve( localConfig );
					} )
					.catch( reject );
			} );
		} );

		/**
		 * Selects strategy for deeply merging configuration objects.
		 *
		 * @param {string[]} segments breadcrumb of property names leading to current property to be merged
		 * @param {string} strategy preferred strategy
		 * @returns {string} strategy to use actually
		 */
		function strategySelector( segments, strategy ) {
			const numSegments = segments.length;
			if ( numSegments < 2 ) {
				return strategy;
			}

			const policiesIndex = segments.indexOf( "policies" );
			let index = Math.max( policiesIndex, segments.indexOf( "routes", Math.max( policiesIndex, 0 ) ) );

			if ( index < 0 ) {
				return strategy;
			}

			const isPolicy = index === policiesIndex;

			switch ( segments[++index] ) {
				case "early" :
				case "before" :
				case "after" :
				case "late" :
					index++;
			}

			return isPolicy && index === numSegments - 1 ? "concat" : "merge";
		}
	}
};
