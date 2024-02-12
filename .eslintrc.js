module.exports = {
	env: {
		browser: true,
	    es6: true,
		jquery: true,
	},
	extends: [
		'eslint:recommended',
		'airbnb-base',
		'eslint-config-prettier',
	],
	rules: {
		'import/prefer-default-export': 'off',
		'no-bitwise': 'off',
		'no-plusplus': 'off',
		'no-restricted-globals': 'off',
	},
};
