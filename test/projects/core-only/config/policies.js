module.exports = {
	"/view/read": "SessionPolicy",
	"POST /view/read/:id": "SessionPolicy.promised",
	"/view/create*": "SessionPolicy.promised",
};
