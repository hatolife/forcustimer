#!/usr/bin/env node
//! ビルド後のJSファイルのimport文に.js拡張子を追加するスクリプト。

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

//! distディレクトリ内のすべての.jsファイルを処理。
function fixImportsInFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');

	//! import文のパスに.js拡張子を追加。
	//! import { ... } from './module' → import { ... } from './module.js'
	//! import { ... } from '../module' → import { ... } from '../module.js'
	const fixedContent = content.replace(
		/from\s+['"](\.\.[\/\\][^'"]+|\.\/[^'"]+)['"]/g,
		(match, modulePath) => {
			//! 既に.jsで終わっている場合はそのまま。
			if (modulePath.endsWith('.js')) {
				return match;
			}
			//! .js拡張子を追加。
			return match.replace(modulePath, modulePath + '.js');
		}
	);

	//! ファイルに書き戻す。
	if (content !== fixedContent) {
		fs.writeFileSync(filePath, fixedContent, 'utf8');
		console.log(`Fixed imports in: ${path.basename(filePath)}`);
	}
}

//! distディレクトリ内の全.jsファイルを処理。
function processDirectory(dir) {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			processDirectory(filePath);
		} else if (file.endsWith('.js') && !file.endsWith('.map')) {
			fixImportsInFile(filePath);
		}
	}
}

//! メイン処理。
if (fs.existsSync(distDir)) {
	console.log('Fixing ES module imports...');
	processDirectory(distDir);
	console.log('Done!');
} else {
	console.error('dist directory not found');
	process.exit(1);
}
