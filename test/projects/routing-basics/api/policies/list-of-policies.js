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

exports.one = ( req, res, next ) => {
	req.custom = [1];

	next();
};

exports.two = ( req, res, next ) => {
	req.custom.push( 2 );

	next();
};

exports.three = ( req, res, next ) => {
	req.custom.push( 3 );

	next();
};

exports.four = ( req, res, next ) => {
	req.custom.push( 4 );

	next();
};

exports.plusOne = ( req, res, next ) => {
	global.mySpecialTestCalculationVariable += 1;

	next();
};

exports.plusTwo = ( req, res, next ) => {
	global.mySpecialTestCalculationVariable += 2;

	next();
};

exports.plusThree = ( req, res, next ) => {
	global.mySpecialTestCalculationVariable += 3;

	next();
};

exports.double = ( req, res, next ) => {
	global.mySpecialTestCalculationVariable *= 2;

	next();
};

exports.triple = ( req, res, next ) => {
	global.mySpecialTestCalculationVariable *= 3;

	next();
};

exports.quadruple = ( req, res, next ) => {
	global.mySpecialTestCalculationVariable *= 4;

	next();
};
