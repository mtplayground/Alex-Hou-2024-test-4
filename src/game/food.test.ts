import { describe, expect, it } from 'vitest';

import { advanceSnake } from './movement';
import { resolveFoodConsumption, spawnFood } from './food';
import type { GameState } from './types';

describe('spawnFood', () => {
  it('places food on a free cell', () => {
    expect(
      spawnFood(
        3,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        () => 0,
      ),
    ).toEqual({ x: 2, y: 0 });
  });

  it('uses the random source to choose among free cells', () => {
    expect(
      spawnFood(
        3,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        () => 0.99,
      ),
    ).toEqual({ x: 2, y: 2 });
  });

  it('throws when the grid is full', () => {
    expect(() =>
      spawnFood(
        2,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
        () => 0,
      ),
    ).toThrow('Unable to place food on the grid.');
  });
});

describe('resolveFoodConsumption', () => {
  it('increments score and respawns food when the snake eats', () => {
    const state: GameState = {
      gridSize: 5,
      snake: [
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
      food: { x: 2, y: 2 },
      direction: 'right',
      status: 'running',
      score: 0,
      speedMs: 200,
    };

    const grownSnake = advanceSnake(state.snake, state.direction, true);

    expect(resolveFoodConsumption(state, grownSnake, () => 0)).toEqual({
      ...state,
      snake: grownSnake,
      food: { x: 0, y: 0 },
      score: 1,
    });
  });

  it('keeps score and food unchanged when no food is eaten', () => {
    const state: GameState = {
      gridSize: 5,
      snake: [
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
      food: { x: 4, y: 4 },
      direction: 'right',
      status: 'running',
      score: 3,
      speedMs: 200,
    };

    const nextSnake = advanceSnake(state.snake, state.direction);

    expect(resolveFoodConsumption(state, nextSnake, () => 0.5)).toEqual({
      ...state,
      snake: nextSnake,
    });
  });
});
