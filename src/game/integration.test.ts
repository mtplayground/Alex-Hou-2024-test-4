import { describe, expect, it, vi } from 'vitest';

import { isSelfCollision, isWallCollision } from './collision';
import { isFoodEaten, resolveFoodConsumption } from './food';
import { createInitialGameState } from './initial-state';
import { createFixedTickLoop } from './loop';
import { advanceSnake, getNextHeadPosition, resolveDirectionChange } from './movement';
import { getTickIntervalForScore } from './speed';
import { createRestartedGameState } from '../ui/game-over';
import { handleKeyboardInput } from '../input/keyboard';

import type { Direction, GameState } from './types';

class MockAnimationScheduler {
  private callbacks = new Map<number, (timestamp: number) => void>();
  private nextHandle = 1;

  requestAnimationFrame(callback: (timestamp: number) => void): number {
    const handle = this.nextHandle;
    this.nextHandle += 1;
    this.callbacks.set(handle, callback);
    return handle;
  }

  cancelAnimationFrame(handle: number): void {
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

function createIntegrationHarness(initialState: GameState) {
  const scheduler = new MockAnimationScheduler();
  const render = vi.fn();

  let state = initialState;
  let pendingDirection: Direction = initialState.direction;

  const loop = createFixedTickLoop({
    initialState,
    scheduler,
    render: (nextState) => {
      state = nextState;
      render(nextState);
    },
    update: (currentState) => {
      const direction = resolveDirectionChange(
        currentState.direction,
        pendingDirection,
      );
      const nextHead = getNextHeadPosition(currentState.snake[0], direction);
      const shouldGrow = isFoodEaten(nextHead, currentState.food);
      const movedSnake = advanceSnake(currentState.snake, direction, shouldGrow);

      if (
        isWallCollision(movedSnake[0], currentState.gridSize) ||
        isSelfCollision(movedSnake)
      ) {
        pendingDirection = direction;

        return {
          ...currentState,
          direction,
          snake: movedSnake,
          status: 'game-over',
        };
      }

      const nextState = resolveFoodConsumption(
        {
          ...currentState,
          direction,
        },
        movedSnake,
        () => 0,
      );

      const updatedState: GameState = {
        ...nextState,
        status: 'running',
        speedMs: getTickIntervalForScore(
          nextState.score,
          initialState.speedMs,
          10,
          5,
        ),
      };

      pendingDirection = updatedState.direction;

      return updatedState;
    },
  });

  const dispatchKey = (key: string): void => {
    handleKeyboardInput(
      {
        key,
        preventDefault: vi.fn(),
      },
      {
        getCurrentDirection: () => pendingDirection,
        onDirectionChange: (direction) => {
          pendingDirection = direction;
        },
        onControl: (control) => {
          if (control === 'restart') {
            const restartedState = createRestartedGameState(state);
            pendingDirection = restartedState.direction;
            state = restartedState;
            loop.setState(restartedState);
          }
        },
      },
    );
  };

  return {
    loop,
    scheduler,
    render,
    getState: () => state,
    dispatchKey,
  };
}

describe('full game tick sequence', () => {
  it('handles scripted inputs, scoring, growth, game over, and restart', () => {
    const initialState: GameState = {
      ...createInitialGameState(7, 100),
      status: 'running',
      food: { x: 4, y: 2 },
    };

    const harness = createIntegrationHarness(initialState);

    harness.loop.start();
    harness.dispatchKey('ArrowUp');

    harness.scheduler.runNextFrame(0);
    harness.scheduler.runNextFrame(100);

    expect(harness.getState().score).toBe(1);
    expect(harness.getState().snake).toHaveLength(4);
    expect(harness.getState().status).toBe('running');

    harness.scheduler.runNextFrame(200);
    harness.scheduler.runNextFrame(300);
    harness.scheduler.runNextFrame(400);

    expect(harness.getState().status).toBe('game-over');
    expect(harness.getState().snake[0]).toEqual({ x: 4, y: -1 });

    harness.dispatchKey('Enter');

    expect(harness.getState()).toEqual({
      gridSize: 7,
      snake: [
        { x: 4, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'idle',
      score: 0,
      speedMs: 100,
    });
  });
});
