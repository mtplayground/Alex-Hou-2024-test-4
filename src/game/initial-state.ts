import { gameplayConfig } from '../config/env';

import type { GameState, Position, Snake } from './types';

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

function positionsMatch(left: Position, right: Position): boolean {
  return left.x === right.x && left.y === right.y;
}

function createStartingFood(gridSize: number, snake: Snake): Position {
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const candidate = { x, y };

      if (!snake.some((segment) => positionsMatch(segment, candidate))) {
        return candidate;
      }
    }
  }

  throw new Error('Unable to place food on the grid.');
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
    food: createStartingFood(gridSize, snake),
    direction: 'right',
    status: 'idle',
    score: 0,
    speedMs: initialSpeedMs,
  };
}
