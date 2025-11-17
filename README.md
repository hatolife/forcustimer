# Focus Timer

シンプルなポモドーロタイマーのWebアプリケーション(PWA)

[![CI/CD](https://github.com/xcd0/forcustimer/workflows/CI%2FCD/badge.svg)](https://github.com/xcd0/forcustimer/actions)

## 機能

- **25分の作業タイマー**: 集中して作業するための時間
- **5分の休憩タイマー**: リフレッシュのための休憩時間
- **シンプルなUI**: 3つのボタン(Start/Pause/Reset)のみ
- **PWA対応**: オフラインで動作、インストール可能

## デモ

[https://focus.hato.life/](https://focus.hato.life/)

## 開発

### 必要な環境

- Node.js 20.x
- npm

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build
```

### スクリプト

- `npm test` - テスト実行
- `npm run test:watch` - テストをwatch mode で実行
- `npm run test:coverage` - カバレッジ付きでテスト実行
- `npm run build` - プロダクションビルド
- `npm run serve` - ビルド済みファイルをローカルサーバーで確認
- `npm run dev` - ビルド & サーバー起動

## 技術スタック

- **TypeScript**: 型安全な開発
- **HTML/CSS**: シンプルなUI
- **Jest**: テストフレームワーク
- **PWA**: Progressive Web App
- **GitHub Actions**: CI/CD
- **GitHub Pages**: ホスティング

## 開発方針

- **TDD (Test-Driven Development)**: テスト駆動開発
- **80%以上のテストカバレッジ**: 高品質なコード
- **細かいコミット**: 変更を追跡しやすく

## プロジェクト構成

```
forcustimer/
├── src/
│   ├── index.html        # メインHTML
│   ├── styles.css        # スタイルシート
│   ├── app.ts            # アプリケーションロジック
│   └── timer.ts          # タイマーコアロジック
├── public/
│   ├── manifest.json     # PWAマニフェスト
│   ├── service-worker.js # Service Worker
│   └── icons/            # アイコン画像
├── tests/
│   └── timer.test.ts     # タイマーのテスト
├── dist/                 # ビルド成果物
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CDワークフロー
└── CLAUDE.md             # 仕様書
```

## ライセンス

MIT

## 作者

xcd0
