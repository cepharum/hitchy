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

const EventEmitter = require( "events" );

module.exports = {
	/** @borrows _toolObjectDeepSeal as deepSeal */
	deepSeal: _toolObjectDeepSeal,

	/** @borrows _toolObjectDeepFreeze as deepFreeze */
	deepFreeze: _toolObjectDeepFreeze,

	/** @borrows _toolObjectDeepMerge as deepMerge */
	deepMerge: _toolObjectDeepMerge,
};

/**
 * Deeply seals a given object w/o copying it.
 *
 * @param {object} object object to be sealed deeply
 * @param {function(string[]):boolean} testFn callback invoked to decide whether some property should be sealed or not
 * @param {string[]} _path breadcrumb of segments, used internally
 * @returns {object} reference on provided object, now deeply sealed
 */
function _toolObjectDeepSeal( object, testFn = null, _path = [] ) {
	if ( object && typeof object === "object" && !object.$$doNotSeal$$ && !Object.isSealed( object ) ) {
		const isEventEmitter = object instanceof EventEmitter;

		if ( isEventEmitter ) {
			// prevent properties managed for event handling from being sealed implicitly
			// see [_addEventListener() of events.js](https://github.com/nodejs/node/blob/master/lib/events.js#L349)
			if ( !Object.prototype.hasOwnProperty.call( object, "_events" ) ) {
				object._events = Object.create( null );
			}

			let counter = object._eventsCount || 0;

			Object.defineProperty( object, "_eventsCount", {
				get: () => counter,
				set: value => { counter = value; },
			} );
		}

		const fn = testFn && typeof testFn === "function" ? testFn : null;
		const props = Object.keys( object );
		const numProps = props.length;

		for ( let i = 0; i < numProps; i++ ) {
			const name = props[i];
			const prop = object[name];

			if ( prop && typeof prop === "object" && !prop.$$doNotSeal$$ && !( isEventEmitter && name === "_events" ) ) {
				_path.push( prop );
				_toolObjectDeepSeal( prop, fn, _path );
				_path.pop();
			}
		}

		if ( !fn || fn( _path ) ) {
			Object.seal( object );
		}
	}

	return object;
}

/**
 * Deeply freezes a given object w/o copying it.
 *
 * @param {object} object object to be frozen deeply
 * @param {function(string[]):boolean} testFn callback invoked to decide whether some property should be frozen or not
 * @param {string[]} _path breadcrumb of segments, used internally
 * @returns {object} reference on provided object, now deeply frozen
 */
function _toolObjectDeepFreeze( object, testFn = null, _path = [] ) {
	if ( object && typeof object === "object" && !object.$$doNotFreeze$$ && !Object.isFrozen( object ) ) {
		const isEventEmitter = object instanceof EventEmitter;

		if ( isEventEmitter ) {
			// prevent properties managed for event handling from being sealed implicitly
			// see [_addEventListener() of events.js](https://github.com/nodejs/node/blob/master/lib/events.js#L349)
			if ( !Object.prototype.hasOwnProperty.call( object, "_events" ) ) {
				object._events = Object.create( null );
			}

			let counter = object._eventsCount || 0;

			Object.defineProperty( object, "_eventsCount", {
				get: () => counter,
				set: value => { counter = value; },
			} );
		}

		const fn = testFn && typeof testFn === "function" ? testFn : null;
		const props = Object.keys( object );
		const numProps = props.length;

		for ( let i = 0; i < numProps; i++ ) {
			const name = props[i];
			const prop = object[name];

			if ( prop && typeof prop === "object" && !prop.$$doNotFreeze$$ && !( isEventEmitter && name === "_events" ) ) {
				_path.push( prop );
				_toolObjectDeepFreeze( prop, fn, _path );
				_path.pop();
			}
		}

		if ( !fn || fn( _path ) ) {
			Object.freeze( object );
		}
	}

	return object;
}

