// ! Timerクラスのテスト。
// ! TDD (Test-Driven Development) アプローチで作成。

import { Timer } from '../src/core/timer';

describe('Timer', () => {
	let timer: Timer;

	beforeEach(() => {
		// ! 各テスト前に新しいTimerインスタンスを作成。
		timer = new Timer();
		// ! タイマーを停止してクリーンアップ。
		jest.clearAllTimers();
	});

	afterEach(() => {
		// ! テスト後のクリーンアップ。
		timer.reset();
	});

	describe('初期状態', () => {
		it('初期状態はwork mode, idle status, 1500秒(25分)であること', () => {
			const state = timer.getState();
			expect(state.mode).toBe('work');
			expect(state.status).toBe('idle');
			expect(state.remainingSeconds).toBe(1500);
		});
	});

	describe('start()', () => {
		beforeEach(() => {
			// ! タイマーをモック化。
			jest.useFakeTimers();
		});

		afterEach(() => {
			// ! 実際のタイマーに戻す。
			jest.useRealTimers();
		});

		it('startを呼ぶとstatusがrunningになること', () => {
			timer.start();
			const state = timer.getState();
			expect(state.status).toBe('running');
		});

		it('startを呼ぶと1秒ごとにremainingSecondsが減ること', () => {
			timer.start();

			// ! 初期状態: 1500秒。
			expect(timer.getState().remainingSeconds).toBe(1500);

			// ! 1秒経過。
			jest.advanceTimersByTime(1000);
			expect(timer.getState().remainingSeconds).toBe(1499);

			// ! さらに5秒経過。
			jest.advanceTimersByTime(5000);
			expect(timer.getState().remainingSeconds).toBe(1494);
		});

		it('remainingSecondsが0になったら自動的にidleになること', () => {
			// ! 残り時間を1秒に設定してテスト。
			timer.setMode('work');
			timer.reset();

			// ! startして時間を進める。
			timer.start();

			// ! 1500秒進めて0にする。
			jest.advanceTimersByTime(1500 * 1000);

			const finalState = timer.getState();
			expect(finalState.remainingSeconds).toBe(0);
			expect(finalState.status).toBe('idle');
		});
	});

	describe('pause()', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('pauseを呼ぶとstatusがpausedになること', () => {
			timer.start();
			timer.pause();
			const state = timer.getState();
			expect(state.status).toBe('paused');
		});

		it('pauseを呼ぶとカウントダウンが停止すること', () => {
			timer.start();

			// ! 3秒経過。
			jest.advanceTimersByTime(3000);
			expect(timer.getState().remainingSeconds).toBe(1497);

			// ! 一時停止。
			timer.pause();

			// ! さらに5秒経過しても変化しない。
			jest.advanceTimersByTime(5000);
			expect(timer.getState().remainingSeconds).toBe(1497);
			expect(timer.getState().status).toBe('paused');
		});

		it('pausedの状態からstartを呼ぶと再開できること', () => {
			timer.start();
			jest.advanceTimersByTime(3000);
			timer.pause();

			const pausedSeconds = timer.getState().remainingSeconds;

			// ! 再開。
			timer.start();
			jest.advanceTimersByTime(2000);

			expect(timer.getState().remainingSeconds).toBe(pausedSeconds - 2);
			expect(timer.getState().status).toBe('running');
		});
	});

	describe('reset()', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('resetを呼ぶとstatusがidleになること', () => {
			timer.start();
			timer.reset();
			const state = timer.getState();
			expect(state.status).toBe('idle');
		});

		it('resetを呼ぶとremainingSecondsがモードのデフォルト値にリセットされること', () => {
			timer.start();
			jest.advanceTimersByTime(10000);

			timer.reset();
			const state = timer.getState();
			expect(state.remainingSeconds).toBe(1500); // ! work mode: 25分。
		});
	});

	describe('setMode()', () => {
		it('setModeでworkモードに変更できること', () => {
			timer.setMode('work');
			const state = timer.getState();
			expect(state.mode).toBe('work');
			expect(state.remainingSeconds).toBe(1500); // ! 25分。
		});

		it('setModeでbreakモードに変更できること', () => {
			timer.setMode('break');
			const state = timer.getState();
			expect(state.mode).toBe('break');
			expect(state.remainingSeconds).toBe(300); // ! 5分。
		});

		it('モード変更時にstatusがidleにリセットされること', () => {
			timer.start();
			timer.setMode('break');
			const state = timer.getState();
			expect(state.status).toBe('idle');
		});
	});

	describe('エッジケース', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('idle状態でpauseを呼んでもエラーにならないこと', () => {
			expect(() => timer.pause()).not.toThrow();
		});

		it('paused状態でpauseを呼んでもエラーにならないこと', () => {
			timer.start();
			timer.pause();
			expect(() => timer.pause()).not.toThrow();
		});

		it('idle状態でresetを呼んでもエラーにならないこと', () => {
			expect(() => timer.reset()).not.toThrow();
		});

		it('running状態で複数回startを呼んでも重複してタイマーが起動しないこと', () => {
			timer.start();
			timer.start();
			timer.start();

			jest.advanceTimersByTime(1000);
			// ! 1秒しか減らない(3秒減らない)。
			expect(timer.getState().remainingSeconds).toBe(1499);
		});
	});

	describe('通知コールバック', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('タイマー完了時にコールバックが呼ばれること', () => {
			const onComplete = jest.fn();
			timer = new Timer(onComplete);

			// ! 残り2秒の状態を作る。
			timer.start();
			jest.advanceTimersByTime(1498000);

			// ! まだ完了していない。
			expect(onComplete).not.toHaveBeenCalled();

			// ! 残り2秒→1秒→0秒。
			jest.advanceTimersByTime(2000);

			// ! 完了時にコールバックが呼ばれる。
			expect(onComplete).toHaveBeenCalledTimes(1);
			expect(onComplete).toHaveBeenCalledWith('work');
		});

		it('break モード完了時もコールバックが呼ばれること', () => {
			const onComplete = jest.fn();
			timer = new Timer(onComplete);

			timer.setMode('break');
			timer.start();

			// ! 5分 = 300秒完了。
			jest.advanceTimersByTime(300000);

			expect(onComplete).toHaveBeenCalledTimes(1);
			expect(onComplete).toHaveBeenCalledWith('break');
		});

		it('コールバックなしでもエラーにならないこと', () => {
			timer = new Timer();
			timer.start();

			// ! 25分完了してもエラーにならない。
			expect(() => {
				jest.advanceTimersByTime(1500000);
			}).not.toThrow();
		});

		it('pause中はコールバックが呼ばれないこと', () => {
			const onComplete = jest.fn();
			timer = new Timer(onComplete);

			timer.start();
			jest.advanceTimersByTime(1000);
			timer.pause();

			// ! いくら時間が経過してもコールバックは呼ばれない。
			jest.advanceTimersByTime(10000000);
			expect(onComplete).not.toHaveBeenCalled();
		});
	});

	describe('setCustomTime', () => {
		it('分と秒を指定してカスタムタイマーを設定できること', () => {
			timer.setCustomTime(5, 30);
			const state = timer.getState();
			expect(state.mode).toBe('custom');
			expect(state.remainingSeconds).toBe(330); // ! 5分30秒 = 330秒。
			expect(state.status).toBe('idle');
		});

		it('秒のみを指定してカスタムタイマーを設定できること', () => {
			timer.setCustomTime(0, 45);
			const state = timer.getState();
			expect(state.mode).toBe('custom');
			expect(state.remainingSeconds).toBe(45);
		});

		it('0分0秒を指定した場合は1秒に設定されること', () => {
			timer.setCustomTime(0, 0);
			const state = timer.getState();
			expect(state.remainingSeconds).toBe(1); // ! 最小値は1秒。
		});

		it('負の値を指定した場合も1秒に設定されること', () => {
			timer.setCustomTime(-1, -1);
			const state = timer.getState();
			expect(state.remainingSeconds).toBe(1);
		});

		it('setCustomMinutesはsetCustomTimeを使用していること', () => {
			timer.setCustomMinutes(10);
			const state = timer.getState();
			expect(state.mode).toBe('custom');
			expect(state.remainingSeconds).toBe(600); // ! 10分 = 600秒。
		});

		it('カスタムタイマーが正常に動作すること', () => {
			jest.useFakeTimers();

			timer.setCustomTime(0, 5);
			timer.start();

			jest.advanceTimersByTime(3000);
			expect(timer.getState().remainingSeconds).toBe(2);

			jest.advanceTimersByTime(2000);
			expect(timer.getState().remainingSeconds).toBe(0);
			expect(timer.getState().status).toBe('idle');

			jest.useRealTimers();
		});
	});
});
