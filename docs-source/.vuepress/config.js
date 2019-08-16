module.exports = {
	base: "/core/",
	dest: "./docs",
	evergreen: true,
	title: "Hitchy Manual",
	themeConfig: {
		sidebar: "auto",
		displayAllHeaders: true,
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Tutorials", link: "/tutorials/" },
			{ text: "API", link: "/api/" },
			{ text: "Internals", link: "/internals/" },
			{ text: "Hitchy", items: [
					{ text: "Core", link: "/" },
					{ text: "Odem", link: "https://hitchyjs.github.io/plugin-odem/" },
			] },
		],
	},
};
