import { describe, expect, it, vi } from 'vitest';

import {
  attachRestartButtonHandler,
  createRestartedGameState,
  getGameOverOverlayMarkup,
  shouldShowNewHighScoreBadge,
  updateGameOverOverlay,
} from './game-over';
import type { GameState } from '../game/types';

class MockElement {
  textContent = '';
  hidden = false;
  private readonly listeners = new Map<string, Set<() => void>>();

  addEventListener(eventName: string, listener: () => void): void {
    const listeners = this.listeners.get(eventName) ?? new Set<() => void>();
    listeners.add(listener);
    this.listeners.set(eventName, listeners);
  }

  removeEventListener(eventName: string, listener: () => void): void {
    this.listeners.get(eventName)?.delete(listener);
  }

  click(): void {
    for (const listener of this.listeners.get('click') ?? []) {
      listener();
    }
  }
}

class MockContainer {
  private readonly elements = new Map<string, MockElement>();

  add(selector: string, element: MockElement): void {
    this.elements.set(selector, element);
  }

  querySelector<T>(selector: string): T | null {
    return (this.elements.get(selector) as T | undefined) ?? null;
  }
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
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
    ...overrides,
  };
}

describe('shouldShowNewHighScoreBadge', () => {
  it('shows the badge only for a game-over high score', () => {
    expect(
      shouldShowNewHighScoreBadge(
        createState({ status: 'game-over', score: 9 }),
        8,
      ),
    ).toBe(true);
    expect(
      shouldShowNewHighScoreBadge(createState({ status: 'running', score: 9 }), 8),
    ).toBe(false);
    expect(
      shouldShowNewHighScoreBadge(
        createState({ status: 'game-over', score: 0 }),
        0,
      ),
    ).toBe(false);
  });
});

describe('getGameOverOverlayMarkup', () => {
  it('renders the final score, badge, and restart button', () => {
    const markup = getGameOverOverlayMarkup(
      createState({ status: 'game-over', score: 12 }),
      10,
    );

    expect(markup).toContain('id="game-over-overlay"');
    expect(markup).toContain('id="final-score-value">12<');
    expect(markup).toContain('id="new-high-score-badge"');
    expect(markup).toContain('id="restart-button"');
  });
});

describe('updateGameOverOverlay', () => {
  it('updates visibility, score, and badge state', () => {
    const container = new MockContainer();
    const overlay = new MockElement();
    const finalScore = new MockElement();
    const newHighScoreBadge = new MockElement();

    container.add('#game-over-overlay', overlay);
    container.add('#final-score-value', finalScore);
    container.add('#new-high-score-badge', newHighScoreBadge);

    updateGameOverOverlay(
      container,
      createState({ status: 'game-over', score: 15 }),
      10,
    );

    expect(overlay.hidden).toBe(false);
    expect(finalScore.textContent).toBe('15');
    expect(newHighScoreBadge.hidden).toBe(false);
  });

  it('hides the overlay and badge when the game is not over', () => {
    const container = new MockContainer();
    const overlay = new MockElement();
    const finalScore = new MockElement();
    const newHighScoreBadge = new MockElement();

    container.add('#game-over-overlay', overlay);
    container.add('#final-score-value', finalScore);
    container.add('#new-high-score-badge', newHighScoreBadge);

    updateGameOverOverlay(container, createState({ status: 'running', score: 5 }), 5);

    expect(overlay.hidden).toBe(true);
    expect(newHighScoreBadge.hidden).toBe(true);
  });
});

describe('attachRestartButtonHandler', () => {
  it('wires and unwires the restart button click handler', () => {
    const container = new MockContainer();
    const restartButton = new MockElement();
    const onRestart = vi.fn();

    container.add('#restart-button', restartButton);

    const detach = attachRestartButtonHandler(container, onRestart);

    restartButton.click();
    expect(onRestart).toHaveBeenCalledTimes(1);

    detach();
    restartButton.click();
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});

describe('createRestartedGameState', () => {
  it('resets to a fresh game state at the same grid size', () => {
    expect(
      createRestartedGameState(
        createState({
          status: 'game-over',
          score: 12,
          speedMs: 150,
        }),
      ),
    ).toEqual({
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
      speedMs: 150,
    });
  });
});
