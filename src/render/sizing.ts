import { configureCanvas, renderGameToCanvas } from './canvas';

import type { GameState } from '../game/types';

type ResizeTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>;

export type ViewportSize = {
  width: number;
  height: number;
};

const DEFAULT_VIEWPORT_PADDING_PX = 32;
const DEFAULT_MIN_BOARD_SIZE_PX = 160;
const DEFAULT_MAX_BOARD_SIZE_PX = 640;

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.min(maxValue, Math.max(minValue, value));
}

export function getResponsiveBoardSize(
  viewport: ViewportSize,
  paddingPx = DEFAULT_VIEWPORT_PADDING_PX,
  minBoardSizePx = DEFAULT_MIN_BOARD_SIZE_PX,
  maxBoardSizePx = DEFAULT_MAX_BOARD_SIZE_PX,
): number {
  if (!Number.isFinite(viewport.width) || viewport.width <= 0) {
    throw new Error('viewport.width must be a positive number.');
  }

  if (!Number.isFinite(viewport.height) || viewport.height <= 0) {
    throw new Error('viewport.height must be a positive number.');
  }

  if (!Number.isFinite(paddingPx) || paddingPx < 0) {
    throw new Error('paddingPx must be a non-negative number.');
  }

  if (!Number.isFinite(minBoardSizePx) || minBoardSizePx <= 0) {
    throw new Error('minBoardSizePx must be a positive number.');
  }

  if (!Number.isFinite(maxBoardSizePx) || maxBoardSizePx < minBoardSizePx) {
    throw new Error(
      'maxBoardSizePx must be greater than or equal to minBoardSizePx.',
    );
  }

  const availableSize = Math.min(viewport.width, viewport.height) - paddingPx * 2;

  return clamp(Math.floor(availableSize), minBoardSizePx, maxBoardSizePx);
}

export function resizeAndRenderCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  state: GameState,
  viewport: ViewportSize,
): number {
  const boardSizePx = getResponsiveBoardSize(viewport);

  configureCanvas(canvas, state.gridSize, {
    boardSizePx,
  });
  renderGameToCanvas(context, state, {
    boardSizePx,
  });

  return boardSizePx;
}

export function attachResponsiveCanvas(
  target: ResizeTarget,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  getState: () => GameState,
  getViewport: () => ViewportSize,
): () => void {
  const handleResize = (): void => {
    resizeAndRenderCanvas(canvas, context, getState(), getViewport());
  };

  target.addEventListener('resize', handleResize);
  handleResize();

  return () => {
    target.removeEventListener('resize', handleResize);
  };
}
