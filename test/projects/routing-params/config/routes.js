"use strict";

exports.routes = {
	"ALL /scalar/:foo": ( req, res ) => res.json( req.params ),
	"ALL /list/:foo+": ( req, res ) => res.json( req.params ),
	"ALL /double/scalar/:foo/separated/:bar": ( req, res ) => res.json( req.params ),
	"ALL /double/list/:foo+/separated/:bar+": ( req, res ) => res.json( req.params ),
	"ALL /spec%20ial/scalar/:foo/sep%20arated/:bar": ( req, res ) => res.json( req.params ),
	"ALL /spec%20ial/list/:foo+/sep%20arated/:bar+": ( req, res ) => res.json( req.params ),
};
