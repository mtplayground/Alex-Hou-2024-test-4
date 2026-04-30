import { gameplayConfig } from '../config/env';

import { spawnFood } from './food';

import type { GameState, Snake } from './types';

function assertValidGridSize(gridSize: number): void {
  if (!Number.isInteger(gridSize) || gridSize < 3) {
    throw new Error('gridSize must be an integer greater than or equal to 3.');
  }
}

function createStartingSnake(gridSize: number): Snake {
  const row = Math.floor(gridSize / 2);
  const startColumn = Math.floor(gridSize / 2) - 1;

  return [
    { x: startColumn + 2, y: row },
    { x: startColumn + 1, y: row },
    { x: startColumn, y: row },
  ];
}

export function createInitialGameState(
  gridSize: number,
  initialSpeedMs = gameplayConfig.initialSpeedMs,
): GameState {
  assertValidGridSize(gridSize);

  if (!Number.isInteger(initialSpeedMs) || initialSpeedMs <= 0) {
    throw new Error('initialSpeedMs must be a positive integer.');
  }

  const snake = createStartingSnake(gridSize);

  return {
    gridSize,
    snake,
    food: spawnFood(gridSize, snake, () => 0),
    direction: 'right',
    status: 'idle',
    score: 0,
    speedMs: initialSpeedMs,
  };
}
