import type { GameplayConfig } from './config/env';
import type { GameState } from './game/types';

export function getAppMarkup(
  config: GameplayConfig,
  initialState: GameState,
): string {
  return `
    <main>
      <h1>Snake Game</h1>
      <p>TypeScript + Vite bootstrap is ready.</p>
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
): void {
  container.innerHTML = getAppMarkup(config, initialState);
}
