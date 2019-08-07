/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

module.exports = function() {
	return {
		/**
		 * Converts provided string from kebab-case to PascalCase.
		 *
		 * @name HitchyUtilityAPI.case.kebabToPascal
		 * @param {string} input string assumed to be in kebab-case
		 * @returns {string} provided string converted to PascalCase
		 */
		kebabToPascal: input => String( input )
			.toLowerCase()
			.replace( /(?:^|-)([a-z])/g, ( _, letter ) => letter.toUpperCase() ),

		/**
		 * Converts provided string from kebab-case to camelCase.
		 *
		 * @name HitchyUtilityAPI.case.kebabToCamel
		 * @param {string} input string assumed to be in kebab-case
		 * @returns {string} provided string converted to camelCase
		 */
		kebabToCamel: input => String( input )
			.toLowerCase()
			.replace( /-([a-z])/g, ( _, letter ) => letter.toUpperCase() ),

		/**
		 * Converts provided string from PascalCase to kebab-case.
		 *
		 * @name HitchyUtilityAPI.case.pascalToKebab
		 * @param {string} input string assumed to be in PascalCase
		 * @returns {string} provided string converted to kebab-case
		 */
		pascalToKebab: input => String( input )
			.replace( /(A-Z)([A-Z]+)/g, ( _, first, trailing ) => first + trailing.toLowerCase() )
			.replace( /(?<!^)([A-Z])/g, ( _, letter ) => "-" + letter.toLowerCase() )
			.toLowerCase(),

		/**
		 * Converts provided string from camelCase to kebab-case.
		 *
		 * @name HitchyUtilityAPI.case.camelToKebab
		 * @param {string} input string assumed to be in camelCase
		 * @returns {string} provided string converted to kebab-case
		 */
		camelToKebab: input => String( input )
			.replace( /(A-Z)([A-Z]+)/g, ( _, first, trailing ) => first + trailing.toLowerCase() )
			.replace( /[A-Z]/g, ( letter ) => "-" + letter.toLowerCase() )
			.toLowerCase(),

		/**
		 * Converts provided string from camelCase to PascalCase.
		 *
		 * @name HitchyUtilityAPI.case.camelToPascal
		 * @param {string} input string assumed to be in camelCase
		 * @returns {string} provided string converted to PascalCase
		 */
		camelToPascal: input => String( input )
			.replace( /^[a-z]/g, letter => letter.toUpperCase() ),
	};
};
