"use strict";

module.exports = {
	index: function( req, res, next ) {
		req.indexed = "instant session!";
		next();
	},
	promised: function( req, res, next ) { // eslint-disable-line no-unused-vars
		req.promised = "promised session!";
		return new Promise( resolve => setTimeout( resolve, 100 ) );
	},
};
