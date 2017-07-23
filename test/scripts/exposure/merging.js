"use strict";

let options = {
	projectFolder: "test/projects/exposure",
	//debug: true,
};

const Should = require( "should" );

const Test = require( "../../../tools" ).test;
const Hitchy = require( "../../../injector" )[process.env.HITCHY_MODE || "node"]( options );

// ----------------------------------------------------------------------------

suite( "Serving project with complex exposure", function() {
	suiteSetup( () => Test.startServer( Hitchy ) );
	suiteTeardown( () => Hitchy.stop() );

	test( "provides access on exposed elements", function() {
		Hitchy.hitchy.runtime.should.be.ok();
		Hitchy.hitchy.runtime.should.have.ownProperty( "models" );
		Hitchy.hitchy.runtime.should.have.ownProperty( "controllers" );
		Hitchy.hitchy.runtime.should.have.ownProperty( "services" );
		Hitchy.hitchy.runtime.should.have.ownProperty( "policies" );
	} );

	test( "exposes model 'static'", function() {
		Hitchy.hitchy.runtime.models.should.have.ownProperty( "static" );

		Should( Hitchy.hitchy.runtime.models.static.beforeSimpleFoundModel ).not.be.true();
		Should( Hitchy.hitchy.runtime.models.static.beforeCMFPFoundModel ).be.true();
		Should( Hitchy.hitchy.runtime.models.static.afterSimpleFoundModel ).be.true();
		Should( Hitchy.hitchy.runtime.models.static.afterCMFPFoundModel ).be.true();

		Hitchy.hitchy.runtime.models.static.toKeepModel.should.equal( "before-simple" );
		Hitchy.hitchy.runtime.models.static.toKeepModelToo.should.equal( "before-cmfp" );
		Hitchy.hitchy.runtime.models.static.toKeepModelLately.should.equal( "after-simple" );
		Hitchy.hitchy.runtime.models.static.toReplaceModel.should.not.equal( "before-simple" );
		Hitchy.hitchy.runtime.models.static.toReplaceModel.should.equal( "after-cmfp" );

		Hitchy.hitchy.runtime.models.static.staticProperty.should.equal( "original static model property" );
		Hitchy.hitchy.runtime.models.static.staticMethod.should.be.Function();
		Hitchy.hitchy.runtime.models.static.staticMethod().should.equal( "original static model method" );
	} );

	test( "exposes controller 'static'", function() {
		Hitchy.hitchy.runtime.controllers.should.have.ownProperty( "static" );

		Should( Hitchy.hitchy.runtime.controllers.static.beforeSimpleFoundController ).not.be.true();
		Should( Hitchy.hitchy.runtime.controllers.static.beforeCMFPFoundController ).be.true();
		Should( Hitchy.hitchy.runtime.controllers.static.afterSimpleFoundController ).be.true();
		Should( Hitchy.hitchy.runtime.controllers.static.afterCMFPFoundController ).be.true();

		Hitchy.hitchy.runtime.controllers.static.toKeepController.should.equal( "before-simple" );
		Hitchy.hitchy.runtime.controllers.static.toKeepControllerToo.should.equal( "before-cmfp" );
		Hitchy.hitchy.runtime.controllers.static.toKeepControllerLately.should.equal( "after-simple" );
		Hitchy.hitchy.runtime.controllers.static.toReplaceController.should.not.equal( "before-simple" );
		Hitchy.hitchy.runtime.controllers.static.toReplaceController.should.equal( "after-cmfp" );

		Hitchy.hitchy.runtime.controllers.static.staticProperty.should.equal( "original static controller property" );
		Hitchy.hitchy.runtime.controllers.static.staticMethod.should.be.Function();
		Hitchy.hitchy.runtime.controllers.static.staticMethod().should.equal( "original static controller method" );
	} );

	test( "exposes service 'static'", function() {
		Hitchy.hitchy.runtime.services.should.have.ownProperty( "static" );

		Should( Hitchy.hitchy.runtime.services.static.beforeSimpleFoundService ).not.be.true();
		Should( Hitchy.hitchy.runtime.services.static.beforeCMFPFoundService ).be.true();
		Should( Hitchy.hitchy.runtime.services.static.afterSimpleFoundService ).be.true();
		Should( Hitchy.hitchy.runtime.services.static.afterCMFPFoundService ).be.true();

		Hitchy.hitchy.runtime.services.static.toKeepService.should.equal( "before-simple" );
		Hitchy.hitchy.runtime.services.static.toKeepServiceToo.should.equal( "before-cmfp" );
		Hitchy.hitchy.runtime.services.static.toKeepServiceLately.should.equal( "after-simple" );
		Hitchy.hitchy.runtime.services.static.toReplaceService.should.not.equal( "before-simple" );
		Hitchy.hitchy.runtime.services.static.toReplaceService.should.equal( "after-cmfp" );

		Hitchy.hitchy.runtime.services.static.staticProperty.should.equal( "original static service property" );
		Hitchy.hitchy.runtime.services.static.staticMethod.should.be.Function();
		Hitchy.hitchy.runtime.services.static.staticMethod().should.equal( "original static service method" );
	} );

	test( "exposes policy 'static'", function() {
		Hitchy.hitchy.runtime.policies.should.have.ownProperty( "static" );

		Should( Hitchy.hitchy.runtime.policies.static.beforeSimpleFoundPolicy ).not.be.true();
		Should( Hitchy.hitchy.runtime.policies.static.beforeCMFPFoundPolicy ).be.true();
		Should( Hitchy.hitchy.runtime.policies.static.afterSimpleFoundPolicy ).be.true();
		Should( Hitchy.hitchy.runtime.policies.static.afterCMFPFoundPolicy ).be.true();

		Hitchy.hitchy.runtime.policies.static.toKeepPolicy.should.equal( "before-simple" );
		Hitchy.hitchy.runtime.policies.static.toKeepPolicyToo.should.equal( "before-cmfp" );
		Hitchy.hitchy.runtime.policies.static.toKeepPolicyLately.should.equal( "after-simple" );
		Hitchy.hitchy.runtime.policies.static.toReplacePolicy.should.not.equal( "before-simple" );
		Hitchy.hitchy.runtime.policies.static.toReplacePolicy.should.equal( "after-cmfp" );

		Hitchy.hitchy.runtime.policies.static.staticProperty.should.equal( "original static policy property" );
		Hitchy.hitchy.runtime.policies.static.staticMethod.should.be.Function();
		Hitchy.hitchy.runtime.policies.static.staticMethod().should.equal( "original static policy method" );
	} );
} );
