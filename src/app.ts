import type { GameplayConfig } from './config/env';
import type { GameState } from './game/types';
import { attachResponsiveCanvas } from './render/sizing';
import { getHighScore } from './storage/high-score';
import { getGameOverOverlayMarkup, updateGameOverOverlay } from './ui/game-over';
import { getHudMarkup, updateHud } from './ui/hud';

export function getAppMarkup(
  config: GameplayConfig,
  initialState: GameState,
  highScore = getHighScore(),
): string {
  return `
    <main>
      <h1>Snake Game</h1>
      <p>TypeScript + Vite bootstrap is ready.</p>
      ${getHudMarkup(initialState, highScore)}
      ${getGameOverOverlayMarkup(initialState, highScore)}
      <canvas
        id="game-board"
        aria-label="Snake game board"
        role="img"
      ></canvas>
      <ul>
        <li>Grid size: ${config.gridSize}</li>
        <li>Initial speed: ${config.initialSpeedMs} ms</li>
        <li>Speed step: ${config.speedStepMs} ms</li>
        <li>Speed step interval: ${config.speedStepInterval}</li>
        <li>Starting status: ${initialState.status}</li>
        <li>Starting snake length: ${initialState.snake.length}</li>
        <li>Starting food: (${initialState.food.x}, ${initialState.food.y})</li>
      </ul>
    </main>
  `;
}

export function renderApp(
  container: Element,
  config: GameplayConfig,
  initialState: GameState,
): () => void {
  container.innerHTML = getAppMarkup(config, initialState);

  const canvas = container.querySelector<HTMLCanvasElement>('#game-board');

  if (!canvas) {
    throw new Error('Expected #game-board canvas to exist.');
  }

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Expected a 2D canvas context.');
  }

  const highScore = getHighScore();

  updateHud(container, initialState, highScore);
  updateGameOverOverlay(container, initialState, highScore);

  return attachResponsiveCanvas(
    window,
    canvas,
    context,
    () => initialState,
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
  );
}
