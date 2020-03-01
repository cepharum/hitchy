"use strict";

module.exports = function() {
	const api = this;

	return {
		viaClosure( req ) {
			api.shutdown( new Error( "testing shutdown with " + req.headers["x-cause"] ) );
		},
		viaContext( req ) {
			this.api.shutdown( new Error( "testing shutdown with " + req.headers["x-cause"] ) );
		},
		viaHelper( req ) {
			req.hitchy.shutdown( new Error( "testing shutdown with " + req.headers["x-cause"] ) );
		},
	};
};
