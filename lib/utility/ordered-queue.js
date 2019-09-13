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
 * Implements sorted list of slots each to be fed with arbitrary data.
 *
 * Processing queue is considered to wrap some inner action which isn't part of
 * queue itself. Thus queue is split into list preceding inner action (slots to
 * be processed _before_ inner action) and list succeeding it (slots to be
 * processed _after_ inner action). These _virtual_ lists can be fetched using
 * properties `before` and  `after`.
 *
 * This queue is initially prepared to provide one slot for every available
 * extension in either of the two virtual lists.
 *
 *
 * @name OrderedQueue
 * @property {int} pluginSlotCount number of plugins supported by queue
 * @property {object[]} before (optionally compacted) list of slots preceding wrapped inner action
 * @property {object[]} after (optionally compacted) list of slots succeeding wrapped inner action
 * @property {boolean} isAdjustable marks if another element can be added or not
 */
class OrderedQueue {
	/**
	 * @param {int} numberOfPlugins number of discovered plugins
	 */
	constructor( numberOfPlugins ) {
		if ( Array.isArray( numberOfPlugins ) || !( parseInt( numberOfPlugins ) > -1 ) ) {
			throw new TypeError( "invalid or missing number of plugins" );
		}

		const numPlugins = parseInt( numberOfPlugins );

		Object.defineProperties( this, {
			pluginSlotCount: { value: numPlugins },
			before: {
				value: new Array( 1 +          // slot for app's early custom data
				                  numPlugins + // slots for every extension's data processed before inner action
				                  1 +          // slot for app's custom data processed before inner action
				                  1 ),         // slot for data of inner action
				configurable: true,
				enumerable: true
			},
			after: {
				value: new Array( 1 +          // slot for app's custom data processed after inner action
				                  numPlugins + // slots for every extension's data processed after inner action in reverse order
				                  1 ),         // slot for app's late custom data
				configurable: true,
				enumerable: true
			},
			isAdjustable: {
				value: true,
				configurable: true
			}
		} );
	}

	/**
	 * Retrieves reference on list and numeric index of slot in that list for
	 * selected plugin in selected stage.
	 *
	 * @param {int} pluginIndex index of plugin in list of plugins as resulting from plugin discovery
	 * @param {boolean|string} before Selects if selected slot should precede
	 *        wrapped inner action or succeed it. Thus it is string "before" or
	 *        "after" or boolean true to select "before" or false to select "after"
	 * @returns {{list: *, slotIndex: *}} slot cursor suitable for use with methods `_read` and `_write`
	 * @private
	 */
	_getListAndSlotIndexForPlugin( pluginIndex, before ) {
		if ( !this.isAdjustable ) {
			throw new Error( "can't select slot by plugin index in a compacted queue" );
		}

		if ( Array.isArray( pluginIndex ) || !( parseInt( pluginIndex ) > -1 ) || pluginIndex >= this.pluginSlotCount ) {
			throw new TypeError( "invalid index of plugin" );
		}

		let index = pluginIndex;
		let _before = before;
		let list;

		if ( typeof _before === "string" ) {
			switch ( _before.toLowerCase().trim() ) {
				case "before" :
					_before = true;
					break;

				case "after" :
					_before = false;
					break;

				default :
					throw new TypeError( "invalid stage" );
			}
		}

		if ( _before ) {
			list = this.before;
			// map plugin's index into slot's index
			index += 1;
		} else {
			list = this.after;
			// map plugin's index into slot's index
			// -> in after-list slots per plugin are sorted in reverse order
			index = list.length - 1 - 1 - index;
		}

		return {
			list,
			slotIndex: index
		};
	}

