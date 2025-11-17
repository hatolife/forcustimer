# ポモドーロタイマー - プロジェクト仕様書

## プロジェクト概要
シンプルなポモドーロタイマーのWebアプリケーション(PWA)

## 技術スタック
- TypeScript
- HTML/CSS
- PWA (Progressive Web App)
- Jest (テスト)
- GitHub Actions (CI/CD)
- GitHub Pages (ホスティング)

## 開発方針
- TDD (Test-Driven Development) による開発
- 常にTodoリストを更新しながら作業
- 細かく頻繁にcommit & push
- 早期にCIを設定し、実行結果をghコマンドで確認

## 機能要件

### 基本機能
- **25分タイマー**: 作業時間用のタイマー
- **5分タイマー**: 休憩時間用のタイマー
- **開始(Start)**: タイマーを開始
- **中断(Pause)**: タイマーを一時停止
- **終了(Reset)**: タイマーをリセット

### 制約
- 上記3つのボタン以外のUI要素は含めない
- 時間のカスタマイズ機能なし
- 統計・履歴機能なし
- 通知機能なし (最小限の実装)

### PWA要件
- オフラインで動作可能
- インストール可能
- manifest.json
- Service Worker

## ディレクトリ構成
```
forcustimer/
├── src/
│   ├── index.html
│   ├── styles.css
│   ├── app.ts
│   ├── timer.ts
│   └── service-worker.ts
├── public/
│   └── manifest.json
├── tests/
│   ├── timer.test.ts
│   └── app.test.ts
├── dist/           # ビルド出力先
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── tsconfig.json
├── jest.config.js
└── CLAUDE.md      # このファイル
```

## タイマー仕様

### TimerState
```typescript
type TimerMode = 'work' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerState {
	mode: TimerMode;        // 'work' (25分) または 'break' (5分)
	status: TimerStatus;    // 'idle', 'running', 'paused'
	remainingSeconds: number; // 残り秒数
}
```

### Timer Class
```typescript
class Timer {
	private state: TimerState;
	private intervalId: number | null;

	constructor();
	start(): void;          // タイマー開始
	pause(): void;          // タイマー一時停止
	reset(): void;          // タイマーリセット
	getState(): TimerState; // 現在の状態取得
	setMode(mode: TimerMode): void; // モード切替
}
```

### 動作仕様
1. 初期状態: work mode, idle status, 25分 (1500秒)
2. startボタン: running statusに変更、1秒ごとにremainingSecondsをデクリメント
3. pauseボタン: paused statusに変更、カウントダウン停止
4. resetボタン: idle statusに変更、remainingSecondsをモードのデフォルト値にリセット
5. remainingSecondsが0になったら自動的にidle statusに戻る

## テスト要件
- Timer クラスの単体テスト
- UI統合テスト
- テストカバレッジ 80%以上

## CI/CD要件
- プルリクエスト時に自動テスト実行
- mainブランチへのpush時にGitHub Pagesへ自動デプロイ
- テスト失敗時はデプロイしない
- 公開URL: https://focus.hato.life/

## 開発手順
1. 仕様書作成 (このファイル) ✓
2. プロジェクト設定 (package.json, tsconfig.json)
3. GitHub Actions設定
4. テスト環境セットアップ
5. Timer クラスのテスト作成 (TDD Red)
6. Timer クラスの実装 (TDD Green)
7. Timer クラスのリファクタリング (TDD Refactor)
8. UI のテスト作成
9. UI の実装
10. PWA設定
11. GitHub Pages デプロイ

## コミットメッセージ規約
Angular Conventional Commit形式に従う:
- feat: 新機能
- fix: バグ修正
- test: テスト追加・修正
- chore: ビルド・設定変更
- docs: ドキュメント更新
- refactor: リファクタリング

例: `feat: Timerクラスの基本機能を実装`

## ライセンス
CC0 1.0 Universal (Public Domain)
