"use strict";

module.exports = function() {
	const api = this;
	const { models: Models, services: Services } = api.runtime;

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
		viaModel( req ) {
			return Models.Shutdown.handle( req.headers["x-cause"] );
		},
		viaService( req ) {
			return Services.Shutdown.handle( req.headers["x-cause"] );
		},
	};
};
