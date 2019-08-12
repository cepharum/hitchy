"use strict";

module.exports = {
	index: function( req, res ) {
		res.type( "html" ).send( "<h1>Welcome!</h1><p>This is the homepage provided for testing purposes, only.</p>" );
	},
	read: function( req, res ) {
		res.send( {
			session: req.indexed || req.promised,
			id: req.params.id,
			extra: req.query.extra,
		} );
	},
	bodyPosted: function( req, res ) {
		return req.fetchBody()
			.then( body => res.send( body ) );
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
	},
	mirrorAPI( req, res ) {
		res.json( {
			this: Object.keys( this.api ),
			req: Object.keys( req.hitchy ),
			same: this.api === req.hitchy,
		} );
	},
	internalForward( req, res ) {
		const client = new req.hitchy.Client( { url: "/internal/dispatch" } );

		client.end();

		return client.dispatch()
			.then( _res => {
				if ( _res.statusCode !== 200 ) {
					res.status( 500 );
					res.json( { error: `forwarding request internally yielded response status ${_res.statusCode}` } );
					return;
				}

				const buffers = [];

				_res.on( "data", chunk => {
					buffers.push( chunk );
				} );

				_res.on( "end", () => {
					try {
						const data = JSON.parse( Buffer.concat( buffers ).toString( "utf8" ) );
						res.json( data );
					} catch ( error ) {
						res.status( 500 );
						res.json( { error: `parsing JSON response failed: ${error.message}` } );
					}
				} );

				_res.on( "error", error => {
					res.status( 500 );
					res.json( { error: `internally forwarding failed: ${error.message}` } );
				} );
			} );
	},
	internallyDispatched( req, res ) {
		if ( req.internal ) {
			res.json( { info: "This result has been fetched using internal dispatching." } );
		} else {
			res.status( 500 ).json( { error: "This result has NOT been fetched using internal dispatching." } );
		}
	},
};
