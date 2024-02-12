import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [],
	css: {
		preprocessorOptions: {
			less: {
				math: 'always',
				relativeUrls: true,
				modifyVars: {},
				javascriptEnabled: true,
			},
		},
	}
});
