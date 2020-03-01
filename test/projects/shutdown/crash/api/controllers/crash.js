"use strict";

module.exports = function() {
	const api = this;
	const { models: Models, services: Services } = api.runtime;

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
		viaModel( req ) {
			return Models.Crash.handle( req.headers["x-cause"] );
		},
		viaService( req ) {
			return Services.Crash.handle( req.headers["x-cause"] );
		},
	};
};
