import type { GameplayConfig } from './config/env';

export function getAppMarkup(config: GameplayConfig): string {
  return `
    <main>
      <h1>Snake Game</h1>
      <p>TypeScript + Vite bootstrap is ready.</p>
      <ul>
        <li>Grid size: ${config.gridSize}</li>
        <li>Initial speed: ${config.initialSpeedMs} ms</li>
        <li>Speed step: ${config.speedStepMs} ms</li>
        <li>Speed step interval: ${config.speedStepInterval}</li>
      </ul>
    </main>
  `;
}

export function renderApp(container: Element, config: GameplayConfig): void {
  container.innerHTML = getAppMarkup(config);
}
