"use strict";

module.exports = function() {
	return {
		policies: {
			"ALL /crash/policy/closure": "crash.viaClosure",
			"ALL /crash/policy/context": "crash.viaContext",
			"ALL /crash/policy/helper": "crash.viaHelper",
		},
		routes: {
			"ALL /crash/route/closure": "crash.viaClosure",
			"ALL /crash/route/context": "crash.viaContext",
			"ALL /crash/route/helper": "crash.viaHelper",
			"ALL /crash/route/model": "crash.viaModel",
			"ALL /crash/route/service": "crash.viaService",
		},
	};
};
