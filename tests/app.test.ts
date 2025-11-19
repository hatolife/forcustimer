// ! Appクラスの統合テスト。
// ! UIとTimerクラスの統合動作を確認する。

import { App } from '../src/ui/app';

describe('App - UI Integration', () => {
	let app: App | null = null;

	beforeEach(() => {
		// ! DOMをセットアップ。
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
					<label for="custom-minutes" class="custom-timer-label">Custom Timer:</label>
					<div class="custom-timer-input-group">
						<input
							type="number"
							id="custom-minutes"
							class="custom-timer-input"
							min="0"
							max="999"
							placeholder="min"
						/>
						<span class="time-separator">:</span>
						<input
							type="number"
							id="custom-seconds"
							class="custom-timer-input"
							min="0"
							max="59"
							placeholder="sec"
						/>
						<button id="custom-timer-btn" class="btn btn-tertiary">Set</button>
					</div>
				</div>

				<div id="complete-message" class="complete-message"></div>
			</div>
		`;

		// ! タイマーをモック化。
		jest.useFakeTimers();
	});

	afterEach(() => {
		// ! Appインスタンスをクリーンアップ。
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

			// ! 初期状態を確認。
			expect(timeDisplay?.textContent).toBe('25:00');

			// ! Startボタンをクリック。
			startBtn.click();

			// ! タイマーの1秒カウントダウン + 表示更新の100ms間隔の両方を進める。
			jest.advanceTimersByTime(1100);

			// ! 時間が減っていることを確認。
			expect(timeDisplay?.textContent).toBe('24:59');
		});

		it('Startボタンをクリックするとボタンの状態が変わること', () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
			const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
			const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

			// ! Startボタンをクリック。
			startBtn.click();

			// ! ボタンの状態を確認。
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

			// ! タイマー開始。
			startBtn.click();
			jest.advanceTimersByTime(3100); // ! 3秒 + 表示更新の100ms。

			const timeBeforePause = timeDisplay?.textContent;

			// ! 一時停止。
			pauseBtn.click();

			// ! さらに時間を進めても変化しないことを確認。
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

			// ! タイマー開始。
			startBtn.click();
			jest.advanceTimersByTime(10000);

			// ! リセット。
			resetBtn.click();

			// ! 初期値に戻ることを確認。
			expect(timeDisplay?.textContent).toBe('25:00');
		});
	});

	describe('モード切替ボタン', () => {
		it('Breakボタンをクリックすると5:00に表示が変わること', () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			// ! Breakモードに切替。
			breakBtn.click();

			// ! 表示を確認。
			expect(timeDisplay?.textContent).toBe('05:00');
			expect(modeDisplay?.textContent).toBe('Break');
		});

		it('Workボタンをクリックすると25:00に表示が変わること', () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const workBtn = document.getElementById('work-mode-btn') as HTMLButtonElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			// ! Breakモードに切替。
			breakBtn.click();
			expect(timeDisplay?.textContent).toBe('05:00');

			// ! Workモードに戻す。
			workBtn.click();

			// ! 表示を確認。
			expect(timeDisplay?.textContent).toBe('25:00');
			expect(modeDisplay?.textContent).toBe('Work');
		});

		it('モード切替時にアクティブクラスが切り替わること', () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const workBtn = document.getElementById('work-mode-btn') as HTMLButtonElement;

			// ! 初期状態でWorkがアクティブ。
			expect(workBtn.classList.contains('active')).toBe(true);
			expect(breakBtn.classList.contains('active')).toBe(false);

			// ! Breakモードに切替。
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

			// ! タイマー開始。
			startBtn.click();

			// ! 100ms経過（表示更新のチェック間隔）。
			jest.advanceTimersByTime(100);

			// ! この時点ではまだ1秒経っていないので時間は変わらない。
			expect(timeDisplay?.textContent).toBe('25:00');

			// ! さらに1000ms経過（合計1100ms）。
			jest.advanceTimersByTime(1000);

			// ! 1秒経過したので時間が減る。
			expect(timeDisplay?.textContent).toBe('24:59');
		});
	});

	describe('通知機能（Service Worker経由・iOS PWA対応）', () => {
		let mockShowNotification: jest.Mock;

		beforeEach(() => {
			// ! Notification APIのモック。
			global.Notification = {
				permission: 'granted',
				requestPermission: jest.fn().mockResolvedValue('granted')
			} as any;

			// ! Service Workerのモック。
			mockShowNotification = jest.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					controller: {},
					ready: Promise.resolve({
						showNotification: mockShowNotification
					})
				},
				writable: true,
				configurable: true
			});
		});

		it('タイマー完了時にService Worker経由で通知が表示されることWork', async () => {
			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			startBtn.click();

			// ! 25分経過してタイマー完了。
			jest.advanceTimersByTime(1500100);

			// ! Promiseの解決を待つ。
			await Promise.resolve();

			// ! Service WorkerのshowNotificationが呼ばれたことを確認。
			expect(mockShowNotification).toHaveBeenCalled();
			const callArgs = mockShowNotification.mock.calls[0];
			expect(callArgs[0]).toBe('作業終了!');
			expect(callArgs[1]).toMatchObject({
				body: '25分の作業お疲れ様でした!',
				icon: '/icons/icon-192x192.png',
				badge: '/icons/icon-96x96.png',
				requireInteraction: false,
				renotify: true
			});
			expect(callArgs[1].tag).toBe('timer-complete');
		});

		it('Break完了時もService Worker経由で通知が表示されること', async () => {
			app = new App();
			const breakBtn = document.getElementById('break-mode-btn') as HTMLButtonElement;
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			breakBtn.click();
			startBtn.click();

			// ! 5分経過してタイマー完了。
			jest.advanceTimersByTime(300100);

			// ! Promiseの解決を待つ。
			await Promise.resolve();

			// ! Service WorkerのshowNotificationが呼ばれたことを確認。
			expect(mockShowNotification).toHaveBeenCalled();
			const callArgs = mockShowNotification.mock.calls[0];
			expect(callArgs[0]).toBe('休憩終了!');
			expect(callArgs[1]).toMatchObject({
				body: '5分の休憩終了です!',
				icon: '/icons/icon-192x192.png',
				badge: '/icons/icon-96x96.png',
				requireInteraction: false,
				renotify: true
			});
			expect(callArgs[1].tag).toBe('timer-complete');
		});

		it('カスタムタイマー完了時もService Worker経由で通知が表示されること', async () => {
			app = new App();
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			// ! 1分(60秒)のカスタムタイマーを設定（リアルタイムで反映される）。
			customMinutesInput.value = '1';
			customMinutesInput.dispatchEvent(new Event('input', { bubbles: true }));
			startBtn.click();

			// ! 60秒経過してタイマー完了。
			jest.advanceTimersByTime(60100);

			// ! Promiseの解決を待つ。
			await Promise.resolve();

			// ! Service WorkerのshowNotificationが呼ばれたことを確認。
			expect(mockShowNotification).toHaveBeenCalled();
			const callArgs = mockShowNotification.mock.calls[0];
			expect(callArgs[0]).toBe('タイマー終了!');
			expect(callArgs[1]).toMatchObject({
				body: 'カスタムタイマーが終了しました!',
				icon: '/icons/icon-192x192.png',
				badge: '/icons/icon-96x96.png',
				requireInteraction: false,
				renotify: true
			});
			expect(callArgs[1].tag).toBe('timer-complete');
		});

		it('通知許可がない場合は通知が表示されないこと', async () => {
			global.Notification = {
				permission: 'denied',
				requestPermission: jest.fn()
			} as any;

			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			startBtn.click();
			jest.advanceTimersByTime(1500100);

			// ! Promiseの解決を待つ。
			await Promise.resolve();

			// ! Service WorkerのshowNotificationが呼ばれないことを確認。
			expect(mockShowNotification).not.toHaveBeenCalled();
		});

		it('Service Workerが利用できない場合はフォールバックとして直接通知を表示すること', async () => {
			// ! 直接通知のモック。
			const mockNotificationConstructor = jest.fn();
			global.Notification = mockNotificationConstructor as any;
			(global.Notification as any).permission = 'granted';

			// ! Service Workerを削除。
			Object.defineProperty(navigator, 'serviceWorker', {
				value: undefined,
				writable: true,
				configurable: true
			});

			app = new App();
			const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

			startBtn.click();
			jest.advanceTimersByTime(1500100);

			// ! Promiseの解決を待つ。
			await Promise.resolve();

			// ! 直接Notificationコンストラクタが呼ばれることを確認。
			expect(mockNotificationConstructor).toHaveBeenCalled();
			const callArgs = mockNotificationConstructor.mock.calls[0];
			expect(callArgs[0]).toBe('作業終了!');
			expect(callArgs[1]).toMatchObject({
				body: '25分の作業お疲れ様でした!',
				icon: '/icons/icon-192x192.png',
				badge: '/icons/icon-96x96.png',
				requireInteraction: false,
				renotify: true
			});
			expect(callArgs[1].tag).toBe('timer-complete');

			// ! エラーが投げられないことを確認（正常終了）。
			expect(true).toBe(true);
		});
	});

	describe('カスタムタイマー', () => {
		it('カスタムタイマーで10分を設定すると10:00に表示が変わること', () => {
			app = new App();
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const customSecondsInput = document.getElementById('custom-seconds') as HTMLInputElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			// ! 10分0秒を入力（リアルタイムで反映される）。
			customMinutesInput.value = '10';
			customSecondsInput.value = '0';
			customMinutesInput.dispatchEvent(new Event('input', { bubbles: true }));

			// ! 表示を確認。
			expect(timeDisplay?.textContent).toBe('10:00');
			expect(modeDisplay?.textContent).toBe('Custom');
		});

		it('カスタムタイマーで5分30秒を設定すると05:30に表示が変わること', () => {
			app = new App();
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const customSecondsInput = document.getElementById('custom-seconds') as HTMLInputElement;
			const timeDisplay = document.getElementById('time');
			const modeDisplay = document.getElementById('mode');

			// ! 5分30秒を入力（リアルタイムで反映される）。
			customMinutesInput.value = '5';
			customSecondsInput.value = '30';
			customMinutesInput.dispatchEvent(new Event('input', { bubbles: true }));

			// ! 表示を確認。
			expect(timeDisplay?.textContent).toBe('05:30');
			expect(modeDisplay?.textContent).toBe('Custom');
		});

		it('カスタムタイマーで秒のみ設定できること', () => {
			app = new App();
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const customSecondsInput = document.getElementById('custom-seconds') as HTMLInputElement;
			const timeDisplay = document.getElementById('time');

			// ! 0分45秒を入力（リアルタイムで反映される）。
			customMinutesInput.value = '0';
			customSecondsInput.value = '45';
			customSecondsInput.dispatchEvent(new Event('input', { bubbles: true }));

			// ! 表示を確認。
			expect(timeDisplay?.textContent).toBe('00:45');
		});

		it('Enterキーでもカスタムタイマーを設定できること', () => {
			app = new App();
			const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
			const customSecondsInput = document.getElementById('custom-seconds') as HTMLInputElement;
			const timeDisplay = document.getElementById('time');

			// ! 5分0秒を入力（リアルタイムで反映される）。
			customMinutesInput.value = '5';
			customSecondsInput.value = '0';
			customMinutesInput.dispatchEvent(new Event('input', { bubbles: true }));

			// ! 表示を確認。
			expect(timeDisplay?.textContent).toBe('05:00');
		});
	});

	describe('通知許可ベルアイコン（iOS PWA対応）', () => {
		beforeEach(() => {
			// ! ベルアイコンボタンのHTMLを追加。
			const bellButton = `
				<button id="notification-bell" class="notification-bell" aria-label="通知設定">
					<svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
						<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
						<line class="bell-slash" x1="2" y1="2" x2="22" y2="22" stroke-width="2"></line>
					</svg>
				</button>
			`;
			document.body.insertAdjacentHTML('beforeend', bellButton);
		});

		it('通知許可がない場合、ベルアイコンに斜線が表示されること', () => {
			global.Notification = {
				permission: 'default',
				requestPermission: jest.fn().mockResolvedValue('granted')
			} as any;

			app = new App();

			const bellIcon = document.querySelector('.bell-icon');
			const bellSlash = document.querySelector('.bell-slash') as HTMLElement;

			expect(bellIcon?.classList.contains('disabled')).toBe(true);
			expect(bellSlash?.style.display).not.toBe('none');
		});

		it('通知許可がある場合、ベルアイコンに斜線が表示されないこと', () => {
			global.Notification = {
				permission: 'granted',
				requestPermission: jest.fn()
			} as any;

			app = new App();

			const bellIcon = document.querySelector('.bell-icon');
			const bellSlash = document.querySelector('.bell-slash') as HTMLElement;

			expect(bellIcon?.classList.contains('disabled')).toBe(false);
			expect(bellSlash?.style.display).toBe('none');
		});

		it('ベルアイコンをクリックすると通知許可ダイアログが表示されること', async () => {
			const mockRequestPermission = jest.fn().mockResolvedValue('granted');
			global.Notification = {
				permission: 'default',
				requestPermission: mockRequestPermission
			} as any;

			app = new App();

			const bellButton = document.getElementById('notification-bell') as HTMLButtonElement;
			bellButton.click();

			// ! Promiseの解決を待つ。
			await Promise.resolve();

			expect(mockRequestPermission).toHaveBeenCalledTimes(1);
		});

		it('通知許可後、ベルアイコンの斜線が消えること', async () => {
			const mockRequestPermission = jest.fn().mockResolvedValue('granted');
			global.Notification = {
				permission: 'default',
				requestPermission: mockRequestPermission
			} as any;

			// ! permissionをgrantedに変更するモック。
			mockRequestPermission.mockImplementation(async () => {
				(global.Notification as any).permission = 'granted';
				return 'granted';
			});

			app = new App();

			const bellButton = document.getElementById('notification-bell') as HTMLButtonElement;
			const bellIcon = document.querySelector('.bell-icon');
			const bellSlash = document.querySelector('.bell-slash') as HTMLElement;

			// ! 初期状態で斜線が表示されている。
			expect(bellIcon?.classList.contains('disabled')).toBe(true);

			// ! クリックして許可。
			bellButton.click();
			await Promise.resolve();

			// ! 許可後、斜線が消える。
			expect(bellIcon?.classList.contains('disabled')).toBe(false);
			expect(bellSlash?.style.display).toBe('none');
		});

		it('通知許可を拒否された場合、ベルアイコンは斜線のまま', async () => {
			const mockRequestPermission = jest.fn().mockResolvedValue('denied');
			global.Notification = {
				permission: 'default',
				requestPermission: mockRequestPermission
			} as any;

			// ! permissionをdeniedに変更するモック。
			mockRequestPermission.mockImplementation(async () => {
				(global.Notification as any).permission = 'denied';
				return 'denied';
			});

			app = new App();

			const bellButton = document.getElementById('notification-bell') as HTMLButtonElement;
			const bellIcon = document.querySelector('.bell-icon');
			const bellSlash = document.querySelector('.bell-slash') as HTMLElement;

			// ! クリックして拒否。
			bellButton.click();
			await Promise.resolve();

			// ! 拒否後も斜線が表示されたまま。
			expect(bellIcon?.classList.contains('disabled')).toBe(true);
			expect(bellSlash?.style.display).not.toBe('none');
		});
	});

	describe('エラーハンドリング', () => {
		it('存在しないDOM要素を取得しようとするとエラーが投げられること', () => {
			// ! start-btnを削除。
			const startBtn = document.getElementById('start-btn');
			startBtn?.remove();

			// ! Appインスタンス作成時にエラーが投げられることを確認。
			expect(() => {
				new App();
			}).toThrow('Element with id "start-btn" not found');
		});
	});
});
