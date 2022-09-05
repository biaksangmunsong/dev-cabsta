module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		screens: {
			"3xs": "320px",
			"2xs": "380px",
			"xs": "550px",
			"sm": "640px",
			"md": "768px",
			"lg": "1024px",
			"xl": "1280px",
			"2xl": "1536px"
		},
		extend: {
			"fontFamily": {
				"defaultBold": "BeVietnamProBold, sans-serif",
				"defaultRegular": "BeVietnamProRegular, sans-serif"
			}
		}
	},
	plugins: []
}