# Icons

PWAのアイコン画像を配置するディレクトリです。

## 必要なアイコンサイズ

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 生成方法

以下のコマンドでSVGから各サイズのPNGを生成できます:

```bash
# ImageMagickを使用する場合
convert -background none -size 512x512 icon.svg icon-512x512.png
# その他のサイズも同様に生成
```

または、オンラインツールを使用:

- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

## デザイン

- ベースカラー: #667eea (紫)
- シンボル: タイマー/時計のアイコン
- シンプルでモダンなデザイン
