module.exports = {
	index: function( req, res, next ) {
		req.indexed = "yeah!";
		next();
	},
	promised: function( req, res ) {
		req.promised = "yup!";
		return new Promise( function( resolve ) { setTimeout( resolve, 100 ); } );
	},
};
