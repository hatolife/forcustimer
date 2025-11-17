#!/bin/bash
#! アイコン生成スクリプト。

set -e

cd "$(dirname "$0")/.."

SIZES=(72 96 128 144 152 192 384 512)
SVG_FILE="public/icons/icon.svg"
OUTPUT_DIR="public/icons"

#! ImageMagickがインストールされているか確認。
if ! command -v convert &> /dev/null; then
	echo "Error: ImageMagick is not installed."
	echo "Please install ImageMagick:"
	echo "  Ubuntu/Debian: sudo apt install imagemagick"
	echo "  macOS: brew install imagemagick"
	exit 1
fi

echo "Generating PNG icons from SVG..."

for size in "${SIZES[@]}"; do
	output_file="${OUTPUT_DIR}/icon-${size}x${size}.png"
	echo "  Generating ${output_file}..."
	convert -background none -size "${size}x${size}" "${SVG_FILE}" "${output_file}"
done

echo "Done! Generated ${#SIZES[@]} icon files."
