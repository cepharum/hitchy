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

const _ = require( "lodash" );

/**
 * @this HitchyAPI
 * @param {HitchyOptions} options global options customizing Hitchy
 * @returns {function(requestContext:HitchyRequestContext):HitchyRequestContext} callback exposing Hitchy's API in provided request context
 */
module.exports = function( options ) { // eslint-disable-line no-unused-vars
	const that = this;

	return _utilityIntroduce;


	/**
	 * Injects runtime information into current request's context.
	 *
	 * @param {HitchyRequestContext} requestContext request context to extend
	 * @returns {HitchyRequestContext} provided request context with API injected
	 */
	function _utilityIntroduce( requestContext ) {
		const { runtime, config } = that;
		const { controllers, policies, services, models } = runtime;

		Object.defineProperties( requestContext, {
			startTime: { value: Date.now() },
			api: { value: that },
			config: { value: config },
			runtime: { value: runtime },
			controllers: { value: controllers },
			controller: { value: controllers },
			policies: { value: policies },
			policy: { value: policies },
			services: { value: services },
			service: { value: services },
			models: { value: models },
			model: { value: models },
		} );

		return requestContext;
	}
};
