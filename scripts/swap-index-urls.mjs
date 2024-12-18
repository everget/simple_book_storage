import fs from 'fs';
import path from 'path';

const MODE = process.argv.includes('--dev')
	? 'dev'
	: process.argv.includes('--prod')
		? 'prod'
		: null;

if (!MODE) {
	console.warn('No mode specified. Will toggle between dev and prod.');
}

const distAssetPattern = /="dist\/assets\/[\w\d-]+\./;
const distCssPattern = /<link\s+rel="stylesheet"\s+crossorigin\s+href="dist\/assets\/[\w\d-]+\.css"\s*\/?>/;

function directoryExists(dirPath) {
	return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function getFileNamesFromDirectory(dirPath) {
	return fs.readdirSync(dirPath);
}

function getAssetPaths(assetFiles) {
	const jsPath = assetFiles.find((file) => file.endsWith('.js'));
	const cssPath = assetFiles.find((file) => file.endsWith('.css'));
	const paths = {};

	if (jsPath) {
		paths.js = jsPath;
	}

	if (cssPath) {
		paths.css = cssPath;
	}

	return paths;
}

function changeToProd(htmlContent, assetPaths) {
	let updatedHtmlContent = htmlContent.replace(/\/src\/main\.js/g, `dist/assets/${assetPaths.js}`);

	if (!distCssPattern.test(htmlContent)) {
		updatedHtmlContent = updatedHtmlContent.replace(
			/<\/script>\s+<\/head>/,
			`</script><link rel="stylesheet" crossorigin href="dist/assets/${assetPaths.css}" />\n</head>`
		);
	}

	return updatedHtmlContent;
}

function changeToDev(htmlContent) {
	return htmlContent
		.replace(/dist\/assets\/[\w\d-]+\.js/g, '/src/main.js')
		.replace(distCssPattern, '');
}

function updateIndexHtml(htmlContent, assetFiles) {
	const assetPaths = getAssetPaths(assetFiles);

	if (MODE === 'prod') {
		return changeToProd(htmlContent, assetPaths);
	} else if (MODE === 'dev') {
		return changeToDev(htmlContent);
	} else {
		if (distAssetPattern.test(htmlContent)) {
			return changeToDev(htmlContent);
		}
		return changeToProd(htmlContent, assetPaths);
	}
}

function main() {
	const distAssetsPath = path.join(process.cwd(), 'dist', 'assets');
	const indexHtmlPath = path.join(process.cwd(), 'index.html');

	if (directoryExists(distAssetsPath)) {
		const assetFiles = getFileNamesFromDirectory(distAssetsPath);

		if (fs.existsSync(indexHtmlPath)) {
			let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
			htmlContent = updateIndexHtml(htmlContent, assetFiles);
			fs.writeFileSync(indexHtmlPath, htmlContent);
			console.log('index.html has been updated with asset references.');
		} else {
			console.error('index.html not found.');
		}
	} else {
		console.error('./dist/assets directory not found.');
	}
}

main();
