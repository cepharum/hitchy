module.exports = {
	"GET /": "VIEWController",
	"/view/read": "ViewController.read",
	"/view/read/:id": "ViewController.read",
	"/view/body": "viewController.bodyNormal",
	"POST /view/body": "ViewController.bodyPosted",
	"/view/create/:name": "View.create",
	"/view/create/:id?": "ViewController.create",
	"POST /view/create/:name+": "ViewController.create",
};
