import dotenv from 'dotenv';
dotenv.config();

// import adapter from '@sveltejs/adapter-auto';
// Although auto works locally, seems in CI/CD environments, node is not available as an adapter unless installed manually.
import adapter from '@sveltejs/adapter-node';

import preprocess from 'svelte-preprocess';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: adapter({
			out: 'dist'
		})
	}
};

export default config;
