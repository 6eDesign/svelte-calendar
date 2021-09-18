/** @type {import('@sveltejs/kit').Config} */
import { replace } from 'svelte-preprocess';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import static_adapter from '@sveltejs/adapter-static';
import Prism from 'prismjs';
import 'prism-svelte';

const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		paths: !process.env.DEPLOY
			? {}
			: {
					base: '/svelte-calendar',
					assets: '/svelte-calendar'
			  },
		appDir: 'internal',
		adapter: static_adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: null
		})
		// package: {
		// 	emitTypes: false
		// }
	},
	preprocess: [
		replace([
			[
				/\/\/\s+\@example\((.*), (.*)\)/g,
				(_, name, path) => {
					const text = readFileSync(resolve('./src/lib/docs/examples', path), 'utf-8')
						.replace(/\'\.\.\/\.\.\/index\'/g, "'svelte-calendar'")
						.split(/\<!\-\- Example Notes \-\-\>/)
						.shift();
					const highlighted = Prism.highlight(text, Prism.languages.svelte, 'svelte');

					return `
  import ${name}Comp from '$lib/docs/examples/${path}';
  const ${name} = { component: ${name}Comp, code: ${JSON.stringify(highlighted)}}`;
				}
			]
		])
	]
};

export default config;
