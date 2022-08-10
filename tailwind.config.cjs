/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');
const Values = require('values.js');

const color = new Values(process.env.MAIN_COLOUR || '#0c6291');

let colours = {};
const allColours = color.all(20);

for (let i = 0; i < allColours.length; i++) {
	let shade = i * 100;
	colours[shade] = allColours[i].hexString();
}

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Avenir',
					'Century Gothic',
					'CenturyGothic',
					'Apple Gothic',
					...defaultTheme.fontFamily.sans
				]
			},
			colors: {
				primary: { ...colours }
			}
		}
	},
	plugins: [require('@tailwindcss/typography')],
	darkMode: 'class'
};
