"use strict";

const options = {
	projectFolder: "test/projects/exposure",
	// debug: true,
};

const { describe, it, after, before } = require( "mocha" );

const Should = require( "should" );
require( "should-http" );

const Test = require( "../../../tools" ).test;

// ----------------------------------------------------------------------------

describe( "Serving project with complex exposure", function() {
	const ctx = {};

	before( Test.before( ctx, options ) );
	after( Test.after( ctx ) );

	it( "provides access on exposed elements", function() {
		ctx.hitchy.api.runtime.should.be.ok();
		ctx.hitchy.api.runtime.should.have.ownProperty( "models" );
		ctx.hitchy.api.runtime.should.have.ownProperty( "controllers" );
		ctx.hitchy.api.runtime.should.have.ownProperty( "services" );
		ctx.hitchy.api.runtime.should.have.ownProperty( "policies" );
	} );

	it( "exposes model 'Static'", function() {
		ctx.hitchy.api.runtime.models.should.have.ownProperty( "Static" );

		ctx.hitchy.api.runtime.models.Static.beforeSimpleFoundModel.should.not.be.true();
		ctx.hitchy.api.runtime.models.Static.beforeCMFPFoundModel.should.be.true();
		ctx.hitchy.api.runtime.models.Static.afterSimpleFoundModel.should.be.true();
		ctx.hitchy.api.runtime.models.Static.afterCMFPFoundModel.should.be.true();

		ctx.hitchy.api.runtime.models.Static.toKeepModel.should.equal( "before-simple" );
		ctx.hitchy.api.runtime.models.Static.toKeepModelToo.should.equal( "before-cmfp" );
		ctx.hitchy.api.runtime.models.Static.toKeepModelLately.should.equal( "after-simple" );
		ctx.hitchy.api.runtime.models.Static.toReplaceModel.should.not.equal( "before-simple" );
		ctx.hitchy.api.runtime.models.Static.toReplaceModel.should.equal( "after-cmfp" );

		ctx.hitchy.api.runtime.models.Static.staticProperty.should.equal( "original static model property" );
		ctx.hitchy.api.runtime.models.Static.staticMethod.should.be.Function();
		ctx.hitchy.api.runtime.models.Static.staticMethod().should.equal( "original static model method" );
	} );

	it( "exposes controller 'Static'", function() {
		ctx.hitchy.api.runtime.controllers.should.have.ownProperty( "Static" );

		Should( ctx.hitchy.api.runtime.controllers.Static.beforeSimpleFoundController ).not.be.true();
		Should( ctx.hitchy.api.runtime.controllers.Static.beforeCMFPFoundController ).be.true();
		Should( ctx.hitchy.api.runtime.controllers.Static.afterSimpleFoundController ).be.true();
		Should( ctx.hitchy.api.runtime.controllers.Static.afterCMFPFoundController ).be.true();

		ctx.hitchy.api.runtime.controllers.Static.toKeepController.should.equal( "before-simple" );
		ctx.hitchy.api.runtime.controllers.Static.toKeepControllerToo.should.equal( "before-cmfp" );
		ctx.hitchy.api.runtime.controllers.Static.toKeepControllerLately.should.equal( "after-simple" );
		ctx.hitchy.api.runtime.controllers.Static.toReplaceController.should.not.equal( "before-simple" );
		ctx.hitchy.api.runtime.controllers.Static.toReplaceController.should.equal( "after-cmfp" );

		ctx.hitchy.api.runtime.controllers.Static.staticProperty.should.equal( "original static controller property" );
		ctx.hitchy.api.runtime.controllers.Static.staticMethod.should.be.Function();
		ctx.hitchy.api.runtime.controllers.Static.staticMethod().should.equal( "original static controller method" );
	} );

	it( "exposes service 'Static'", function() {
		ctx.hitchy.api.runtime.services.should.have.ownProperty( "Static" );

		Should( ctx.hitchy.api.runtime.services.Static.beforeSimpleFoundService ).not.be.true();
		Should( ctx.hitchy.api.runtime.services.Static.beforeCMFPFoundService ).be.true();
		Should( ctx.hitchy.api.runtime.services.Static.afterSimpleFoundService ).be.true();
		Should( ctx.hitchy.api.runtime.services.Static.afterCMFPFoundService ).be.true();

		ctx.hitchy.api.runtime.services.Static.toKeepService.should.equal( "before-simple" );
		ctx.hitchy.api.runtime.services.Static.toKeepServiceToo.should.equal( "before-cmfp" );
		ctx.hitchy.api.runtime.services.Static.toKeepServiceLately.should.equal( "after-simple" );
		ctx.hitchy.api.runtime.services.Static.toReplaceService.should.not.equal( "before-simple" );
		ctx.hitchy.api.runtime.services.Static.toReplaceService.should.equal( "after-cmfp" );

		ctx.hitchy.api.runtime.services.Static.staticProperty.should.equal( "original static service property" );
		ctx.hitchy.api.runtime.services.Static.staticMethod.should.be.Function();
		ctx.hitchy.api.runtime.services.Static.staticMethod().should.equal( "original static service method" );
	} );

	it( "exposes policy 'Static'", function() {
		ctx.hitchy.api.runtime.policies.should.have.ownProperty( "Static" );

		Should( ctx.hitchy.api.runtime.policies.Static.beforeSimpleFoundPolicy ).not.be.true();
		Should( ctx.hitchy.api.runtime.policies.Static.beforeCMFPFoundPolicy ).be.true();
		Should( ctx.hitchy.api.runtime.policies.Static.afterSimpleFoundPolicy ).be.true();
		Should( ctx.hitchy.api.runtime.policies.Static.afterCMFPFoundPolicy ).be.true();

		ctx.hitchy.api.runtime.policies.Static.toKeepPolicy.should.equal( "before-simple" );
		ctx.hitchy.api.runtime.policies.Static.toKeepPolicyToo.should.equal( "before-cmfp" );
		ctx.hitchy.api.runtime.policies.Static.toKeepPolicyLately.should.equal( "after-simple" );
		ctx.hitchy.api.runtime.policies.Static.toReplacePolicy.should.not.equal( "before-simple" );
		ctx.hitchy.api.runtime.policies.Static.toReplacePolicy.should.equal( "after-cmfp" );

		ctx.hitchy.api.runtime.policies.Static.staticProperty.should.equal( "original static policy property" );
		ctx.hitchy.api.runtime.policies.Static.staticMethod.should.be.Function();
		ctx.hitchy.api.runtime.policies.Static.staticMethod().should.equal( "original static policy method" );
	} );

	it( "supports explicit sorting via numeric prefixes", function() {
		ctx.hitchy.api.runtime.services.ActualFileMinorMajor.should.be.String().which.is.equal( "actual-file #6" );
		ctx.hitchy.api.runtime.services.LatestFileMinorMajor.should.be.String().which.is.equal( "latest-file #9" );
	} );
} );
