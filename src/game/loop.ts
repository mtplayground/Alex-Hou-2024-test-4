import type { GameState } from './types';

export type AnimationScheduler = {
  requestAnimationFrame: (callback: (timestamp: number) => void) => number;
  cancelAnimationFrame: (handle: number) => void;
};

export type FixedTickLoopOptions = {
  initialState: GameState;
  update: (state: GameState) => GameState;
  render: (state: GameState) => void;
  scheduler?: AnimationScheduler;
  shouldAdvance?: (state: GameState) => boolean;
};

export type FixedTickLoop = {
  start: () => void;
  stop: () => void;
  getState: () => GameState;
  setState: (state: GameState) => void;
  isRunning: () => boolean;
};

function getDefaultScheduler(): AnimationScheduler {
  if (typeof window === 'undefined') {
    throw new Error('A scheduler must be provided outside the browser.');
  }

  return window;
}

export function createFixedTickLoop(
  options: FixedTickLoopOptions,
): FixedTickLoop {
  const scheduler = options.scheduler ?? getDefaultScheduler();
  const shouldAdvance =
    options.shouldAdvance ?? ((state: GameState) => state.status === 'running');

  let state = options.initialState;
  let isRunning = false;
  let frameHandle: number | null = null;
  let previousTimestamp: number | null = null;
  let accumulatorMs = 0;

  const step = (timestamp: number): void => {
    if (!isRunning) {
      return;
    }

    if (previousTimestamp === null) {
      previousTimestamp = timestamp;
    }

    const deltaMs = timestamp - previousTimestamp;
    previousTimestamp = timestamp;

    if (shouldAdvance(state)) {
      accumulatorMs += deltaMs;

      while (accumulatorMs >= state.speedMs) {
        accumulatorMs -= state.speedMs;
        state = options.update(state);
      }
    } else {
      accumulatorMs = 0;
    }

    options.render(state);
    frameHandle = scheduler.requestAnimationFrame(step);
  };

  return {
    start(): void {
      if (isRunning) {
        return;
      }

      isRunning = true;
      previousTimestamp = null;
      accumulatorMs = 0;
      options.render(state);
      frameHandle = scheduler.requestAnimationFrame(step);
    },

    stop(): void {
      if (!isRunning) {
        return;
      }

      isRunning = false;
      previousTimestamp = null;
      accumulatorMs = 0;

      if (frameHandle !== null) {
        scheduler.cancelAnimationFrame(frameHandle);
        frameHandle = null;
      }
    },

    getState(): GameState {
      return state;
    },

    setState(nextState: GameState): void {
      state = nextState;
    },

    isRunning(): boolean {
      return isRunning;
    },
  };
}
