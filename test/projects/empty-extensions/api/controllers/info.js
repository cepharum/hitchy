"use strict";

module.exports = {
	index: function( req, res ) {
		const plugins = this.api.plugins,
			infos = {};

		Object.keys( plugins )
			.map( function( name ) {
				const plugin = plugins[name];

				infos[name] = {
					meta: plugin.$meta,
					index: plugin.$index,
					name: plugin.$name,
					role: plugin.$role,
				};
			} );

		res.send( infos );
	}
};
