import { describe, expect, it } from 'vitest';

import { readGameplayConfig } from './env';

describe('readGameplayConfig', () => {
  it('returns defaults when env vars are missing', () => {
    expect(readGameplayConfig({})).toEqual({
      gridSize: 20,
      initialSpeedMs: 200,
      speedStepMs: 10,
      speedStepInterval: 5,
    });
  });

  it('parses explicit env var overrides', () => {
    expect(
      readGameplayConfig({
        VITE_GRID_SIZE: '24',
        VITE_INITIAL_SPEED_MS: '180',
        VITE_SPEED_STEP_MS: '15',
        VITE_SPEED_STEP_INTERVAL: '4',
      }),
    ).toEqual({
      gridSize: 24,
      initialSpeedMs: 180,
      speedStepMs: 15,
      speedStepInterval: 4,
    });
  });

  it('throws for invalid values', () => {
    expect(() =>
      readGameplayConfig({
        VITE_GRID_SIZE: '0',
      }),
    ).toThrow('VITE_GRID_SIZE must be a positive integer.');
  });
});
