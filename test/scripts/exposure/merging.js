"use strict";

const options = {
	projectFolder: "test/projects/exposure",
	// debug: true,
};

const { suite, test, suiteTeardown, suiteSetup } = require( "mocha" );

const Should = require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"];

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

	test( "exposes model 'Static'", function() {
		node.hitchy.runtime.models.should.have.ownProperty( "Static" );

		node.hitchy.runtime.models.Static.beforeSimpleFoundModel.should.not.be.true();
		node.hitchy.runtime.models.Static.beforeCMFPFoundModel.should.be.true();
		node.hitchy.runtime.models.Static.afterSimpleFoundModel.should.be.true();
		node.hitchy.runtime.models.Static.afterCMFPFoundModel.should.be.true();

		node.hitchy.runtime.models.Static.toKeepModel.should.equal( "before-simple" );
		node.hitchy.runtime.models.Static.toKeepModelToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.models.Static.toKeepModelLately.should.equal( "after-simple" );
		node.hitchy.runtime.models.Static.toReplaceModel.should.not.equal( "before-simple" );
		node.hitchy.runtime.models.Static.toReplaceModel.should.equal( "after-cmfp" );

		node.hitchy.runtime.models.Static.staticProperty.should.equal( "original static model property" );
		node.hitchy.runtime.models.Static.staticMethod.should.be.Function();
		node.hitchy.runtime.models.Static.staticMethod().should.equal( "original static model method" );
	} );

	test( "exposes controller 'Static'", function() {
		node.hitchy.runtime.controllers.should.have.ownProperty( "Static" );

		Should( node.hitchy.runtime.controllers.Static.beforeSimpleFoundController ).not.be.true();
		Should( node.hitchy.runtime.controllers.Static.beforeCMFPFoundController ).be.true();
		Should( node.hitchy.runtime.controllers.Static.afterSimpleFoundController ).be.true();
		Should( node.hitchy.runtime.controllers.Static.afterCMFPFoundController ).be.true();

		node.hitchy.runtime.controllers.Static.toKeepController.should.equal( "before-simple" );
		node.hitchy.runtime.controllers.Static.toKeepControllerToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.controllers.Static.toKeepControllerLately.should.equal( "after-simple" );
		node.hitchy.runtime.controllers.Static.toReplaceController.should.not.equal( "before-simple" );
		node.hitchy.runtime.controllers.Static.toReplaceController.should.equal( "after-cmfp" );

		node.hitchy.runtime.controllers.Static.staticProperty.should.equal( "original static controller property" );
		node.hitchy.runtime.controllers.Static.staticMethod.should.be.Function();
		node.hitchy.runtime.controllers.Static.staticMethod().should.equal( "original static controller method" );
	} );

	test( "exposes service 'Static'", function() {
		node.hitchy.runtime.services.should.have.ownProperty( "Static" );

		Should( node.hitchy.runtime.services.Static.beforeSimpleFoundService ).not.be.true();
		Should( node.hitchy.runtime.services.Static.beforeCMFPFoundService ).be.true();
		Should( node.hitchy.runtime.services.Static.afterSimpleFoundService ).be.true();
		Should( node.hitchy.runtime.services.Static.afterCMFPFoundService ).be.true();

		node.hitchy.runtime.services.Static.toKeepService.should.equal( "before-simple" );
		node.hitchy.runtime.services.Static.toKeepServiceToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.services.Static.toKeepServiceLately.should.equal( "after-simple" );
		node.hitchy.runtime.services.Static.toReplaceService.should.not.equal( "before-simple" );
		node.hitchy.runtime.services.Static.toReplaceService.should.equal( "after-cmfp" );

		node.hitchy.runtime.services.Static.staticProperty.should.equal( "original static service property" );
		node.hitchy.runtime.services.Static.staticMethod.should.be.Function();
		node.hitchy.runtime.services.Static.staticMethod().should.equal( "original static service method" );
	} );

	test( "exposes policy 'Static'", function() {
		node.hitchy.runtime.policies.should.have.ownProperty( "Static" );

		Should( node.hitchy.runtime.policies.Static.beforeSimpleFoundPolicy ).not.be.true();
		Should( node.hitchy.runtime.policies.Static.beforeCMFPFoundPolicy ).be.true();
		Should( node.hitchy.runtime.policies.Static.afterSimpleFoundPolicy ).be.true();
		Should( node.hitchy.runtime.policies.Static.afterCMFPFoundPolicy ).be.true();

		node.hitchy.runtime.policies.Static.toKeepPolicy.should.equal( "before-simple" );
		node.hitchy.runtime.policies.Static.toKeepPolicyToo.should.equal( "before-cmfp" );
		node.hitchy.runtime.policies.Static.toKeepPolicyLately.should.equal( "after-simple" );
		node.hitchy.runtime.policies.Static.toReplacePolicy.should.not.equal( "before-simple" );
		node.hitchy.runtime.policies.Static.toReplacePolicy.should.equal( "after-cmfp" );

		node.hitchy.runtime.policies.Static.staticProperty.should.equal( "original static policy property" );
		node.hitchy.runtime.policies.Static.staticMethod.should.be.Function();
		node.hitchy.runtime.policies.Static.staticMethod().should.equal( "original static policy method" );
	} );
} );
