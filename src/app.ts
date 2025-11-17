//! UIとTimerクラスを統合するメインアプリケーション。

import { Timer, TimerState } from './timer';

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

	constructor() {
		//! Timerインスタンスを作成。
		this.timer = new Timer();

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
		setInterval(() => {
			const state = this.timer.getState();
			if (state.status === 'running') {
				this.updateDisplay();
			}
		}, 100); //! 100msごとにチェックして滑らかに更新。
	}

	//! 表示を更新。
	private updateDisplay(): void {
		const state = this.timer.getState();

		//! 時間表示を更新。
		this.timeDisplay.textContent = this.formatTime(state.remainingSeconds);

		//! モード表示を更新。
		this.modeDisplay.textContent = state.mode === 'work' ? 'Work' : 'Break';

		//! ボタンの状態を更新。
		this.updateButtons(state);

		//! アニメーション効果。
		if (state.status === 'running') {
			this.timeDisplay.classList.add('running');
		} else {
			this.timeDisplay.classList.remove('running');
		}
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
}

//! DOMが読み込まれたらアプリケーションを起動。
if (typeof document !== 'undefined') {
	document.addEventListener('DOMContentLoaded', () => {
		new App();
	});
}

//! テスト用にエクスポート。
export { App };
