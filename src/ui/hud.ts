import type { GameState, GameStatus } from '../game/types';

type HudElementMap = {
  score: '#score-value';
  highScore: '#high-score-value';
  status: '#status-value';
  pauseOverlay: '#pause-overlay';
};

function getRequiredElement(
  container: Pick<ParentNode, 'querySelector'>,
  selector: string,
): HTMLElement {
  const element = container.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`Expected HUD element ${selector} to exist.`);
  }

  return element;
}

export function getStatusLabel(status: GameStatus): string {
  switch (status) {
    case 'idle':
      return 'Ready';
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    case 'game-over':
      return 'Game Over';
  }
}

export function getHudMarkup(state: GameState, highScore: number): string {
  return `
    <section class="hud" aria-label="Game status">
      <p>Score: <span id="score-value">${state.score}</span></p>
      <p>High Score: <span id="high-score-value">${highScore}</span></p>
      <p>Status: <span id="status-value">${getStatusLabel(state.status)}</span></p>
    </section>
    <div id="pause-overlay" ${state.status === 'paused' ? '' : 'hidden'}>
      Paused
    </div>
  `;
}

export function updateHud(
  container: Pick<ParentNode, 'querySelector'>,
  state: GameState,
  highScore: number,
): void {
  const selectors: HudElementMap = {
    score: '#score-value',
    highScore: '#high-score-value',
    status: '#status-value',
    pauseOverlay: '#pause-overlay',
  };

  getRequiredElement(container, selectors.score).textContent = String(
    state.score,
  );
  getRequiredElement(container, selectors.highScore).textContent = String(
    highScore,
  );
  getRequiredElement(container, selectors.status).textContent = getStatusLabel(
    state.status,
  );

  const pauseOverlay = getRequiredElement(container, selectors.pauseOverlay);
  pauseOverlay.hidden = state.status !== 'paused';
}
