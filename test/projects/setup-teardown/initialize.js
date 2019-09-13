"use strict";

global.startedHitchyProjectNamedSetupTeardown = true;

module.exports = function( options ) {
	global.startedHitchyProjectNamedSetupTeardownWith = {
		options,
		api: this,
	};
};
