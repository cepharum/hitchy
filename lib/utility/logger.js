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

const Logger = require( "debug" );


/**
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {HitchyUtilityLoggerAPI} partial API exposing logger
 */
module.exports = function( options ) {
	// const api = this;

	const loggers = {};

	return /** @lends {HitchyUtilityLoggerAPI} */ {
		get: _utilityLoggerGet,
		update: _utilityLoggerUpdate,
	};


	/**
	 * Fetches matching selected namespace.
	 *
	 * @param {string} namespace prefix for every log message
	 * @returns {function(string)} function prepared for actually generating log message
	 */
	function _utilityLoggerGet( namespace ) {
		if ( loggers.hasOwnProperty( namespace ) ) {
			return loggers[namespace];
		}

		const logger = Logger( namespace );

		loggers[namespace] = logger;

		if ( options.debug ) {
			logger.enabled = options.debug || Logger.enabled( namespace );
		}

		return logger;
	}

	/**
	 * Enables/disables any recently used logger due to changed options.
	 *
	 * @param {string} config new logger configuration (syntax complies with package `debug`)
	 * @returns {void}
	 * @private
	 */
	function _utilityLoggerUpdate( config ) {
		Logger.enable( config );

		Object.keys( loggers )
			.forEach( function( namespace ) {
				loggers[namespace].enabled = options.debug || Logger.enabled( namespace );
			} );
	}
};
