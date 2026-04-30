import { renderApp } from './app';
import { gameplayConfig } from './config/env';
import { createInitialGameState } from './game/initial-state';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Expected #app container to exist.');
}

renderApp(
  app,
  gameplayConfig,
  createInitialGameState(
    gameplayConfig.gridSize,
    gameplayConfig.initialSpeedMs,
  ),
);
