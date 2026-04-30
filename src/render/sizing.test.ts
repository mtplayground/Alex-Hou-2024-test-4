import { describe, expect, it, vi } from 'vitest';

import { attachResponsiveCanvas, getResponsiveBoardSize, resizeAndRenderCanvas } from './sizing';
import type { GameState } from '../game/types';

class MockCanvasRenderingContext2D {
  clearRect(): void {}
  fillRect(): void {}
  moveTo(): void {}
  lineTo(): void {}
  setTransform(): void {}
  beginPath(): void {}
  stroke(): void {}
  imageSmoothingEnabled = true;
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 0;
}

class MockCanvasElement {
  width = 0;
  height = 0;
  style = {
    width: '',
    height: '',
  };

  constructor(
    private readonly context: MockCanvasRenderingContext2D | null,
  ) {}

  getContext(kind: string): MockCanvasRenderingContext2D | null {
    if (kind !== '2d') {
      return null;
    }

    return this.context;
  }
}

class MockResizeTarget {
  listener: (() => void) | null = null;

  addEventListener(eventName: string, listener: () => void): void {
    if (eventName === 'resize') {
      this.listener = listener;
    }
  }

  removeEventListener(eventName: string, listener: () => void): void {
    if (eventName === 'resize' && this.listener === listener) {
      this.listener = null;
    }
  }

  dispatchResize(): void {
    this.listener?.();
  }
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gridSize: 20,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 5, y: 5 },
    direction: 'right',
    status: 'idle',
    score: 0,
    speedMs: 200,
    ...overrides,
  };
}

describe('getResponsiveBoardSize', () => {
  it('uses the smaller viewport dimension and preserves square sizing', () => {
    expect(getResponsiveBoardSize({ width: 900, height: 500 })).toBe(436);
  });

  it('clamps the board size to configured bounds', () => {
    expect(getResponsiveBoardSize({ width: 2000, height: 2000 })).toBe(640);
    expect(getResponsiveBoardSize({ width: 120, height: 120 })).toBe(160);
  });
});

describe('resizeAndRenderCanvas', () => {
  it('resizes the canvas and returns the board size used for rendering', () => {
    const canvas = new MockCanvasElement(
      new MockCanvasRenderingContext2D(),
    ) as unknown as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    expect(
      resizeAndRenderCanvas(canvas, context, createState(), {
        width: 900,
        height: 500,
      }),
    ).toBe(436);

    expect(canvas.style.width).toBe('436px');
    expect(canvas.style.height).toBe('436px');
  });
});

describe('attachResponsiveCanvas', () => {
  it('renders immediately and re-renders on resize until detached', () => {
    const target = new MockResizeTarget();
    const canvas = new MockCanvasElement(
      new MockCanvasRenderingContext2D(),
    ) as unknown as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const viewport = {
      width: 800,
      height: 600,
    };
    const getViewport = vi.fn(() => viewport);
    const getState = vi.fn(() => createState());

    const detach = attachResponsiveCanvas(
      target as unknown as Window,
      canvas,
      context,
      getState,
      getViewport,
    );

    expect(getState).toHaveBeenCalledTimes(1);
    expect(getViewport).toHaveBeenCalledTimes(1);

    target.dispatchResize();
    expect(getState).toHaveBeenCalledTimes(2);
    expect(getViewport).toHaveBeenCalledTimes(2);

    detach();
    target.dispatchResize();
    expect(getState).toHaveBeenCalledTimes(2);
  });
});
