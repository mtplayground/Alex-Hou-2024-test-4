import type { GameState } from '../game/types';

export type CanvasRenderTheme = {
  backgroundColor: string;
  gridColor: string;
  snakeColor: string;
  foodColor: string;
};

export type CanvasRenderOptions = {
  boardSizePx?: number;
  devicePixelRatio?: number;
  theme?: Partial<CanvasRenderTheme>;
};

export type CanvasRenderMetrics = {
  boardSizePx: number;
  cellSizePx: number;
  devicePixelRatio: number;
};

const DEFAULT_THEME: CanvasRenderTheme = {
  backgroundColor: '#101418',
  gridColor: '#1d2730',
  snakeColor: '#7ee081',
  foodColor: '#ff6b6b',
};

const DEFAULT_BOARD_SIZE_PX = 480;

function getDefaultDevicePixelRatio(): number {
  if (typeof window === 'undefined') {
    return 1;
  }

  return window.devicePixelRatio;
}

function resolveTheme(
  theme: Partial<CanvasRenderTheme> | undefined,
): CanvasRenderTheme {
  return {
    ...DEFAULT_THEME,
    ...theme,
  };
}

function assertPositiveNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }
}

export function configureCanvas(
  canvas: HTMLCanvasElement,
  gridSize: number,
  options: CanvasRenderOptions = {},
): CanvasRenderMetrics {
  assertPositiveNumber(gridSize, 'gridSize');

  const boardSizePx = options.boardSizePx ?? DEFAULT_BOARD_SIZE_PX;
  const devicePixelRatio =
    options.devicePixelRatio ?? getDefaultDevicePixelRatio();

  assertPositiveNumber(boardSizePx, 'boardSizePx');
  assertPositiveNumber(devicePixelRatio, 'devicePixelRatio');

  const cellSizePx = boardSizePx / gridSize;

  canvas.width = Math.round(boardSizePx * devicePixelRatio);
  canvas.height = Math.round(boardSizePx * devicePixelRatio);
  canvas.style.width = `${boardSizePx}px`;
  canvas.style.height = `${boardSizePx}px`;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Expected a 2D canvas context.');
  }

  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  context.imageSmoothingEnabled = false;

  return {
    boardSizePx,
    cellSizePx,
    devicePixelRatio,
  };
}

export function renderGameToCanvas(
  context: CanvasRenderingContext2D,
  state: GameState,
  options: CanvasRenderOptions = {},
): CanvasRenderMetrics {
  const boardSizePx = options.boardSizePx ?? DEFAULT_BOARD_SIZE_PX;

  assertPositiveNumber(boardSizePx, 'boardSizePx');
  assertPositiveNumber(state.gridSize, 'state.gridSize');

  const theme = resolveTheme(options.theme);
  const cellSizePx = boardSizePx / state.gridSize;

  context.clearRect(0, 0, boardSizePx, boardSizePx);

  context.fillStyle = theme.backgroundColor;
  context.fillRect(0, 0, boardSizePx, boardSizePx);

  context.strokeStyle = theme.gridColor;
  context.lineWidth = 1;

  context.beginPath();
  for (let index = 0; index <= state.gridSize; index += 1) {
    const offset = index * cellSizePx;

    context.moveTo(offset, 0);
    context.lineTo(offset, boardSizePx);
    context.moveTo(0, offset);
    context.lineTo(boardSizePx, offset);
  }
  context.stroke();

  context.fillStyle = theme.snakeColor;
  for (const segment of state.snake) {
    context.fillRect(
      segment.x * cellSizePx,
      segment.y * cellSizePx,
      cellSizePx,
      cellSizePx,
    );
  }

  context.fillStyle = theme.foodColor;
  context.fillRect(
    state.food.x * cellSizePx,
    state.food.y * cellSizePx,
    cellSizePx,
    cellSizePx,
  );

  return {
    boardSizePx,
    cellSizePx,
    devicePixelRatio: options.devicePixelRatio ?? 1,
  };
}