	/**
	 * Retrieves reference on list and numeric index of slot in that list for
	 * current application's customization.
	 *
	 * Slot is selected by one out of four possible names:
	 *
	 *    * `"early"` selects slot preceding all plugins' slots queued before wrapped inner action
	 *    * `"before"` selects slot succeeding all plugins' slots queued before wrapped inner action
	 *    * `"after"` selects slot preceding all plugins' slots queued after wrapped inner action
	 *    * `"late"` selects slot succeeding all plugins' slots queued after wrapped inner action
	 *
	 * @param {string} stage see description
	 * @returns {{list: *, slotIndex: *}} slot cursor suitable for use with methods `_read` and `_write`
	 * @private
	 */
	_getListAndSlotIndexForCustom( stage ) {
		if ( !this.isAdjustable ) {
			throw new Error( "can't select custom slot in a compacted queue" );
		}

		let list, slotIndex;
		let _stage = stage;

		switch ( _stage ) {
			case true :
				_stage = "before";
				break;

			case false :
				_stage = "after";
				break;
		}

		switch ( ( typeof _stage === "string" ? _stage : "" ).toLowerCase() ) {
			case "early" :
				list = this.before;
				slotIndex = 0;
				break;
			case "before" :
				list = this.before;
				slotIndex = list.length - 2;
				break;
			case "after" :
				list = this.after;
				slotIndex = 0;
				break;
			case "late" :
				list = this.after;
				slotIndex = list.length - 1;
				break;
			default :
				throw new TypeError( "invalid stage for selecting custom slot" );
		}

		return { list, slotIndex };
	}

	/**
	 * Gets value from selected slot of queue.
	 *
	 * Provided initial value is written to slot and returned here unless slot
	 * has been written before.
	 *
	 * @param {*[]} list one of the list `this.before` or `this.after`
	 * @param {*} initialValue value to be written if slot has not been written before
	 * @param {int} slotIndex index of element in list representing desired slot
	 * @returns {*} value of slot (matching `initialValue` if slot has not been written before)
	 * @private
	 */
	_read( { list, slotIndex }, initialValue = null ) {
		if ( list[slotIndex] === undefined ) {
			list[slotIndex] = initialValue || null;
		}

		return list[slotIndex];
	}

	/**
	 * Puts value into selected slot of queue.
	 *
	 * Provided initial value is written to slot and returned here unless slot
	 * has been written before.
	 *
	 * @param {*[]} list one of the list `this.before` or `this.after`
	 * @param {*} value value to be written
	 * @param {int} slotIndex index of element in list representing desired slot
	 * @returns {OrderedQueue} current instance for establishing fluent interface
	 * @private
	 */
	_write( { list, slotIndex }, value ) {
		list[slotIndex] = value;

		return this;
	}

	/**
	 * Gets value in slot selected for plugin given by index.
	 *
	 * @param {int} index index of plugin in list of plugins as resulting from plugin discovery
	 * @param {boolean|string} stage Selects if selected slot should precede
	 *        wrapped inner action or succeed it. Thus it is string "before" or
	 *        "after" or boolean true to select "before" or false to select "after"
	 * @param {*} initialValue if slot has not been set before this value is written implicitly and returned here
	 * @returns {*} value of selected slot, `initialValue` if slot has not been set before
	 */
	getOnPlugin( index, stage = "before", initialValue = null ) {
		return this._read( this._getListAndSlotIndexForPlugin( index, stage ), initialValue );
	}

	/**
	 * Replaces value in slot selected for plugin given by index.
	 *
	 * @param {int} index index of plugin in list of plugins as resulting from plugin discovery
	 * @param {boolean|string} stage Selects if selected slot should precede
	 *        wrapped inner action or succeed it. Thus it is string "before" or
	 *        "after" or boolean true to select "before" or false to select "after"
	 * @param {*} value value to be put into selected slot
	 * @returns {OrderedQueue} current instance for establishing fluent interface
	 */
	setOnPlugin( index, stage = "before", value = null ) {
		return this._write( this._getListAndSlotIndexForPlugin( index, stage ), value );
	}

