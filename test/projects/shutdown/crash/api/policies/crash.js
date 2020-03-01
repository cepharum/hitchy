"use strict";

module.exports = function() {
	const api = this;

	return {
		viaClosure( req ) {
			api.crash( new Error( "testing crash with " + req.headers["x-cause"] ) );
		},
		viaContext( req ) {
			this.api.crash( new Error( "testing crash with " + req.headers["x-cause"] ) );
		},
		viaHelper( req ) {
			req.hitchy.crash( new Error( "testing crash with " + req.headers["x-cause"] ) );
		},
	};
};
