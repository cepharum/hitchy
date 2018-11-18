"use strict";

let options = {
	projectFolder: "test/projects/exposure",
	//debug: true,
};

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"];

const Should = require( "should" );
require( "should-http" );

// ----------------------------------------------------------------------------

suite( "Serving project with complex exposure", function() {
	const node = Hitchy( options );
	let server = null;

	suiteSetup( () => Test.startServer( node ).then( s => ( server = s ) ) );
	suiteTeardown( () => server && server.stop() );

	test( "provides access on exposed elements", function() {
		node.hitchy.runtime.should.be.ok();
		node.hitchy.runtime.should.have.ownProperty( "models" );
		node.hitchy.runtime.should.have.ownProperty( "controllers" );
		node.hitchy.runtime.should.have.ownProperty( "services" );
		node.hitchy.runtime.should.have.ownProperty( "policies" );
	} );

	test( "exposes model 'static'", function() {
		node.hitchy.runtime.models.should.have.ownProperty( "static" );

		Should( node.hitchy.runtime.models.static.beforeSimpleFoundModel ).not.be.true();
		Should( node.hitchy.runtime.models.static.beforeCMFPFoundModel ).be.true();
		Should( node.hitchy.runtime.models.static.afterSimpleFoundModel ).be.true();
		Should( node.hitchy.runtime.models.static.afterCMFPFoundModel ).be.true();

		node.hitchy.runtime.models.static.toKeepModel.should.equal( "before-simple" );
		node.hitchy.runtime.models.static.toKeepModelToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.models.static.toKeepModelLately.should.equal( "after-simple" );
		node.hitchy.runtime.models.static.toReplaceModel.should.not.equal( "before-simple" );
		node.hitchy.runtime.models.static.toReplaceModel.should.equal( "after-cmfp" );

		node.hitchy.runtime.models.static.staticProperty.should.equal( "original static model property" );
		node.hitchy.runtime.models.static.staticMethod.should.be.Function();
		node.hitchy.runtime.models.static.staticMethod().should.equal( "original static model method" );
	} );

	test( "exposes controller 'static'", function() {
		node.hitchy.runtime.controllers.should.have.ownProperty( "static" );

		Should( node.hitchy.runtime.controllers.static.beforeSimpleFoundController ).not.be.true();
		Should( node.hitchy.runtime.controllers.static.beforeCMFPFoundController ).be.true();
		Should( node.hitchy.runtime.controllers.static.afterSimpleFoundController ).be.true();
		Should( node.hitchy.runtime.controllers.static.afterCMFPFoundController ).be.true();

		node.hitchy.runtime.controllers.static.toKeepController.should.equal( "before-simple" );
		node.hitchy.runtime.controllers.static.toKeepControllerToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.controllers.static.toKeepControllerLately.should.equal( "after-simple" );
		node.hitchy.runtime.controllers.static.toReplaceController.should.not.equal( "before-simple" );
		node.hitchy.runtime.controllers.static.toReplaceController.should.equal( "after-cmfp" );

		node.hitchy.runtime.controllers.static.staticProperty.should.equal( "original static controller property" );
		node.hitchy.runtime.controllers.static.staticMethod.should.be.Function();
		node.hitchy.runtime.controllers.static.staticMethod().should.equal( "original static controller method" );
	} );

	test( "exposes service 'static'", function() {
		node.hitchy.runtime.services.should.have.ownProperty( "static" );

		Should( node.hitchy.runtime.services.static.beforeSimpleFoundService ).not.be.true();
		Should( node.hitchy.runtime.services.static.beforeCMFPFoundService ).be.true();
		Should( node.hitchy.runtime.services.static.afterSimpleFoundService ).be.true();
		Should( node.hitchy.runtime.services.static.afterCMFPFoundService ).be.true();

		node.hitchy.runtime.services.static.toKeepService.should.equal( "before-simple" );
		node.hitchy.runtime.services.static.toKeepServiceToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.services.static.toKeepServiceLately.should.equal( "after-simple" );
		node.hitchy.runtime.services.static.toReplaceService.should.not.equal( "before-simple" );
		node.hitchy.runtime.services.static.toReplaceService.should.equal( "after-cmfp" );

		node.hitchy.runtime.services.static.staticProperty.should.equal( "original static service property" );
		node.hitchy.runtime.services.static.staticMethod.should.be.Function();
		node.hitchy.runtime.services.static.staticMethod().should.equal( "original static service method" );
	} );

	test( "exposes policy 'static'", function() {
		node.hitchy.runtime.policies.should.have.ownProperty( "static" );

		Should( node.hitchy.runtime.policies.static.beforeSimpleFoundPolicy ).not.be.true();
		Should( node.hitchy.runtime.policies.static.beforeCMFPFoundPolicy ).be.true();
		Should( node.hitchy.runtime.policies.static.afterSimpleFoundPolicy ).be.true();
		Should( node.hitchy.runtime.policies.static.afterCMFPFoundPolicy ).be.true();

		node.hitchy.runtime.policies.static.toKeepPolicy.should.equal( "before-simple" );
		node.hitchy.runtime.policies.static.toKeepPolicyToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.policies.static.toKeepPolicyLately.should.equal( "after-simple" );
		node.hitchy.runtime.policies.static.toReplacePolicy.should.not.equal( "before-simple" );
		node.hitchy.runtime.policies.static.toReplacePolicy.should.equal( "after-cmfp" );

		node.hitchy.runtime.policies.static.staticProperty.should.equal( "original static policy property" );
		node.hitchy.runtime.policies.static.staticMethod.should.be.Function();
		node.hitchy.runtime.policies.static.staticMethod().should.equal( "original static policy method" );
	} );
} );
