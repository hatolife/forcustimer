//! Appクラスの統合テスト。
//! UIとTimerクラスの統合動作を確認する。

import { App } from '../src/app';

describe('App - UI Integration', () => {
	let app: App | null = null;

	beforeEach(() => {
		//! DOMをセットアップ。
		document.body.innerHTML = `
			<div class="container">
				<h1>Focus Timer</h1>

				<div class="timer-display">
					<div id="mode" class="mode">Work</div>
					<div id="time" class="time">25:00</div>
				</div>

				<div class="controls">
					<button id="start-btn" class="btn btn-primary">Start</button>
					<button id="pause-btn" class="btn btn-secondary" disabled>Pause</button>
					<button id="reset-btn" class="btn btn-tertiary" disabled>Reset</button>
				</div>

				<div class="mode-switch">
					<button id="work-mode-btn" class="mode-btn active">Work (25min)</button>
					<button id="break-mode-btn" class="mode-btn">Break (5min)</button>
				</div>
			</div>
		`;

		//! タイマーをモック化。
		jest.useFakeTimers();
	});

	afterEach(() => {
		//! Appインスタンスをクリーンアップ。
		if (app) {
			app.destroy();
			app = null;
		}
		jest.useRealTimers();
		document.body.innerHTML = '';
	});

	describe('初期表示', () => {
		it('初期状態でWork mode, 25:00が表示されること', () => {
			app = new App();

			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			expect(timeDisplay?.textContent).toBe('25:00');
			expect(modeDisplay?.textContent).toBe('Work');
		});

		it('初期状態でStartボタンのみ有効であること', () => {
			app = new App();

			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
			const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

			expect(startBtn.disabled).toBe(false);
			expect(pauseBtn.disabled).toBe(true);
			expect(resetBtn.disabled).toBe(true);
		});
	});

	describe('Startボタン', () => {
		it('Startボタンをクリックするとタイマーが開始すること', () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');

			//! 初期状態を確認。
			expect(timeDisplay?.textContent).toBe('25:00');

			//! Startボタンをクリック。
			startBtn.click();

			//! タイマーの1秒カウントダウン + 表示更新の100ms間隔の両方を進める。
			jest.advanceTimersByTime(1100);

			//! 時間が減っていることを確認。
			expect(timeDisplay?.textContent).toBe('24:59');
		});

		it('Startボタンをクリックするとボタンの状態が変わること', () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
			const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

			//! Startボタンをクリック。
			startBtn.click();

			//! ボタンの状態を確認。
			expect(startBtn.disabled).toBe(true);
			expect(pauseBtn.disabled).toBe(false);
			expect(resetBtn.disabled).toBe(false);
		});
	});

	describe('Pauseボタン', () => {
		it('Pauseボタンをクリックするとタイマーが一時停止すること', () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');

			//! タイマー開始。
			startBtn.click();
			jest.advanceTimersByTime(3100); //! 3秒 + 表示更新の100ms。

			const timeBeforePause = timeDisplay?.textContent;

			//! 一時停止。
			pauseBtn.click();

			//! さらに時間を進めても変化しないことを確認。
			jest.advanceTimersByTime(5000);

			expect(timeDisplay?.textContent).toBe(timeBeforePause);
		});
	});

	describe('Resetボタン', () => {
		it('Resetボタンをクリックするとタイマーがリセットされること', () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');

			//! タイマー開始。
			startBtn.click();
			jest.advanceTimersByTime(10000);

			//! リセット。
			resetBtn.click();

			//! 初期値に戻ることを確認。
			expect(timeDisplay?.textContent).toBe('25:00');
		});
	});

	describe('モード切替ボタン', () => {
		it('Breakボタンをクリックすると5:00に表示が変わること', () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			//! Breakモードに切替。
			breakBtn.click();

			//! 表示を確認。
			expect(timeDisplay?.textContent).toBe('05:00');
			expect(modeDisplay?.textContent).toBe('Break');
		});

		it('Workボタンをクリックすると25:00に表示が変わること', () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const workBtn = document.getElementById('work-mode-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			//! Breakモードに切替。
			breakBtn.click();
			expect(timeDisplay?.textContent).toBe('05:00');

			//! Workモードに戻す。
			workBtn.click();

			//! 表示を確認。
			expect(timeDisplay?.textContent).toBe('25:00');
			expect(modeDisplay?.textContent).toBe('Work');
		});

		it('モード切替時にアクティブクラスが切り替わること', () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const workBtn = document.getElementById('work-mode-btn') as HTMLButtonElement;

			//! 初期状態でWorkがアクティブ。
			expect(workBtn.classList.contains('active')).toBe(true);
			expect(breakBtn.classList.contains('active')).toBe(false);

			//! Breakモードに切替。
			breakBtn.click();

			expect(workBtn.classList.contains('active')).toBe(false);
			expect(breakBtn.classList.contains('active')).toBe(true);
		});
	});

	describe('実行中の表示更新', () => {
		it('タイマー実行中は100msごとに表示が更新されること', () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');

			//! タイマー開始。
			startBtn.click();

			//! 100ms経過（表示更新のチェック間隔）。
			jest.advanceTimersByTime(100);

			//! この時点ではまだ1秒経っていないので時間は変わらない。
			expect(timeDisplay?.textContent).toBe('25:00');

			//! さらに1000ms経過（合計1100ms）。
			jest.advanceTimersByTime(1000);

			//! 1秒経過したので時間が減る。
			expect(timeDisplay?.textContent).toBe('24:59');
		});
	});
});
