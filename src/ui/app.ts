// ! UIとTimerクラスを統合するメインアプリケーション。

import { Timer, TimerMode, TimerState } from '../core/timer';

// ! アプリケーションクラス。
class App {
	private timer: Timer;
	private timeDisplay: HTMLElement;
	private modeDisplay: HTMLElement;
	private startBtn: HTMLButtonElement;
	private pauseBtn: HTMLButtonElement;
	private resetBtn: HTMLButtonElement;
	private workModeBtn: HTMLButtonElement;
	private breakModeBtn: HTMLButtonElement;
	private updateIntervalId: number | null = null;

	constructor() {
		// ! Timerインスタンスを作成(完了コールバック付き)。
		this.timer = new Timer((mode) => this.onTimerComplete(mode));

		// ! DOM要素を取得。
		this.timeDisplay = this.getElement('time');
		this.modeDisplay = this.getElement('mode');
		this.startBtn = this.getElement('start-btn') as HTMLButtonElement;
		this.pauseBtn = this.getElement('pause-btn') as HTMLButtonElement;
		this.resetBtn = this.getElement('reset-btn') as HTMLButtonElement;
		this.workModeBtn = this.getElement('work-mode-btn') as HTMLButtonElement;
		this.breakModeBtn = this.getElement('break-mode-btn') as HTMLButtonElement;

		// ! イベントリスナーを設定。
		this.setupEventListeners();

		// ! 初期表示を更新。
		this.updateDisplay();

		// ! 通知許可ベルアイコンをセットアップ（iOS PWA対応）。
		this.setupNotificationBellIcon();
	}

	// ! DOM要素を安全に取得するヘルパーメソッド。
	private getElement(id: string): HTMLElement {
		const element = document.getElementById(id);
		if (!element) {
			throw new Error(`Element with id "${id}" not found`);
		}
		return element;
	}

	// ! イベントリスナーを設定。
	private setupEventListeners(): void {
		// ! Startボタン。
		this.startBtn.addEventListener('click', () => {
			this.clearCompletionEffects();
			this.timer.start();
			this.updateDisplay();
		});

		// ! Pauseボタン。
		this.pauseBtn.addEventListener('click', () => {
			this.timer.pause();
			this.updateDisplay();
		});

		// ! Resetボタン。
		this.resetBtn.addEventListener('click', () => {
			this.timer.reset();
			this.updateDisplay();
		});

		// ! Workモードボタン。
		this.workModeBtn.addEventListener('click', () => {
			this.timer.setMode('work');
			this.updateDisplay();
			this.updateModeButtons();
		});

		// ! Breakモードボタン。
		this.breakModeBtn.addEventListener('click', () => {
			this.timer.setMode('break');
			this.updateDisplay();
			this.updateModeButtons();
		});

		// ! カスタムタイマーボタン。
		this.setupCustomTimer();

		// ! 1秒ごとに表示を更新。
		this.startUpdateLoop();
	}

	// ! 表示更新ループを開始。
	private startUpdateLoop(): void {
		// ! 既に実行中の場合は停止。
		if (this.updateIntervalId !== null) {
			clearInterval(this.updateIntervalId);
		}

		// ! 100msごとにチェックして滑らかに更新。
		this.updateIntervalId = window.setInterval(() => {
			this.updateDisplay();
		}, 100);
	}

	// ! 表示更新ループを停止。
	destroy(): void {
		if (this.updateIntervalId !== null) {
			clearInterval(this.updateIntervalId);
			this.updateIntervalId = null;
		}
	}

	// ! 表示を更新。
	private updateDisplay(): void {
		const state = this.timer.getState();

		// ! 時間表示を更新。
		this.timeDisplay.textContent = this.formatTime(state.remainingSeconds);

		// ! モード表示を更新。
		this.modeDisplay.textContent = state.mode === 'work'
			? 'Work'
			: state.mode === 'break'
			? 'Break'
			: 'Custom';

		// ! ボタンの状態を更新。
		this.updateButtons(state);
	}

	// ! 秒数をMM:SS形式にフォーマット。
	private formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// ! ボタンの有効/無効状態を更新。
	private updateButtons(state: TimerState): void {
		switch (state.status) {
			case 'idle':
				this.startBtn.disabled = false;
				this.pauseBtn.disabled = true;
				this.resetBtn.disabled = true;
				break;
			case 'running':
				this.startBtn.disabled = true;
				this.pauseBtn.disabled = false;
				this.resetBtn.disabled = false;
				break;
			case 'paused':
				this.startBtn.disabled = false;
				this.pauseBtn.disabled = true;
				this.resetBtn.disabled = false;
				break;
		}
	}

