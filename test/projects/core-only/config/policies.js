module.exports = {
	policies: {
		"/view/read": "SessionPolicy",
		"POST /view/read/:id": "Session.promised",
		"/view/create*": "SEssIONPolicy.promised",
	}
};