/**
 * Deeply merges properties of one or more objects into a given target object.
 *
 * @param {object} target object properties of provided sources are merged into
 * @param {object|object[]} sources single source object or list of source objects properties are read from
 * @param {function(string):string} strategyFn callback invoked per property of object to be merged for picking merging strategy
 * @returns {object} reference on provided target object with properties of sources merged
 */
function _toolObjectDeepMerge( target, sources, strategyFn = null ) {
	const _target = target && typeof target === "object" ? target : {};
	const _sources = Array.isArray( sources ) ? sources : sources == null ? [] : [sources];
	const numSources = _sources.length;

	for ( let s = 0; s < numSources; s++ ) {
		merge( _target, _sources[s], strategyFn, [] );
	}

	return _target;

	/**
	 * Recursive merges given source information with some destination using
	 * strategy optionally selected by some callback.
	 *
	 * @param {object} to target properties of `from` are transferred to
	 * @param {*} from value to be merged,
	 * @param {?function(string, string, *, object):string} fn optional callback invoked to select strategy for transferring either property
	 * @param {string[]} segments lists names of properties superordinated to the current one to be merged (breadcrumb into object hierarchy)
	 * @return {object|*} object provided in `to` with properties of object in `from` or non-object value provided in `from`
	 */
	function merge( to, from, fn, segments ) {
		if ( from && typeof from === "object" ) {
			const names = Array.isArray( from ) ? Array.from( Array( from.length ).keys() ) : from instanceof Map ? Array.from( from.keys() ) : Object.keys( from ); // eslint-disable-line max-len
			const numNames = names.length;

			for ( let i = 0; i < numNames; i++ ) {
				const name = names[i];

				if ( name === "__proto__" || name === "constructor" || name === "prototype" ) {
					continue;
				}

				const subSegments = segments.concat( name );
				let sValue = from instanceof Map ? from.get( name ) : from[name];
				let dValue = to[name];
				let strategy;

				if ( sValue === undefined ) {
					strategy = "keep";
				} else if ( dValue && typeof dValue === "object" ) {
					strategy = Array.isArray( dValue ) ? "concat" : "merge";
				} else {
					strategy = "replace";
				}

				if ( fn ) {
					strategy = fn( subSegments, strategy, sValue, dValue );
				}

				switch ( strategy ) {
					case "keep" :
						break;

					default :
					case "replace" :
						to[name] = dValue = null;

						// falls through
					case "concat" :
						if ( strategy === "concat" && !Array.isArray( sValue ) ) {
							sValue = sValue == null ? [] : [sValue];
						}

						// falls through
					case "merge" :
						if ( sValue && typeof sValue === "object" ) {
							if ( Array.isArray( sValue ) ) {
								const concat = strategy === "concat";
								const _numSources = sValue.length;

								if ( dValue == null ) {
									dValue = [];
								} else if ( concat && !Array.isArray( dValue ) ) {
									dValue = [dValue];
								}

								if ( to instanceof Map ) {
									to.set( name, dValue );
								} else {
									to[name] = dValue;
								}

								for ( let j = 0; j < _numSources; j++ ) {
									let item = sValue[j];

									if ( concat || ( Array.isArray( dValue ) && j >= dValue.length ) ) {
										dValue.push( item );
									} else {
										if ( item && typeof item === "object" ) {
											item = merge( {}, item, fn, subSegments.concat( "[]" ) );
										}

										dValue[j] = item;
									}
								}
							} else if ( sValue.constructor === Object || sValue instanceof Map ) {
								// got some native object or Map -> merge recursively
								if ( to instanceof Map ) {
									to.set( name, merge( dValue || {}, sValue, fn, subSegments ) );
								} else {
									to[name] = merge( dValue || {}, sValue, fn, subSegments );
								}
							} else {
								// got instance of some custom class -> replace
								to[name] = sValue;
							}
						} else {
							to[name] = sValue;
						}
				}
			}

			return to;
		}

		return from;
	}
}
