"use strict";

module.exports = {
	index: function( req, res ) {
		res.send( {
			mode: "index"
		} );
	},
	someMethod: function( req, res ) {
		res.send( {
			mode: "something"
		} );
	},
	addOn: function( req, res ) {
		res.send( {
			mode: "addon"
		} );
	},
};
