"use strict";

global.stoppedHitchyProjectNamedSetupTeardown = true;

module.exports = function( options ) {
	global.stoppedHitchyProjectNamedSetupTeardownWith = {
		options,
		api: this,
	};
};
