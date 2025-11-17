#!/usr/bin/env node
//! SVGアイコンから各サイズのPNG画像を生成するスクリプト。

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const distIconsDir = path.join(__dirname, '..', 'dist', 'icons');

//! distのiconsディレクトリを作成。
if (!fs.existsSync(distIconsDir)) {
	fs.mkdirSync(distIconsDir, { recursive: true });
}

//! ImageMagick (convert) が利用可能かチェック。
function hasImageMagick() {
	try {
		execSync('convert -version', { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

//! SVGファイルを読み込み、data URIとして各サイズのHTMLを生成してPNGに変換。
if (hasImageMagick()) {
	console.log('ImageMagickでPNG画像を生成中...');
	sizes.forEach(size => {
		const outputPath = path.join(distIconsDir, `icon-${size}x${size}.png`);
		try {
			execSync(`convert -background none -resize ${size}x${size} "${svgPath}" "${outputPath}"`);
			console.log(`Generated: icon-${size}x${size}.png`);
		} catch (error) {
			console.error(`Failed to generate icon-${size}x${size}.png:`, error.message);
		}
	});
} else {
	console.log('ImageMagickが見つかりません。SVGファイルをコピーします。');
	//! ImageMagickがない場合、SVGを全サイズ用にコピー (フォールバック)。
	sizes.forEach(size => {
		const outputPath = path.join(distIconsDir, `icon-${size}x${size}.svg`);
		fs.copyFileSync(svgPath, outputPath);
		console.log(`Copied SVG as: icon-${size}x${size}.svg`);
	});

	console.warn('\n警告: PNG画像を生成するにはImageMagickをインストールしてください。');
	console.warn('Ubuntu/Debian: sudo apt-get install imagemagick');
	console.warn('macOS: brew install imagemagick');
	console.warn('Windows: https://imagemagick.org/script/download.php\n');
}