	// ! モードボタンのアクティブ状態を更新。
	private updateModeButtons(): void {
		const state = this.timer.getState();
		if (state.mode === 'work') {
			this.workModeBtn.classList.add('active');
			this.breakModeBtn.classList.remove('active');
		} else {
			this.workModeBtn.classList.remove('active');
			this.breakModeBtn.classList.add('active');
		}
	}

	// ! 通知許可ベルアイコンをセットアップ（iOS PWA対応）。
	private setupNotificationBellIcon(): void {
		const bellButton = document.getElementById('notification-bell');
		if (!bellButton) {
			return;
		}

		// ! 初期表示を更新。
		this.updateNotificationBellIcon();

		// ! クリックイベントを設定。
		bellButton.addEventListener('click', () => this.handleNotificationBellClick());
	}

	// ! ベルアイコンの表示を更新。
	private updateNotificationBellIcon(): void {
		if (!('Notification' in window)) {
			return;
		}

		const bellButton = document.getElementById('notification-bell');
		const bellIcon = document.querySelector('.bell-icon');
		const bellSlash = document.querySelector('.bell-slash') as HTMLElement;

		if (!bellButton || !bellIcon || !bellSlash) {
			return;
		}

		// ! 通知許可状態に応じて表示を切り替え。
		if (Notification.permission === 'granted') {
			// ! 許可済み: ボタンを非表示。
			bellButton.classList.add('hidden');
			bellIcon.classList.remove('disabled');
			bellSlash.style.display = 'none';
		} else {
			// ! 未許可: ボタンを表示し、斜線を表示。
			bellButton.classList.remove('hidden');
			bellIcon.classList.add('disabled');
			bellSlash.style.display = '';
		}
	}

	// ! ベルアイコンクリック時のハンドラー。
	private async handleNotificationBellClick(): Promise<void> {
		if (!('Notification' in window)) {
			console.warn('このブラウザは通知をサポートしていません');
			return;
		}

		// ! 既に許可済みの場合は何もしない。
		if (Notification.permission === 'granted') {
			console.log('通知は既に許可されています');
			return;
		}

		try {
			// ! 通知許可をリクエスト。
			console.log('通知許可をリクエストします...');
			const permission = await Notification.requestPermission();
			console.log('通知許可リクエスト結果:', permission);

			// ! 許可状態が変わったらアイコンを更新。
			this.updateNotificationBellIcon();

			// ! 許可された場合はテスト通知を表示。
			if (permission === 'granted') {
				console.log('通知が許可されました。テスト通知を表示します。');
				new Notification('通知が有効になりました', {
					body: 'タイマー終了時に通知が表示されます',
					icon: '/icons/icon-192x192.png',
					tag: 'notification-enabled'
				});
			}
		} catch (error) {
			console.error('通知許可リクエストに失敗:', error);
		}
	}

	// ! タイマー完了時のコールバック。
	private onTimerComplete(mode: TimerMode): void {
		// ! 表示を即座に更新 (00:00を表示)。
		this.updateDisplay();
		// ! 完了時のUI効果を適用。
		this.showCompletionEffects(mode);
		// ! 通知を表示。
		this.showNotification(mode);
	}

	// ! 完了時のUI効果を表示。
	private showCompletionEffects(mode: TimerMode): void {
		const container = document.querySelector('.container');
		const timerDisplay = document.querySelector('.timer-display');
		const timeDisplay = document.querySelector('.time');
		const completeMessage = this.getElement('complete-message');

		// ! 完了クラスを追加。
		container?.classList.add('completed');
		timerDisplay?.classList.add('completed');
		timeDisplay?.classList.add('completed');

		// ! 完了メッセージを設定して表示。
		const message = mode === 'work'
			? '作業時間終了！お疲れ様でした！'
			: mode === 'break'
			? '休憩時間終了！'
			: 'カスタムタイマー終了！';
		completeMessage.textContent = message;
		completeMessage.classList.add('show');
	}

