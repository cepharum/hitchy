"use strict";

const inject = ( req, res, next ) => {
	Object.keys( req.params )
		.forEach( name => {
			const value = req.params[name];

			res.set( "x-param-" + name, Array.isArray( value ) ? value.join( "," ) : value );
		} );

	next();
};

exports.policies = {
	"ALL /scalar/:foo": inject,
	"ALL /list/:foo+": inject,
	"ALL /double/scalar/:foo/separated/:bar": inject,
	"ALL /double/list/:foo+/separated/:bar+": inject,
	"ALL /spec%20ial/scalar/:foo/sep%20arated/:bar": inject,
	"ALL /spec%20ial/list/:foo+/sep%20arated/:bar+": inject,
};
