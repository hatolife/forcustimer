# Focus Timer - 機能仕様書

## 1. プロジェクト概要

### 1.1 プロジェクト名

Focus Timer (forcustimer)

### 1.2 概要

シンプルで使いやすいポモドーロタイマーのPWA (Progressive Web App)。
25分の作業時間と5分の休憩時間を管理し、集中力を最大化するための生産性ツール。

### 1.3 公開URL

https://focus.hato.life/

### 1.4 ライセンス

MIT License

## 2. 技術スタック

### 2.1 フロントエンド

- **言語**: TypeScript 5.3.3
- **マークアップ**: HTML5
- **スタイル**: CSS3 (モジュール構造)
- **PWA**: Service Worker, Web Manifest

### 2.2 開発環境

- **パッケージマネージャ**: npm
- **テストフレームワーク**: Jest 29.7.0
- **テスト環境**: jsdom
- **ビルドツール**: TypeScript Compiler (tsc)
- **フォーマッター**: dprint

### 2.3 CI/CD

- **CI**: GitHub Actions
- **ホスティング**: GitHub Pages
- **自動デプロイ**: masterブランチへのpush時

### 2.4 開発ツール

- **バージョン管理**: Git
- **リポジトリ**: GitHub
- **ローカルサーバー**: http-server

## 3. ディレクトリ構成

```
forcustimer/
├── src/                      # ソースコード
│   ├── core/                 # コアロジック
│   │   └── timer.ts          # Timerクラス
│   ├── ui/                   # UI関連
│   │   └── app.ts            # Appクラス (UIとTimerの統合)
│   ├── styles/               # スタイルシート
│   │   ├── variables.css     # CSS変数
│   │   ├── base.css          # ベーススタイル
│   │   └── layouts/          # レイアウト
│   │       ├── default.css   # デフォルトレイアウト
│   │       ├── small.css     # 小画面レイアウト
│   │       └── ultra-small.css # 超小画面レイアウト
│   ├── index.html            # エントリーHTML
│   └── styles.css            # メインCSS (importをまとめる)
├── public/                   # 公開ファイル
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Service Worker
│   └── icons/                # アプリアイコン
├── tests/                    # テストコード
│   ├── timer.test.ts         # Timerクラスのテスト
│   └── app.test.ts           # Appクラスのテスト
├── scripts/                  # ビルドスクリプト
│   ├── fix-imports.js        # ES module import修正
│   └── generate-icons.js     # アイコン生成
├── dist/                     # ビルド出力先
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD設定
├── package.json              # npm設定
├── tsconfig.json             # TypeScript設定
├── jest.config.js            # Jest設定
├── CLAUDE.md                 # 開発用仕様書
├── SPEC.md                   # このファイル
└── README.md                 # プロジェクト説明
```

## 4. 機能仕様

### 4.1 基本機能

#### 4.1.1 タイマーモード

1. **Workモード**: 25分 (1500秒) の作業時間
2. **Breakモード**: 5分 (300秒) の休憩時間
3. **Customモード**: ユーザー指定の任意の時間 (分・秒)

#### 4.1.2 タイマー操作

- **Start**: タイマーを開始
- **Pause**: タイマーを一時停止
- **Reset**: タイマーをリセット
- **モード切替**: Work/Breakモードを切り替え

#### 4.1.3 カスタムタイマー

- 分 (0-999分) と秒 (0-59秒) を個別に設定可能
- 入力後「Set」ボタンでタイマーに適用
- Enterキーでも設定可能

### 4.2 通知機能

#### 4.2.1 通知許可

- 通知未許可時: 右上にベルアイコン（斜線付き）を表示
- ベルアイコンクリック: 通知許可をリクエスト
- 許可後: テスト通知を表示し、ベルアイコンを非表示
- 通知許可済み: ベルアイコンは表示されない

#### 4.2.2 タイマー完了通知

- **Workモード完了**: 「作業時間終了! - 25分の作業お疲れ様でした!」
- **Breakモード完了**: 「休憩時間終了! - 5分の休憩終了です!」
- **Customモード完了**: 「カスタムタイマー終了! - カスタムタイマーが終了しました!」

#### 4.2.3 通知方法

