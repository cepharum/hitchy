"use strict";

exports.policies = {
	"ALL /query": ( req, res, next ) => {
		Object.keys( req.query )
			.forEach( name => {
				const value = req.query[name];

				res.set( "x-query-" + name, Array.isArray( value ) ? value.join( "," ) : value );
			} );

		next();
	},
};
