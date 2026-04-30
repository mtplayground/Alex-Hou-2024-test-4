import { describe, expect, it, vi } from 'vitest';

import { createFixedTickLoop } from './loop';
import type { GameState } from './types';

class MockAnimationScheduler {
  callbacks = new Map<number, (timestamp: number) => void>();
  cancelledHandles: number[] = [];
  nextHandle = 1;

  requestAnimationFrame(callback: (timestamp: number) => void): number {
    const handle = this.nextHandle;
    this.nextHandle += 1;
    this.callbacks.set(handle, callback);
    return handle;
  }

  cancelAnimationFrame(handle: number): void {
    this.cancelledHandles.push(handle);
    this.callbacks.delete(handle);
  }

  runNextFrame(timestamp: number): void {
    const nextEntry = this.callbacks.entries().next().value as
      | [number, (timestamp: number) => void]
      | undefined;

    if (!nextEntry) {
      throw new Error('No scheduled frame to run.');
    }

    const [handle, callback] = nextEntry;

    this.callbacks.delete(handle);
    callback(timestamp);
  }
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gridSize: 10,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 5, y: 5 },
    direction: 'right',
    status: 'running',
    score: 0,
    speedMs: 100,
    ...overrides,
  };
}

describe('createFixedTickLoop', () => {
  it('renders immediately on start and once per animation frame', () => {
    const scheduler = new MockAnimationScheduler();
    const render = vi.fn();

    const loop = createFixedTickLoop({
      initialState: createState(),
      update: (state) => state,
      render,
      scheduler,
    });

    loop.start();
    scheduler.runNextFrame(0);
    scheduler.runNextFrame(16);

    expect(render).toHaveBeenCalledTimes(3);
  });

  it('advances the state only when the accumulator reaches the tick interval', () => {
    const scheduler = new MockAnimationScheduler();
    const render = vi.fn();
    const update = vi.fn((state: GameState) => ({
      ...state,
      score: state.score + 1,
    }));

    const loop = createFixedTickLoop({
      initialState: createState(),
      update,
      render,
      scheduler,
    });

    loop.start();
    scheduler.runNextFrame(0);
    scheduler.runNextFrame(50);
    scheduler.runNextFrame(100);
    scheduler.runNextFrame(200);

    expect(update).toHaveBeenCalledTimes(2);
    expect(loop.getState().score).toBe(2);
  });

  it('can process multiple ticks in a single animation frame', () => {
    const scheduler = new MockAnimationScheduler();
    const render = vi.fn();
    const update = vi.fn((state: GameState) => ({
      ...state,
      score: state.score + 1,
    }));

    const loop = createFixedTickLoop({
      initialState: createState(),
      update,
      render,
      scheduler,
    });

    loop.start();
    scheduler.runNextFrame(0);
    scheduler.runNextFrame(250);

    expect(update).toHaveBeenCalledTimes(2);
    expect(loop.getState().score).toBe(2);
  });

  it('does not advance while shouldAdvance returns false', () => {
    const scheduler = new MockAnimationScheduler();
    const render = vi.fn();
    const update = vi.fn((state: GameState) => ({
      ...state,
      score: state.score + 1,
    }));

    const loop = createFixedTickLoop({
      initialState: createState({ status: 'idle' }),
      update,
      render,
      scheduler,
    });

    loop.start();
    scheduler.runNextFrame(0);
    scheduler.runNextFrame(500);

    expect(update).not.toHaveBeenCalled();
    expect(render).toHaveBeenCalledTimes(3);
  });

  it('stops scheduling frames when stopped', () => {
    const scheduler = new MockAnimationScheduler();
    const render = vi.fn();

    const loop = createFixedTickLoop({
      initialState: createState(),
      update: (state) => state,
      render,
      scheduler,
    });

    loop.start();
    expect(loop.isRunning()).toBe(true);

    loop.stop();

    expect(loop.isRunning()).toBe(false);
    expect(scheduler.cancelledHandles).toEqual([1]);
  });
});
