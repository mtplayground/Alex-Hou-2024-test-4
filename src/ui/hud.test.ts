import { describe, expect, it } from 'vitest';

import { getHudMarkup, getStatusLabel, updateHud } from './hud';
import type { GameState } from '../game/types';

class MockElement {
  textContent = '';
  hidden = false;
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
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 5, y: 5 },
    direction: 'right',
    status: 'idle',
    score: 0,
    speedMs: 200,
    ...overrides,
  };
}

describe('getStatusLabel', () => {
  it('returns a readable label for each status', () => {
    expect(getStatusLabel('idle')).toBe('Ready');
    expect(getStatusLabel('running')).toBe('Running');
    expect(getStatusLabel('paused')).toBe('Paused');
    expect(getStatusLabel('game-over')).toBe('Game Over');
  });
});

describe('getHudMarkup', () => {
  it('includes score, high score, status, and pause overlay markup', () => {
    const markup = getHudMarkup(createState({ status: 'paused', score: 4 }), 9);

    expect(markup).toContain('id="score-value">4<');
    expect(markup).toContain('id="high-score-value">9<');
    expect(markup).toContain('id="status-value">Paused<');
    expect(markup).toContain('id="pause-overlay"');
  });
});

describe('updateHud', () => {
  it('updates score, high score, status, and pause visibility', () => {
    const container = new MockContainer();
    const scoreElement = new MockElement();
    const highScoreElement = new MockElement();
    const statusElement = new MockElement();
    const pauseOverlay = new MockElement();

    container.add('#score-value', scoreElement);
    container.add('#high-score-value', highScoreElement);
    container.add('#status-value', statusElement);
    container.add('#pause-overlay', pauseOverlay);

    updateHud(container, createState({ score: 7, status: 'paused' }), 12);

    expect(scoreElement.textContent).toBe('7');
    expect(highScoreElement.textContent).toBe('12');
    expect(statusElement.textContent).toBe('Paused');
    expect(pauseOverlay.hidden).toBe(false);
  });

  it('hides the pause overlay when the game is not paused', () => {
    const container = new MockContainer();
    const scoreElement = new MockElement();
    const highScoreElement = new MockElement();
    const statusElement = new MockElement();
    const pauseOverlay = new MockElement();
    pauseOverlay.hidden = false;

    container.add('#score-value', scoreElement);
    container.add('#high-score-value', highScoreElement);
    container.add('#status-value', statusElement);
    container.add('#pause-overlay', pauseOverlay);

    updateHud(container, createState({ status: 'running' }), 3);

    expect(statusElement.textContent).toBe('Running');
    expect(pauseOverlay.hidden).toBe(true);
  });
});
