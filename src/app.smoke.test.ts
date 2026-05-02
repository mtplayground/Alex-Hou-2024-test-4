// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderApp } from './app';
import { readGameplayConfig } from './config/env';
import { createInitialGameState } from './game/initial-state';
import type { GameState } from './game/types';

class MockAnimationScheduler {
  private callbacks = new Map<number, FrameRequestCallback>();
  private nextHandle = 1;

  requestAnimationFrame(callback: FrameRequestCallback): number {
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
      | [number, FrameRequestCallback]
      | undefined;

    if (!nextEntry) {
      throw new Error('No scheduled animation frame to run.');
    }

    const [handle, callback] = nextEntry;
    this.callbacks.delete(handle);
    callback(timestamp);
  }
}

class MockCanvasRenderingContext2D {
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  imageSmoothingEnabled = false;
  private readonly renderOperations: RenderOperation[] = [];

  clearRect(): void {
    this.renderOperations.push({ type: 'clearRect' });
  }

  fillRect(x: number, y: number): void {
    this.renderOperations.push({
      type: 'fillRect',
      fillStyle: this.fillStyle,
      x,
      y,
    });
  }

  beginPath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  stroke(): void {}
  setTransform(): void {}

  getLastSnakeRects(): Array<{ x: number; y: number }> {
    let lastClearRectIndex = -1;

    for (let index = this.renderOperations.length - 1; index >= 0; index -= 1) {
      if (this.renderOperations[index]?.type === 'clearRect') {
        lastClearRectIndex = index;
        break;
      }
    }

    return this.renderOperations
      .slice(lastClearRectIndex + 1)
      .filter(
        (
          operation,
        ): operation is {
          type: 'fillRect';
          fillStyle: string;
          x: number;
          y: number;
        } =>
          operation.type === 'fillRect' && operation.fillStyle === '#7ee081',
      )
      .map(({ x, y }) => ({ x, y }));
  }
}

type RenderOperation =
  | { type: 'clearRect' }
  | { type: 'fillRect'; fillStyle: string; x: number; y: number };

function createMountedApp(initialState: GameState) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const config = readGameplayConfig({
    GRID_SIZE: String(initialState.gridSize),
    INITIAL_SPEED_MS: String(initialState.speedMs),
  });

  const scheduler = new MockAnimationScheduler();
  const context = new MockCanvasRenderingContext2D();

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
    scheduler.requestAnimationFrame(callback),
  );
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((handle) => {
    scheduler.cancelAnimationFrame(handle);
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    function getContext(type: string) {
      if (type !== '2d') {
        return null;
      }

      return context as unknown as CanvasRenderingContext2D;
    },
  );

  const cleanup = renderApp(container, config, initialState);
  const canvas = container.querySelector<HTMLCanvasElement>('#game-board');

  if (!canvas) {
    throw new Error('Expected mounted app to render a canvas.');
  }

  return {
    cleanup,
    canvas,
    container,
    context,
    scheduler,
  };
}

describe('renderApp smoke test', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 1,
    });
    window.localStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it(
    'mounts the app, advances the snake, updates the HUD, and shows game over',
    { timeout: 15_000 },
    () => {
    const initialState: GameState = {
      ...createInitialGameState(7, 100),
      food: { x: 4, y: 2 },
    };
    const { cleanup, canvas, container, context, scheduler } =
      createMountedApp(initialState);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    scheduler.runNextFrame(0);
    scheduler.runNextFrame(100);

    const boardSizePx = Number.parseFloat(canvas.style.width);
    const cellSizePx = boardSizePx / initialState.gridSize;

    expect(context.getLastSnakeRects()).toContainEqual({
      x: cellSizePx * 4,
      y: cellSizePx * 2,
    });
    expect(
      container.querySelector<HTMLElement>('#score-value')?.textContent,
    ).toBe('1');
    expect(
      container.querySelector<HTMLElement>('#status-value')?.textContent,
    ).toBe('Running');

    for (let timestamp = 200; timestamp <= 1_000; timestamp += 100) {
      scheduler.runNextFrame(timestamp);

      if (
        container.querySelector<HTMLElement>('#status-value')?.textContent ===
        'Game Over'
      ) {
        break;
      }
    }

    expect(
      container.querySelector<HTMLElement>('#status-value')?.textContent,
    ).toBe('Game Over');
    expect(
      container.querySelector<HTMLElement>('#high-score-value')?.textContent,
    ).toBe('1');
    expect(
      container.querySelector<HTMLElement>('#final-score-value')?.textContent,
    ).toBe('1');
    expect(
      container.querySelector<HTMLElement>('#game-over-overlay')?.hidden,
    ).toBe(false);

    cleanup();
    },
  );
});
