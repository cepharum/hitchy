module.exports = {
	"GET /test": "TestController.index",
	"GET /missing-controller": "MissingController.index",
	"GET /missing-method": "TestController.SomeMethod",
	"GET /something": "TestController.someMethod",
	"GET /addon": "TestController.addOn",
};
