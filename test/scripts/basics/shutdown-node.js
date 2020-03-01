"use strict";

const options = {
	projectFolder: "test/projects/shutdown/on-purpose",
	_logger: true,
	// debug: true,
};

const { describe, it, beforeEach, afterEach } = require( "mocha" );

require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

/**
 * Sends request checking whether its response is timing out as expected or not.
 *
 * @param {HitchyTestContext} ctx context of testing
 * @param {string} url URL to be requested
 * @param {object} headers custom request headers
 * @returns {Promise} promises request having timed out
 */
function getNotResponding( ctx, url, headers = {} ) {
	return Promise.race( [
		new Promise( resolve => setTimeout( resolve, 1000, "TIMEOUT" ) ),
		ctx.get( url, null, headers ).then( () => {
			throw new Error( "got valid response though expecting timeout due to peer shut down" );
		} ),
	] );
}

// ----------------------------------------------------------------------------

describe( "Intentionally shutting down Hitchy", function() {
	const ctx = {};
	let crashed;
	let closed;

	beforeEach( Test.before( ctx, options ) );
	afterEach( Test.after( ctx ) );
	beforeEach( () => {
		crashed = new Promise( resolve => {
			ctx.hitchy.api.once( "crash", resolve );
		} );
		crashed.done = false;
		crashed.finally( () => { crashed.done = true; } ); // eslint-disable-line promise/catch-or-return

		closed = new Promise( resolve => {
			ctx.server.once( "close", resolve );
		} );
	} );

	it( "works in controller via closure", () => {
		return getNotResponding( ctx, "/shutdown/route/closure", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in controller via context", () => {
		return getNotResponding( ctx, "/shutdown/route/context", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in controller via helper", () => {
		return getNotResponding( ctx, "/shutdown/route/helper", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in policy via closure", () => {
		return getNotResponding( ctx, "/shutdown/policy/closure", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in policy via context", () => {
		return getNotResponding( ctx, "/shutdown/policy/context", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in policy via helper", () => {
		return getNotResponding( ctx, "/shutdown/policy/helper", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in model via closure", () => {
		return getNotResponding( ctx, "/shutdown/route/model", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );

	it( "works in service via closure", () => {
		return getNotResponding( ctx, "/shutdown/route/service", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.done.should.be.false() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.empty();
			} );
	} );
} );
