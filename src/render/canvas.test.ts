import { describe, expect, it } from 'vitest';

import { configureCanvas, renderGameToCanvas } from './canvas';
import type { GameState } from '../game/types';

class MockCanvasRenderingContext2D {
  clearRectCalls: Array<[number, number, number, number]> = [];
  fillRectCalls: Array<[number, number, number, number]> = [];
  moveToCalls: Array<[number, number]> = [];
  lineToCalls: Array<[number, number]> = [];
  setTransformCalls: Array<[number, number, number, number, number, number]> =
    [];
  beginPathCallCount = 0;
  strokeCallCount = 0;
  imageSmoothingEnabled = true;
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 0;

  clearRect(x: number, y: number, width: number, height: number): void {
    this.clearRectCalls.push([x, y, width, height]);
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.fillRectCalls.push([x, y, width, height]);
  }

  moveTo(x: number, y: number): void {
    this.moveToCalls.push([x, y]);
  }

  lineTo(x: number, y: number): void {
    this.lineToCalls.push([x, y]);
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ): void {
    this.setTransformCalls.push([a, b, c, d, e, f]);
  }

  beginPath(): void {
    this.beginPathCallCount += 1;
  }

  stroke(): void {
    this.strokeCallCount += 1;
  }
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

const state: GameState = {
  gridSize: 4,
  snake: [
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
  food: { x: 3, y: 2 },
  direction: 'right',
  status: 'idle',
  score: 0,
  speedMs: 200,
};

describe('configureCanvas', () => {
  it('applies DPR-aware sizing and transform', () => {
    const context = new MockCanvasRenderingContext2D();
    const canvas = new MockCanvasElement(context) as unknown as HTMLCanvasElement;

    expect(
      configureCanvas(canvas, 4, {
        boardSizePx: 320,
        devicePixelRatio: 2,
      }),
    ).toEqual({
      boardSizePx: 320,
      cellSizePx: 80,
      devicePixelRatio: 2,
    });

    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(640);
    expect(canvas.style.width).toBe('320px');
    expect(canvas.style.height).toBe('320px');
    expect(context.setTransformCalls).toEqual([[2, 0, 0, 2, 0, 0]]);
    expect(context.imageSmoothingEnabled).toBe(false);
  });

  it('throws when the canvas has no 2d context', () => {
    const canvas = new MockCanvasElement(null) as unknown as HTMLCanvasElement;

    expect(() => configureCanvas(canvas, 4)).toThrow(
      'Expected a 2D canvas context.',
    );
  });
});

describe('renderGameToCanvas', () => {
  it('draws background, grid, snake, and food based on game state', () => {
    const context =
      new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D;

    expect(
      renderGameToCanvas(context, state, {
        boardSizePx: 200,
      }),
    ).toEqual({
      boardSizePx: 200,
      cellSizePx: 50,
      devicePixelRatio: 1,
    });

    const typedContext = context as unknown as MockCanvasRenderingContext2D;

    expect(typedContext.clearRectCalls).toEqual([[0, 0, 200, 200]]);
    expect(typedContext.fillRectCalls).toEqual([
      [0, 0, 200, 200],
      [50, 50, 50, 50],
      [0, 50, 50, 50],
      [150, 100, 50, 50],
    ]);
    expect(typedContext.beginPathCallCount).toBe(1);
    expect(typedContext.strokeCallCount).toBe(1);
    expect(typedContext.moveToCalls).toHaveLength(10);
    expect(typedContext.lineToCalls).toHaveLength(10);
  });

  it('throws for an invalid board size', () => {
    const context =
      new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D;

    expect(() =>
      renderGameToCanvas(context, state, {
        boardSizePx: 0,
      }),
    ).toThrow('boardSizePx must be a positive number.');
  });
});
