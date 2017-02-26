module.exports = {
	index: function( req, res, next ) {
		req.indexed = "instant session!";
		next();
	},
	promised: function( req, res ) {
		req.promised = "promised session!";
		return new Promise( resolve => setTimeout( resolve, 100 ) );
	},
};
