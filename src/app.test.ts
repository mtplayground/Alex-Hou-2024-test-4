import { describe, expect, it, vi } from 'vitest';

import { getAppMarkup } from './app';
import { readGameplayConfig } from './config/env';
import { createInitialGameState } from './game/initial-state';

const resizeCleanupMock = vi.fn();

vi.mock('./render/sizing', () => ({
  attachResponsiveCanvas: vi.fn(() => resizeCleanupMock),
}));

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
    expect(markup).toContain('id="score-value"');
    expect(markup).toContain('id="high-score-value"');
    expect(markup).toContain('id="status-value"');
    expect(markup).toContain('id="pause-overlay"');
    expect(markup).toContain('id="game-over-overlay"');
    expect(markup).toContain('id="final-score-value"');
    expect(markup).toContain('id="restart-button"');
  });
});
