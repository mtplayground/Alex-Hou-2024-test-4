import { describe, expect, it } from 'vitest';

import { createInitialGameState } from './initial-state';

describe('createInitialGameState', () => {
  it('creates a centered starter snake and deterministic food placement', () => {
    expect(createInitialGameState(20, 200)).toEqual({
      gridSize: 20,
      snake: [
        { x: 11, y: 10 },
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'idle',
      score: 0,
      speedMs: 200,
    });
  });

  it('supports the smallest allowed grid size', () => {
    expect(createInitialGameState(3, 150)).toEqual({
      gridSize: 3,
      snake: [
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'idle',
      score: 0,
      speedMs: 150,
    });
  });

  it('throws for an invalid grid size', () => {
    expect(() => createInitialGameState(2, 100)).toThrow(
      'gridSize must be an integer greater than or equal to 3.',
    );
  });

  it('throws for an invalid initial speed', () => {
    expect(() => createInitialGameState(10, 0)).toThrow(
      'initialSpeedMs must be a positive integer.',
    );
  });
});