	// ! 完了効果をクリア。
	private clearCompletionEffects(): void {
		const container = document.querySelector('.container');
		const timerDisplay = document.querySelector('.timer-display');
		const timeDisplay = document.querySelector('.time');
		const completeMessage = this.getElement('complete-message');

		container?.classList.remove('completed');
		timerDisplay?.classList.remove('completed');
		timeDisplay?.classList.remove('completed');
		completeMessage.classList.remove('show');
	}

	// ! 通知を表示（PC・iOS PWA両対応）。
	private async showNotification(mode: TimerMode): Promise<void> {
		console.log('showNotification called, mode:', mode);
		console.log('Notification.permission:', Notification.permission);

		if (!('Notification' in window)) {
			console.warn('このブラウザは通知をサポートしていません');
			return;
		}

		if (Notification.permission !== 'granted') {
			console.warn('通知許可が得られていません。許可状態:', Notification.permission);
			return;
		}

		const title = mode === 'work'
			? '作業時間終了!'
			: mode === 'break'
			? '休憩時間終了!'
			: 'カスタムタイマー終了!';
		const body = mode === 'work'
			? '25分の作業お疲れ様でした!'
			: mode === 'break'
			? '5分の休憩終了です!'
			: 'カスタムタイマーが終了しました!';

		const options: NotificationOptions & { renotify?: boolean; } = {
			body: body,
			icon: '/icons/icon-192x192.png',
			badge: '/icons/icon-96x96.png',
			requireInteraction: false,
			tag: 'timer-complete', // ! 固定タグ。
			renotify: true // ! 同じタグでも再通知。
		};

		console.log('通知を表示します:', title, options);

		// ! PCブラウザでは直接通知を表示（最も確実）。
		try {
			const notification = new Notification(title, options);
			console.log('直接通知を作成しました:', notification);
			return;
		} catch (error) {
			console.error('直接通知の作成に失敗:', error);
		}

		// ! フォールバック: Service Worker経由で通知を表示（PWA対応）。
		if (navigator.serviceWorker && navigator.serviceWorker.controller) {
			try {
				const registration = await navigator.serviceWorker.ready;
				await registration.showNotification(title, options);
				console.log('Service Worker経由で通知を表示しました');
			} catch (error) {
				console.error('Service Worker通知も失敗:', error);
			}
		}
	}

	// ! カスタムタイマーのセットアップ。
	private setupCustomTimer(): void {
		const customTimerBtn = document.getElementById('custom-timer-btn');
		const customMinutesInput = document.getElementById('custom-minutes') as HTMLInputElement;
		const customSecondsInput = document.getElementById('custom-seconds') as HTMLInputElement;

		if (customTimerBtn && customMinutesInput && customSecondsInput) {
			customTimerBtn.addEventListener('click', () => {
				const minutes = parseInt(customMinutesInput.value || '0', 10);
				const seconds = parseInt(customSecondsInput.value || '0', 10);

				// ! 入力値の検証。
				if (isNaN(minutes) || minutes < 0 || minutes > 999) {
					alert('分は0〜999の範囲で入力してください。');
					return;
				}

				if (isNaN(seconds) || seconds < 0 || seconds > 59) {
					alert('秒は0〜59の範囲で入力してください。');
					return;
				}

				// ! 両方0の場合はエラー。
				if (minutes === 0 && seconds === 0) {
					alert('時間を入力してください。');
					return;
				}

				// ! カスタムタイマーを設定。
				this.timer.setCustomTime(minutes, seconds);
				this.updateDisplay();
				this.updateModeButtons();

				// ! 入力欄をクリア。
				customMinutesInput.value = '';
				customSecondsInput.value = '';
			});

			// ! Enterキーでも設定できるようにする。
			const handleEnter = (e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					customTimerBtn.click();
				}
			};
			customMinutesInput.addEventListener('keypress', handleEnter);
			customSecondsInput.addEventListener('keypress', handleEnter);
		}
	}
}

// ! Service Workerを登録。
function registerServiceWorker(): void {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('Service Worker registered:', registration);
				})
				.catch((error) => {
					console.log('Service Worker registration failed:', error);
				});
		});
	}
}

// ! DOMが読み込まれたらアプリケーションを起動。
if (typeof document !== 'undefined') {
	document.addEventListener('DOMContentLoaded', () => {
		new App();
		registerServiceWorker();
	});
}

// ! テスト用にエクスポート。
export { App };
