module.exports = {
	read: function( req, res ) {
		res.send( {
			session: req.indexed || req.promised,
			id: req.params.id,
		} );
	},
	bodyPosted: function( req, res ) {
		res.send( req.body );
	},
	bodyNormal: function( req, res ) {
		res.send( "normal request" );
	},
	create: function( req, res ) {
		res.send( {
			session: req.promised,
			id: req.params.id,
			name: req.params.name,
		} );
	}
};