1. **PCブラウザ**: 直接 `new Notification()` で通知
2. **iOS PWA**: Service Worker経由で通知 (`registration.showNotification()`)
3. **フォールバック**: 直接通知が失敗した場合、Service Worker経由を試行

### 4.3 UI/UX機能

#### 4.3.1 タイマー表示

- **時間表示**: MM:SS形式 (例: 25:00, 05:00)
- **モード表示**: Work / Break / Custom
- **進捗**: リアルタイムで更新 (100msごと)

#### 4.3.2 完了エフェクト

- コンテナの背景色変更
- タイマー表示のアニメーション
- 完了メッセージの表示
  - Work: 「作業時間終了！お疲れ様でした！」
  - Break: 「休憩時間終了！」
  - Custom: 「カスタムタイマー終了！」

#### 4.3.3 ボタン状態管理

- **idle状態**: Startのみ有効
- **running状態**: Pause, Resetのみ有効
- **paused状態**: Start, Resetのみ有効

### 4.4 PWA機能

#### 4.4.1 オフライン対応

- Service Workerによるキャッシング
- キャッシュ対象:
  - HTML, CSS, JavaScript
  - manifest.json
  - アイコン (72x72 〜 512x512px)

#### 4.4.2 インストール機能

- ホーム画面に追加可能
- スタンドアロンモードで起動
- アプリアイコン: 8サイズ (72, 96, 128, 144, 152, 192, 384, 512px)

#### 4.4.3 ショートカット

- **Work**: 25分の作業タイマーを開始
- **Break**: 5分の休憩タイマーを開始

## 5. 技術仕様

### 5.1 Timerクラス

#### 5.1.1 型定義

```typescript
type TimerMode = 'work' | 'break' | 'custom';
type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerState {
	mode: TimerMode;
	status: TimerStatus;
	remainingSeconds: number;
}

type TimerCompleteCallback = (mode: TimerMode) => void;
```

#### 5.1.2 主要メソッド

- `constructor(onComplete?: TimerCompleteCallback)`: インスタンス生成
- `start()`: タイマー開始
- `pause()`: タイマー一時停止
- `reset()`: タイマーリセット
- `getState()`: 現在の状態を取得
- `setMode(mode: TimerMode)`: モード変更
- `setCustomTime(minutes: number, seconds: number)`: カスタムタイマー設定

#### 5.1.3 内部実装

- **時刻ベース更新**: `Date.now()` からの経過時間で残り時間を計算
- **高精度**: 100msごとにtick (バックグラウンドでも正確)
- **自動停止**: 残り時間が0になると自動的にidle状態に戻る
- **完了コールバック**: タイマー完了時にコールバックを実行

### 5.2 Appクラス

#### 5.2.1 責務

- TimerクラスとUIの統合
- DOM操作
- イベントハンドリング
- 通知管理

#### 5.2.2 主要メソッド

- `constructor()`: 初期化
- `updateDisplay()`: 表示更新
- `showNotification(mode: TimerMode)`: 通知表示
- `setupNotificationBellIcon()`: 通知ベルアイコンのセットアップ
- `handleNotificationBellClick()`: ベルアイコンクリック処理
- `onTimerComplete(mode: TimerMode)`: タイマー完了時の処理

### 5.3 Service Worker

#### 5.3.1 キャッシュ戦略

- **Cache First**: キャッシュがあればそれを返す
- **Network Fallback**: キャッシュがない場合はネットワークから取得
- **Dynamic Cache**: 新規リソースも自動的にキャッシュ

#### 5.3.2 バージョン管理

- キャッシュ名: `focus-timer-v{バージョン番号}`
- 古いキャッシュの自動削除

#### 5.3.3 通知処理

- 通知クリック時: アプリを開く (既存ウィンドウがあればフォーカス)

## 6. テスト仕様

### 6.1 テスト方針

- **TDD**: テストファースト開発
- **カバレッジ目標**: 80%以上 (現在: 90.62%)

### 6.2 テストケース

#### 6.2.1 Timerクラス (timer.test.ts)

- 初期状態のテスト
- start/pause/reset機能のテスト
- モード切替のテスト
- カスタムタイマーのテスト
- 時間経過のテスト
- 完了コールバックのテスト

#### 6.2.2 Appクラス (app.test.ts)

