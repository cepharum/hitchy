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

/**
 * Normalizes provided set of route definitions.
 *
 * @param {HitchyRouteComponentTables|HitchyRouteDescriptorSet} rawDefinition
 * @returns {HitchyRouteComponentTablesNormalized}
 */
module.exports = function( rawDefinition ) {
	switch ( typeof rawDefinition ) {
		case "object" :
			if ( rawDefinition ) {
				if ( !Array.isArray( rawDefinition ) ) {
					let names = Object.keys( rawDefinition ).slice( 0, 3 ).sort();
					switch ( names.length ) {
						case 2 :
							if ( names[0] === "after" && names[1] === "before" ) {
								return rawDefinition;
							}

							return { before: rawDefinition };

						case 1 :
							switch ( names[0] ) {
								case "after" :
									return {
										before: {},
										after: rawDefinition.after
									};

								case "before" :
									return {
										before: rawDefinition.before,
										after: {}
									};
							}

							return { before: rawDefinition };
					}
				}
			}

			return { before: rawDefinition || {}, after: {} };
	}

	return { before: {}, after: {} };
};
