import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit({
      experimental: {
        inspector: true
      }
    })
  ]
};

export default config;
