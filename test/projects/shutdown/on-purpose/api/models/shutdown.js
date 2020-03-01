"use strict";

module.exports = function() {
	const api = this;

	return {
		handle( cause ) {
			api.shutdown( new Error( "testing shutdown with " + cause ) );
		},
	};
};
