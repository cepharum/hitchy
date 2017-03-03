module.exports = {
	index: function( req, res ) {
		res.type( "html" ).send( "<h1>Welcome!</h1><p>This is the homepage provided for testing purposes, only.</p>")
	},
	read: function( req, res ) {
		res.send( {
			session: req.indexed || req.promised,
			id: req.params.id,
			extra: req.query.extra,
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
			extra: req.query.extra,
		} );
	}
};
