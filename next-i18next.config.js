/** @type {import('next-i18next').UserConfig} */
const path = require("path");
module.exports = {
	i18n: {
		defaultLocale: "en",
		locales: ["en", "vi"],
		localeDetection: false,
	},
	localePath: path.resolve("./public/locales"),
};
