module.exports = {
	read: function( req, res ) {
		res.send( req.indexed );
	},
	bodyPosted: function( req, res ) {
		res.send( req.body );
	},
	bodyNormal: function( req, res ) {
		res.send( "normal request" );
	},
	create: function( req, res ) {
		res.send( req.promised );
	}
};