	/**
	 * Reads value from slot related to current application's customizations.
	 *
	 * Slot is selected by one out of four possible names:
	 *
	 *    * `"early"` selects slot preceding all plugins' slots queued before wrapped inner action
	 *    * `"before"` selects slot succeeding all plugins' slots queued before wrapped inner action
	 *    * `"after"` selects slot preceding all plugins' slots queued after wrapped inner action
	 *    * `"late"` selects slot succeeding all plugins' slots queued after wrapped inner action
	 *
	 * @param {string} stage see description
	 * @param {*} initialValue value to be written implicitly if slot has not been set before
	 * @returns {*} value of selected slot, `initialValue` if slot has not been set before
	 */
	getCustomSlot( stage = "before", initialValue = null ) {
		return this._read( this._getListAndSlotIndexForCustom( stage ), initialValue );
	}

	/**
	 * Writes to slot related to current application's customizations.
	 *
	 * Slot is selected by one out of four possible names:
	 *
	 *    * `"early"` selects slot preceding all plugins' slots queued before wrapped inner action
	 *    * `"before"` selects slot succeeding all plugins' slots queued before wrapped inner action
	 *    * `"after"` selects slot preceding all plugins' slots queued after wrapped inner action
	 *    * `"late"` selects slot succeeding all plugins' slots queued after wrapped inner action
	 *
	 * @param {string} stage see description
	 * @param {*} value value to be written
	 * @returns {OrderedQueue} current instance for establishing fluent interface
	 */
	setCustomSlot( stage = "before", value = null ) {
		return this._write( this._getListAndSlotIndexForCustom( stage ), value );
	}

	/**
	 * Reads value from slot related to inner action wrapped by actions related
	 * to all other slots.
	 *
	 * Any queue is containing single slot for inner action and thus there is no
	 * need to address it more explicitly.
	 *
	 * The selected slot is last on iterating slots of before stage.
	 *
	 * @param {*} initialValue value to be written implicitly if slot has not been set before
	 * @returns {*} value of slot, `initialValue` if slot has not been set before
	 */
	getInnerSlot( initialValue = null ) {
		if ( !this.isAdjustable ) {
			throw new Error( "can't select inner-action slot in a compacted queue" );
		}

		return this._read( { list: this.before, slotIndex: this.before.length - 1 }, initialValue );
	}

	/**
	 * Replaces value in slot related to wrapped inner action.
	 *
	 * Any queue is containing single slot for inner action and thus there is no
	 * need to address it more explicitly.
	 *
	 * The selected slot is last on iterating slots of before stage.
	 *
	 * @param {*} value value to be written
	 * @returns {OrderedQueue} current instance for establishing fluent interface
	 */
	setInnerSlot( value ) {
		if ( !this.isAdjustable ) {
			throw new Error( "can't select inner-action slot in a compacted queue" );
		}

		return this._write( { list: this.before, slotIndex: this.before.length - 1 }, value );
	}

	/**
	 * Removes all unused slots from queue.
	 *
	 * @note This method is adjusting structure of queue for improved processing
	 *       making it impossible to safely adjust slots afterwards. Thus any
	 *       succeeding invocation of methods for reading from or writing to
	 *       single slots is throwing exception.
	 *
	 * @param {?function(item:*):boolean} callback gets called to decide whether some slot is non-empty (returning true) or not (returning false)
	 * @returns {OrderedQueue} current instance for establishing fluent interface
	 */
	compact( callback = null ) {
		if ( this.isAdjustable ) {
			const _callback = callback || ( i => i );

			// replace currently exposed lists with read-only copies with all unused
			// slots removed from either list
			for ( let name = "before"; name; name = name === "after" ? null : "after" ) {
				const list = this[name];
				const length = list.length;
				const copy = new Array( length );
				let write = 0;

				for ( let read = 0; read < length; read++ ) {
					const item = list[read];

					if ( _callback( item ) ) {
						copy[write++] = item;
					}
				}

				copy.splice( write, length - write );

				Object.defineProperty( this, name, {
					value: copy,
					enumerable: true
				} );
			}

			// mark queue to be compacted now
			Object.defineProperty( this, "isAdjustable", { value: false } );
		}

		return this;
	}
}

module.exports = OrderedQueue;
