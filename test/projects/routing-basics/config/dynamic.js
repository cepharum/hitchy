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
 * @author cepharum
 */

"use strict";

module.exports = function( options ) {
	switch ( options.scenario ) {
		case "empty" :
			return {};

		case "simple-terminal" :
			return {
				routes: {
					"/instant": "terminal.mirror",
					"/partial/deferred": "terminal.deferredMirror",
					"/full/deferred": "terminal.fullyDeferredMirror",
				},
			};

		case "list-of-policies" :
			return {
				policies: {
					"/": [
						"listOfPolicies.one",
						"listOfPolicies.two",
						"listOfPolicies.three",
						"listOfPolicies.four",
					]
				},
				routes: {
					"/listOfPolicies": "listOfPolicies.check",
				},
			};

		case "early-policies-sorting-generic-first" :
			return {
				policies: {
					"/": [
						"listOfPolicies.one",
						"listOfPolicies.two",
					],
					"/prefix": [
						"listOfPolicies.three",
						"listOfPolicies.four",
					],
					"/prefix/check": [
						"listOfPolicies.three",
						"listOfPolicies.four",
					],
				},
				routes: {
					"/prefix/check": "sortingOfPolicies.check",
				},
			};

		case "early-policies-sorting-specific-first" :
			return {
				policies: {
					"/prefix/check": [
						"listOfPolicies.three",
						"listOfPolicies.four",
					],
					"/prefix": [
						"listOfPolicies.three",
						"listOfPolicies.four",
					],
					"/": [
						"listOfPolicies.one",
						"listOfPolicies.two",
					],
				},
				routes: {
					"/prefix/check": "sortingOfPolicies.check",
				},
			};

		case "late-policies-sorting-generic-first" :
			return {
				policies: {
					after: {
						"/": [
							"listOfPolicies.plusOne",
							"listOfPolicies.double",
						],
						"/prefix": [
							"listOfPolicies.plusTwo",
							"listOfPolicies.triple",
						],
						"/prefix/check": [
							"listOfPolicies.plusThree",
							"listOfPolicies.quadruple",
						],
					},
				},
				routes: {
					"/prefix/check": "sortingOfPolicies.checkLate",
				},
			};

		case "late-policies-sorting-specific-first" :
			return {
				policies: {
					after: {
						"/prefix/check": [
							"listOfPolicies.plusThree",
							"listOfPolicies.quadruple",
						],
						"/prefix": [
							"listOfPolicies.plusTwo",
							"listOfPolicies.triple",
						],
						"/": [
							"listOfPolicies.plusOne",
							"listOfPolicies.double",
						],
					},
				},
				routes: {
					"/prefix/check": "sortingOfPolicies.checkLate",
				},
			};

		case "blueprint" :
			return {
				routes: {
					before: {
						"GET /blueprint/catched": "terminal.mirror",
					},
					after: {
						"/blueprint/missed": "terminal.mirror",
					}
				},
			};

		case "auto-limit-response" :
			return {
				routes: {
					"ALL /limit/json": "AutoLimitResponse::json",
					"ALL /limit/send": "AutoLimitResponse::send",
					"ALL /limit/write": "AutoLimitResponse::write",
					"ALL /limit/end": "AutoLimitResponse::end",
					"ALL /limit/setHeader": "AutoLimitResponse::setHeader",
					"ALL /limit/writeHead": "AutoLimitResponse::writeHead",
					"ALL /limit/singleSet": "AutoLimitResponse::singleSet",
					"ALL /limit/multiSet": "AutoLimitResponse::multiSet",
					"ALL /limit/format": "AutoLimitResponse::format",
				},
			};

		default :
			return {
				policies: {
					"ALL /": "filter.inject",
					"GET /": "filter.early",
				},
				routes: {
					"/": "terminal.mirror",
				},
			};
	}
};
