import { createInitialGameState } from '../game/initial-state';

import type { GameState } from '../game/types';

function getRequiredElement(
  container: Pick<ParentNode, 'querySelector'>,
  selector: string,
): HTMLElement {
  const element = container.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`Expected game-over element ${selector} to exist.`);
  }

  return element;
}

export function shouldShowNewHighScoreBadge(
  state: GameState,
  highScore: number,
): boolean {
  return state.status === 'game-over' && state.score >= highScore && state.score > 0;
}

export function getGameOverOverlayMarkup(
  state: GameState,
  highScore: number,
): string {
  const isVisible = state.status === 'game-over';
  const showNewHighScore = shouldShowNewHighScoreBadge(state, highScore);

  return `
    <section
      id="game-over-overlay"
      aria-label="Game over"
      ${isVisible ? '' : 'hidden'}
    >
      <h2>Game Over</h2>
      <p>Final Score: <span id="final-score-value">${state.score}</span></p>
      <p id="new-high-score-badge" ${showNewHighScore ? '' : 'hidden'}>
        New High Score
      </p>
      <button id="restart-button" type="button">Restart</button>
    </section>
  `;
}

export function updateGameOverOverlay(
  container: Pick<ParentNode, 'querySelector'>,
  state: GameState,
  highScore: number,
): void {
  const overlay = getRequiredElement(container, '#game-over-overlay');
  const finalScore = getRequiredElement(container, '#final-score-value');
  const newHighScoreBadge = getRequiredElement(
    container,
    '#new-high-score-badge',
  );

  overlay.hidden = state.status !== 'game-over';
  finalScore.textContent = String(state.score);
  newHighScoreBadge.hidden = !shouldShowNewHighScoreBadge(state, highScore);
}

export function attachRestartButtonHandler(
  container: Pick<ParentNode, 'querySelector'>,
  onRestart: () => void,
): () => void {
  const restartButton = getRequiredElement(
    container,
    '#restart-button',
  ) as HTMLButtonElement;

  const handleClick = (): void => {
    onRestart();
  };

  restartButton.addEventListener('click', handleClick);

  return () => {
    restartButton.removeEventListener('click', handleClick);
  };
}

export function createRestartedGameState(state: GameState): GameState {
  return createInitialGameState(state.gridSize, state.speedMs);
}
