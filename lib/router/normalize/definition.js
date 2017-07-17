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

const Route = require( "../types/route" ).Route;


/**
 * Normalizes provided set of route definitions.
 *
 * @type {{Module:HitchyRouteNormalizer, Custom:HitchyRouteNormalizer, Blueprint:HitchyRouteNormalizer}}
 */
module.exports = {
	Module: _normalizeDefinition.bind( {}, true, false ),
	Custom: _normalizeDefinition.bind( {}, true, true ),
	Blueprint: _normalizeDefinition.bind( {}, false, false ),
};

/**
 * @typedef {function( rawDefinition:(HitchyRouteComponentTables|HitchyRouteDescriptorSet) ):HitchyRouteComponentTablesNormalized} HitchyRouteNormalizer
 */

/**
 *
 * @param {boolean} supportAnyStage true to support any stage in raw definition
 * @param {boolean} supportAllStages true to support stages "early" and "late"
 *        as used with custom routes of current application
 * @param rawDefinition
 * @returns {HitchyRouteComponentTablesNormalized|HitchyRouteDescriptorSet}
 * @private
 */
function _normalizeDefinition( supportAnyStage, supportAllStages, rawDefinition ) {
	switch ( typeof rawDefinition ) {
		case "object" :
			if ( rawDefinition ) {
				if ( !Array.isArray( rawDefinition ) ) {
					let unexpectedStages = false;
					let explicit = Boolean( supportAnyStage );
					let toCheck = 5;

					if ( explicit ) {
						for ( let name in rawDefinition ) {
							if ( rawDefinition.hasOwnProperty( name ) ) {
								if ( toCheck-- < 1 ) {
									break;
								}

								switch ( name ) {
									case "early" :
									case "late" :
										if ( !supportAllStages ) {
											unexpectedStages = true;
										}
										break;

									case "before" :
									case "after" :
										break;

									default :
										explicit = false;
								}

								if ( !explicit ) {
									break;
								}
							}
						}
					}

					if ( !explicit ) {
						// at least one property does not use name matching any
						// known stage -> consider whole definition as implicit
						break;
					}

					if ( unexpectedStages ) {
						// all properties of definition match names of known stages,
						// but some of the stages are not expected thus throw
						// exception to notify user (to support in debugging)
						throw new TypeError( "got one or more unexpected stages in route definition" );
					}


					/*
					 * create new object containing all expected stages
					 * optionally using empty definition if provided one
					 * is lacking of it
					 */
					let result;

					if ( supportAllStages ) {
						result = { early: new Map(), before: new Map(), after: new Map(), late: new Map() };
					} else {
						result = { before: new Map(), after: new Map() };
					}

					for ( let name in result ) {
						if ( result.hasOwnProperty( name ) ) {
							if ( rawDefinition.hasOwnProperty( name ) ) {
								result[name] = _normalizeSet( rawDefinition[name] );
							}
						}
					}

					return result;
				}
			}
			break;

		case "undefined" :
			break;

		default :
			throw new TypeError( `invalid route definition: ${rawDefinition}` )
	}

	return supportAnyStage ? supportAllStages ? {
		early: new Map(),
		before: _normalizeSet( rawDefinition || {} ),
		after: new Map(),
		late: new Map()
	} : {
		before: _normalizeSet( rawDefinition || {} ),
		after: new Map()
	} : _normalizeSet( rawDefinition || {} );
}

/**
 * Normalizes single set of routes provided as object, array or map.
 *
 * @param {Array|object|Map} rawSetOfRoutes
 * @returns {Map}
 * @private
 */
function _normalizeSet( rawSetOfRoutes ) {
	if ( !rawSetOfRoutes ) {
		return new Map();
	}

	if ( rawSetOfRoutes instanceof Map ) {
		return rawSetOfRoutes;
	}

	if ( Array.isArray( rawSetOfRoutes ) ) {
		// create Map from provided array
		let mapping = new Map();

		for ( let i = 0, length = rawSetOfRoutes.length; i < length; i++ ) {
			let route = rawSetOfRoutes[i];
			if ( Array.isArray( route ) ) {
				if ( route.length === 2 ) {
					mapping.set( route[0], route[1] );
				} else {
					throw new TypeError( "invalid array-based definition of a route" );
				}
			} else {
				let source = Route.preparseSource( route );

				mapping.set( `${source.type} ${source.url}`, route );
			}
		}

		return mapping;
	}

	if ( typeof rawSetOfRoutes === "object" ) {
		let mapping = new Map();

		for ( let name in rawSetOfRoutes ) {
			if ( rawSetOfRoutes.hasOwnProperty( name ) ) {
				let source = Route.preparseSource( name );

				mapping.set( `${source.type} ${source.url}`, rawSetOfRoutes[name] );
			}
		}

		return mapping;
	}

	throw new TypeError( "invalid list of raw routing definitions" );
}
