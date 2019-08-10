module.exports = {
	base: "/core/",
	dest: "./docs",
	evergreen: true,
	themeConfig: {
		sidebar: "auto",
		displayAllHeaders: true,
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Tutorials", link: "/tutorials/" },
			{ text: "API", link: "/api/" },
			{ text: "Internals", link: "/internals/" },
		],
	},
};
