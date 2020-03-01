"use strict";

const options = {
	projectFolder: "test/projects/shutdown/crash",
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
			throw new Error( "got valid response though expecting timeout due to crashed peer" );
		} ),
	] );
}

// ----------------------------------------------------------------------------

describe( "Intentionally crashing Hitchy", function() {
	const ctx = {};
	let crashed;
	let closed;

	beforeEach( Test.before( ctx, options ) );
	afterEach( Test.after( ctx ) );
	beforeEach( () => {
		crashed = new Promise( resolve => {
			ctx.hitchy.api.once( "crash", resolve );
		} );

		closed = new Promise( resolve => {
			ctx.server.once( "close", resolve );
		} );
	} );

	it( "works in controller via closure", () => {
		return getNotResponding( ctx, "/crash/route/closure", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in controller via context", () => {
		return getNotResponding( ctx, "/crash/route/context", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in controller via helper", () => {
		return getNotResponding( ctx, "/crash/route/helper", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in policy via closure", () => {
		return getNotResponding( ctx, "/crash/policy/closure", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in policy via context", () => {
		return getNotResponding( ctx, "/crash/policy/context", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in policy via helper", () => {
		return getNotResponding( ctx, "/crash/policy/helper", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in model via closure", () => {
		return getNotResponding( ctx, "/crash/route/model", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );

	it( "works in service via closure", () => {
		return getNotResponding( ctx, "/crash/route/service", {
			"x-cause": "my custom cause",
		} )
			.then( () => crashed.should.be.resolved() )
			.then( () => closed.should.be.resolved() )
			.then( () => {
				ctx.logged.should.be.Array().which.is.not.empty();
				ctx.logged.join( "" ).should.match( /FATAL:/ ).and.match( /testing crash with my custom cause/ );
			} );
	} );
} );
