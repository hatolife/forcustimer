//! Appクラスの統合テスト。
//! UIとTimerクラスの統合動作を確認する。

import { App } from '../src/ui/app';

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

				<div class="custom-timer-section">
					<label for="custom-minutes" class="custom-timer-label">Custom Timer (minutes):</label>
					<div class="custom-timer-input-group">
						<input
							type="number"
							id="custom-minutes"
							class="custom-timer-input"
							min="1"
							max="999"
							placeholder="e.g. 10"
						/>
						<button id="custom-timer-btn" class="btn btn-tertiary">Set</button>
					</div>
				</div>

				<div id="complete-message" class="complete-message"></div>
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

	describe('通知機能', () => {
		beforeEach(() => {
			//! Notification APIのモック。
			global.Notification = {
				permission: 'granted',
				requestPermission: jest.fn().mockResolvedValue('granted'),
			} as any;
		});

		it('タイマー完了時に通知が表示されること', () => {
			const mockNotification = jest.fn();
			global.Notification = mockNotification as any;
			(global.Notification as any).permission = 'granted';

			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			startBtn.click();

			//! 25分経過してタイマー完了。
			jest.advanceTimersByTime(1500100);

			//! 通知が呼ばれたことを確認。
			expect(mockNotification).toHaveBeenCalledWith(
				'作業時間終了!',
				expect.objectContaining({
					body: '25分の作業お疲れ様でした!',
					icon: '/icons/icon-192x192.png',
				})
			);
		});

		it('Break完了時も通知が表示されること', () => {
			const mockNotification = jest.fn();
			global.Notification = mockNotification as any;
			(global.Notification as any).permission = 'granted';

			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			breakBtn.click();
			startBtn.click();

			//! 5分経過してタイマー完了。
			jest.advanceTimersByTime(300100);

			//! 通知が呼ばれたことを確認。
			expect(mockNotification).toHaveBeenCalledWith(
				'休憩時間終了!',
				expect.objectContaining({
					body: '5分の休憩終了です!',
					icon: '/icons/icon-192x192.png',
				})
			);
		});

		it('通知許可がない場合は通知が表示されないこと', () => {
			const mockNotification = jest.fn();
			global.Notification = mockNotification as any;
			(global.Notification as any).permission = 'denied';

			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			startBtn.click();
			jest.advanceTimersByTime(1500100);

			//! 通知が呼ばれないことを確認。
			expect(mockNotification).not.toHaveBeenCalled();
		});
	});

	describe('カスタムタイマー', () => {
		it('カスタムタイマーで10分を設定すると10:00に表示が変わること', () => {
			app = new App();
			const customTimerBtn = document.getElementById('custom-timer-btn') as HTMLButtonElement;
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			//! 10分を入力してSetボタンをクリック。
			customMinutesInput.value = '10';
			customTimerBtn.click();

			//! 表示を確認。
			expect(timeDisplay?.textContent).toBe('10:00');
			expect(modeDisplay?.textContent).toBe('Custom');
		});

		it('カスタムタイマー完了時も通知が表示されること', () => {
			const mockNotification = jest.fn();
			global.Notification = mockNotification as any;
			(global.Notification as any).permission = 'granted';

			app = new App();
			const customTimerBtn = document.getElementById('custom-timer-btn') as HTMLButtonElement;
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			//! 1分(60秒)のカスタムタイマーを設定。
			customMinutesInput.value = '1';
			customTimerBtn.click();
			startBtn.click();

			//! 60秒経過してタイマー完了。
			jest.advanceTimersByTime(60100);

			//! 通知が呼ばれたことを確認。
			expect(mockNotification).toHaveBeenCalledWith(
				'カスタムタイマー終了!',
				expect.objectContaining({
					body: 'カスタムタイマーが終了しました!',
					icon: '/icons/icon-192x192.png',
				})
			);
		});

		it('Enterキーでもカスタムタイマーを設定できること', () => {
			app = new App();
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const timeDisplay = document.getElementById('time');

			//! 5分を入力してEnterキーを押す。
			customMinutesInput.value = '5';
			const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
			customMinutesInput.dispatchEvent(enterEvent);

			//! 表示を確認。
			expect(timeDisplay?.textContent).toBe('05:00');
		});
	});

	describe('通知許可リクエスト', () => {
		it('Notification.permission が default の場合にリクエストが呼ばれること', () => {
			const mockRequestPermission = jest.fn().mockResolvedValue('granted');
			global.Notification = {
				permission: 'default',
				requestPermission: mockRequestPermission,
			} as any;

			app = new App();

			expect(mockRequestPermission).toHaveBeenCalledTimes(1);
		});

		it('Notification.permission が granted の場合にリクエストが呼ばれないこと', () => {
			const mockRequestPermission = jest.fn();
			global.Notification = {
				permission: 'granted',
				requestPermission: mockRequestPermission,
			} as any;

			app = new App();

			expect(mockRequestPermission).not.toHaveBeenCalled();
		});
	});

	describe('エラーハンドリング', () => {
		it('存在しないDOM要素を取得しようとするとエラーが投げられること', () => {
			//! start-btnを削除。
			const startBtn = document.getElementById('start-btn');
			startBtn?.remove();

			//! Appインスタンス作成時にエラーが投げられることを確認。
			expect(() => {
				new App();
			}).toThrow('Element with id "start-btn" not found');
		});
	});
});
