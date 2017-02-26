module.exports = {
	"GET /": "ViewController",
	"/view/read": "ViewController.read",
	"/view/read/:id": "ViewController.read",
	"/view/body": "ViewController.bodyNormal",
	"POST /view/body": "ViewController.bodyPosted",
	"/view/create/:name": "ViewController.create",
	"/view/create/:id?": "ViewController.create",
	"POST /view/create/:name+": "ViewController.create",
};
