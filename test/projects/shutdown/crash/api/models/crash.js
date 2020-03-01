"use strict";

module.exports = function() {
	const api = this;

	return {
		handle( cause ) {
			api.crash( new Error( "testing crash with " + cause ) );
		},
	};
};
