//! UIとTimerクラスを統合するメインアプリケーション。

import { Timer, TimerState, TimerMode } from './timer';

//! アプリケーションクラス。
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
		//! 通知許可をリクエスト。
		this.requestNotificationPermission();

		//! Timerインスタンスを作成(完了コールバック付き)。
		this.timer = new Timer((mode) => this.onTimerComplete(mode));

		//! DOM要素を取得。
		this.timeDisplay = this.getElement('time');
		this.modeDisplay = this.getElement('mode');
		this.startBtn = this.getElement('start-btn') as HTMLButtonElement;
		this.pauseBtn = this.getElement('pause-btn') as HTMLButtonElement;
		this.resetBtn = this.getElement('reset-btn') as HTMLButtonElement;
		this.workModeBtn = this.getElement('work-mode-btn') as HTMLButtonElement;
		this.breakModeBtn = this.getElement('break-mode-btn') as HTMLButtonElement;

		//! イベントリスナーを設定。
		this.setupEventListeners();
		this.setupDebugButton();

		//! 初期表示を更新。
		this.updateDisplay();
	}

	//! DOM要素を安全に取得するヘルパーメソッド。
	private getElement(id: string): HTMLElement {
		const element = document.getElementById(id);
		if (!element) {
			throw new Error(`Element with id "${id}" not found`);
		}
		return element;
	}

	//! イベントリスナーを設定。
	private setupEventListeners(): void {
		//! Startボタン。
		this.startBtn.addEventListener('click', () => {
			this.clearCompletionEffects();
			this.timer.start();
			this.updateDisplay();
		});

		//! Pauseボタン。
		this.pauseBtn.addEventListener('click', () => {
			this.timer.pause();
			this.updateDisplay();
		});

		//! Resetボタン。
		this.resetBtn.addEventListener('click', () => {
			this.timer.reset();
			this.updateDisplay();
		});

		//! Workモードボタン。
		this.workModeBtn.addEventListener('click', () => {
			this.timer.setMode('work');
			this.updateDisplay();
			this.updateModeButtons();
		});

		//! Breakモードボタン。
		this.breakModeBtn.addEventListener('click', () => {
			this.timer.setMode('break');
			this.updateDisplay();
			this.updateModeButtons();
		});

		//! 1秒ごとに表示を更新。
		this.startUpdateLoop();
	}

	//! 表示更新ループを開始。
	private startUpdateLoop(): void {
		//! 既に実行中の場合は停止。
		if (this.updateIntervalId !== null) {
			clearInterval(this.updateIntervalId);
		}

		//! 100msごとにチェックして滑らかに更新。
		this.updateIntervalId = window.setInterval(() => {
			this.updateDisplay();
		}, 100);
	}

	//! 表示更新ループを停止。
	destroy(): void {
		if (this.updateIntervalId !== null) {
			clearInterval(this.updateIntervalId);
			this.updateIntervalId = null;
		}
	}

	//! 表示を更新。
	private updateDisplay(): void {
		const state = this.timer.getState();

		//! 時間表示を更新。
		this.timeDisplay.textContent = this.formatTime(state.remainingSeconds);

		//! モード表示を更新。
		this.modeDisplay.textContent =
			state.mode === 'work' ? 'Work' :
			state.mode === 'break' ? 'Break' :
			'Debug';

		//! ボタンの状態を更新。
		this.updateButtons(state);
	}

	//! 秒数をMM:SS形式にフォーマット。
	private formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	//! ボタンの有効/無効状態を更新。
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

	//! モードボタンのアクティブ状態を更新。
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

	//! 通知許可をリクエスト。
	private requestNotificationPermission(): void {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	//! タイマー完了時のコールバック。
	private onTimerComplete(mode: TimerMode): void {
		//! 表示を即座に更新 (00:00を表示)。
		this.updateDisplay();
		//! 完了時のUI効果を適用。
		this.showCompletionEffects(mode);
		//! 通知を表示。
		this.showNotification(mode);
	}

	//! 完了時のUI効果を表示。
	private showCompletionEffects(mode: TimerMode): void {
		const container = document.querySelector('.container');
		const timerDisplay = document.querySelector('.timer-display');
		const timeDisplay = document.querySelector('.time');
		const completeMessage = this.getElement('complete-message');

		console.log('[DEBUG] showCompletionEffects called, mode:', mode);

		//! 完了クラスを追加。
		container?.classList.add('completed');
		timerDisplay?.classList.add('completed');
		timeDisplay?.classList.add('completed');

		console.log('[DEBUG] Added completed classes');
		console.log('[DEBUG] container.classList:', container?.classList.toString());
		console.log('[DEBUG] timerDisplay.classList:', timerDisplay?.classList.toString());
		console.log('[DEBUG] timeDisplay.classList:', timeDisplay?.classList.toString());

		//! 完了メッセージを設定して表示。
		const message =
			mode === 'work' ? '作業時間終了！お疲れ様でした！' :
			mode === 'break' ? '休憩時間終了！' :
			'デバッグタイマー終了！';
		completeMessage.textContent = message;
		completeMessage.classList.add('show');
	}

	//! 完了効果をクリア。
	private clearCompletionEffects(): void {
		console.log('[DEBUG] clearCompletionEffects called');
		console.trace('[DEBUG] clearCompletionEffects stack trace');

		const container = document.querySelector('.container');
		const timerDisplay = document.querySelector('.timer-display');
		const timeDisplay = document.querySelector('.time');
		const completeMessage = this.getElement('complete-message');

		container?.classList.remove('completed');
		timerDisplay?.classList.remove('completed');
		timeDisplay?.classList.remove('completed');
		completeMessage.classList.remove('show');

		console.log('[DEBUG] Removed completed classes');
	}

	//! 通知を表示。
	private showNotification(mode: TimerMode): void {
		if (!('Notification' in window) || Notification.permission !== 'granted') {
			return;
		}

		const title =
			mode === 'work' ? '作業時間終了!' :
			mode === 'break' ? '休憩時間終了!' :
			'デバッグタイマー終了!';
		const body =
			mode === 'work' ? '25分の作業お疲れ様でした!' :
			mode === 'break' ? '5分の休憩終了です!' :
			'10秒のデバッグタイマーが終了しました!';

		new Notification(title, {
			body: body,
			icon: '/icons/icon-192x192.png',
			badge: '/icons/icon-96x96.png',
		});
	}

	/* DEBUG_START - デバッグボタンのセットアップ */
	private setupDebugButton(): void {
		const debugBtn = document.getElementById('debug-btn');
		if (debugBtn) {
			debugBtn.addEventListener('click', () => {
				this.timer.setMode('debug');
				this.updateDisplay();
				this.updateModeButtons();
			});
		}
	}
	/* DEBUG_END */
}

//! Service Workerを登録。
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

//! DOMが読み込まれたらアプリケーションを起動。
if (typeof document !== 'undefined') {
	document.addEventListener('DOMContentLoaded', () => {
		new App();
		registerServiceWorker();
	});
}

//! テスト用にエクスポート。
export { App };