- UI統合テスト
- ボタン状態管理のテスト
- 通知機能のテスト
- カスタムタイマーUIのテスト
- 完了エフェクトのテスト

### 6.3 テスト実行

```bash
npm test              # テスト実行
npm run test:watch    # watch モード
npm run test:coverage # カバレッジ測定
```

## 7. ビルド・デプロイ

### 7.1 ビルドプロセス

1. `npm run clean`: distディレクトリを削除
2. `tsc`: TypeScriptをコンパイル
3. `npm run fix-imports`: ES module importを修正
4. `npm run generate-icons`: アイコンを生成 (ImageMagick使用)
5. `npm run copy-files`: HTML, CSS, manifestなどをdistにコピー

### 7.2 ローカル開発

```bash
npm run build   # ビルド
npm run serve   # ローカルサーバー起動 (http://localhost:8080)
npm run dev     # ビルド & サーブ
```

### 7.3 CI/CD

- **トリガー**: masterブランチへのpush
- **CI**: テスト実行 & カバレッジチェック
- **CD**: テスト成功時にGitHub Pagesへ自動デプロイ
- **確認**: `gh run list` でCI/CD状態を確認

## 8. ブラウザ互換性

### 8.1 対応ブラウザ

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)
- iOS Safari (PWA対応)
- Android Chrome (PWA対応)

### 8.2 必須API

- Notification API
- Service Worker API
- Web App Manifest
- localStorage (未使用だが将来的に利用可能)

## 9. パフォーマンス

### 9.1 最適化

- タイマー更新: 100ms間隔 (滑らかな表示)
- Service Worker: 静的リソースのキャッシング
- CSS: モジュール構造によるメンテナンス性向上
- TypeScript: 型安全性による実行時エラーの削減

### 9.2 リソースサイズ

- HTML: ~3KB
- CSS: ~8KB
- JavaScript: ~15KB (minify前)
- アイコン: 72x72 〜 512x512px (8サイズ)

## 10. セキュリティ

### 10.1 Content Security Policy

- デフォルトでは設定なし
- 必要に応じてHTTPヘッダーで設定可能

### 10.2 HTTPS

- GitHub Pages: 強制HTTPS
- Service Worker: HTTPSが必須

## 11. アクセシビリティ

### 11.1 基本対応

- セマンティックHTML
- aria-label属性 (通知ベルアイコン)
- キーボード操作: Enterキーでカスタムタイマー設定

### 11.2 将来的な改善案

- スクリーンリーダー対応の強化
- キーボードショートカット
- ハイコントラストモード

## 12. 開発規約

### 12.1 コミットメッセージ

Angular Conventional Commit形式:

- `feat:` - 新機能
- `fix:` - バグ修正
- `test:` - テスト追加・修正
- `chore:` - ビルド・設定変更
- `docs:` - ドキュメント更新
- `refactor:` - リファクタリング

### 12.2 コードスタイル

- インデント: タブ
- コメント: 日本語、句点必須
- 関数分割: 短いコードでも機能ごとに関数化
- エラーハンドリング: try-catchで適切に処理

### 12.3 開発フロー

1. 機能追加・修正
2. テスト実行 (`npm test`)
3. ビルド (`npm run build`)
4. コミット (規約に従う)
5. プッシュ
6. CI/CD確認 (`gh run list`)

## 13. 今後の拡張案

### 13.1 機能追加案

- 統計・履歴機能
- セッション数のカウント
- 長期休憩 (15分) モード
- 音声通知
- テーマカスタマイズ

### 13.2 技術的改善案

- IndexedDB による履歴保存
- Web Share API
- Vibration API (スマホ対応)
- Background Sync API

## 14. 変更履歴

### v0.1.0 (初期リリース)

- 基本タイマー機能 (Work/Break)
- カスタムタイマー機能
- 通知機能 (PC/iOS PWA対応)
- PWA対応
- CI/CD設定
- GitHub Pages デプロイ

## 15. お問い合わせ・貢献

### 15.1 リポジトリ

GitHub: https://github.com/hatolife/forcustimer

### 15.2 Issue報告

バグ報告・機能要望はGitHub Issuesへ

### 15.3 貢献方法

1. Fork
2. Feature Branch作成
3. コミット (規約に従う)
4. Push
5. Pull Request作成
