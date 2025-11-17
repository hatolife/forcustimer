//! ポモドーロタイマーのコアロジック。
//! 25分の作業時間と5分の休憩時間を管理する。

//! タイマーのモード。
export type TimerMode = 'work' | 'break';

//! タイマーの状態。
export type TimerStatus = 'idle' | 'running' | 'paused';

//! タイマーの状態を表すインターフェース。
export interface TimerState {
	mode: TimerMode;              //! 'work' (25分) または 'break' (5分)。
	status: TimerStatus;          //! 'idle', 'running', 'paused'。
	remainingSeconds: number;     //! 残り秒数。
}

//! 各モードのデフォルト時間(秒)。
const MODE_DURATIONS: Record<TimerMode, number> = {
	work: 1500,   //! 25分 = 1500秒。
	break: 300,   //! 5分 = 300秒。
};

//! タイマー完了時のコールバック関数の型。
export type TimerCompleteCallback = (mode: TimerMode) => void;

//! ポモドーロタイマークラス。
export class Timer {
	private state: TimerState;
	private intervalId: number | null = null;
	private onComplete?: TimerCompleteCallback;

	//! コンストラクタ。
	//! 初期状態: work mode, idle status, 1500秒(25分)。
	constructor(onComplete?: TimerCompleteCallback) {
		this.state = {
			mode: 'work',
			status: 'idle',
			remainingSeconds: MODE_DURATIONS.work,
		};
		this.onComplete = onComplete;
	}

	//! タイマーを開始する。
	//! statusをrunningに変更し、1秒ごとにremainingSecondsをデクリメント。
	start(): void {
		//! 既にrunning状態の場合は何もしない(重複起動を防ぐ)。
		if (this.state.status === 'running') {
			return;
		}

		this.state.status = 'running';

		//! 1秒ごとにカウントダウン。
		this.intervalId = window.setInterval(() => {
			this.tick();
		}, 1000);
	}

	//! 1秒ごとに呼ばれる内部メソッド。
	private tick(): void {
		if (this.state.remainingSeconds > 0) {
			this.state.remainingSeconds--;
		}

		//! 残り時間が0になったら停止。
		if (this.state.remainingSeconds === 0) {
			this.stop();
		}
	}

	//! タイマーを停止する内部メソッド。
	private stop(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.state.status = 'idle';

		//! 完了コールバックを呼び出す。
		if (this.onComplete) {
			this.onComplete(this.state.mode);
		}
	}

	//! タイマーを一時停止する。
	//! statusをpausedに変更し、カウントダウンを停止。
	pause(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		//! idle状態からpauseされた場合はidleのまま。
		if (this.state.status !== 'idle') {
			this.state.status = 'paused';
		}
	}

	//! タイマーをリセットする。
	//! statusをidleに変更し、remainingSecondsをモードのデフォルト値にリセット。
	reset(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.state.status = 'idle';
		this.state.remainingSeconds = MODE_DURATIONS[this.state.mode];
	}

	//! 現在の状態を取得する。
	//! 状態オブジェクトのコピーを返す(外部から直接変更されないように)。
	getState(): TimerState {
		return { ...this.state };
	}

	//! モードを変更する。
	//! モード変更時にremainingSecondsを新しいモードのデフォルト値に設定し、statusをidleにリセット。
	setMode(mode: TimerMode): void {
		//! 実行中のタイマーを停止。
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		this.state.mode = mode;
		this.state.status = 'idle';
		this.state.remainingSeconds = MODE_DURATIONS[mode];
	}
}
