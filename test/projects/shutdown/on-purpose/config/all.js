"use strict";

module.exports = function() {
	return {
		policies: {
			"ALL /shutdown/policy/closure": "shutdown.viaClosure",
			"ALL /shutdown/policy/context": "shutdown.viaContext",
			"ALL /shutdown/policy/helper": "shutdown.viaHelper",
		},
		routes: {
			"ALL /shutdown/route/closure": "shutdown.viaClosure",
			"ALL /shutdown/route/context": "shutdown.viaContext",
			"ALL /shutdown/route/helper": "shutdown.viaHelper",
			"ALL /shutdown/route/model": "shutdown.viaModel",
			"ALL /shutdown/route/service": "shutdown.viaService",
		},
	};
};
