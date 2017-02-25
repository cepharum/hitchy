module.exports = {
	"/view/read": "ViewController.read",
	"/view/read/:id": "ViewController.read",
	"/view/body": "ViewController.bodyNormal",
	"POST /view/body": "ViewController.bodyPosted",
	"/view/create": "ViewController.create",
	"/view/create/:name": "ViewController.create",
	"/view/create(/:id)?": "ViewController.create",
};
