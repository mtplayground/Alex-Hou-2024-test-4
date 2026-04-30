import { describe, expect, it } from 'vitest';

import { getAppMarkup } from './app';
import { readGameplayConfig } from './config/env';
import { createInitialGameState } from './game/initial-state';

describe('getAppMarkup', () => {
  it('returns the starter snake game markup', () => {
    const config = readGameplayConfig({});
    const markup = getAppMarkup(
      config,
      createInitialGameState(config.gridSize, config.initialSpeedMs),
    );

    expect(markup).toContain('Snake Game');
    expect(markup).toContain('TypeScript + Vite bootstrap is ready.');
    expect(markup).toContain('Grid size: 20');
    expect(markup).toContain('Starting snake length: 3');
    expect(markup).toContain('id="game-board"');
  });
});
