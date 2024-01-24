module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				tansparent: 'transparent',
				current: 'currentColor',
				swDarkPurple: '#473356',
				swLightPurple: '#9C8BB8',
				swDarkenedPurple: '#70608a',
				swDarkGray: '#231F20',
				swLightGray: '#595B61',
				swCyan: '#4498C7',
				swBlueGray: '#51678C',
				swDeepBlue: '#024788',
			},
		},
	},
	plugins: [],
};
