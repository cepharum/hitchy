"use strict";

module.exports = {
	index: function( req, res ) {
		let components = this.api.components,
			infos = {};

		Object.keys( components )
			.map( function( name ) {
				let component = components[name];

				infos[name] = {
					meta: component.$meta,
					index: component.$index,
					name: component.$name,
					role: component.$role,
				};
			} );

		res.send( infos );
	}
};
