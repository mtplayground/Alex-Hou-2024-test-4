import type { GameplayConfig } from './config/env';
import { isSelfCollision, isWallCollision } from './game/collision';
import { isFoodEaten, resolveFoodConsumption } from './game/food';
import { createFixedTickLoop } from './game/loop';
import { attachKeyboardInput } from './input/keyboard';
import { advanceSnake, resolveDirectionChange } from './game/movement';
import { getTickIntervalForScore } from './game/speed';
import type { Direction, GameState } from './game/types';
import { renderGameToCanvas } from './render/canvas';
import { attachResponsiveCanvas } from './render/sizing';
import { getHighScore } from './storage/high-score';
import {
  createRestartedGameState,
  getGameOverOverlayMarkup,
  updateGameOverOverlay,
} from './ui/game-over';
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

  let currentState = initialState;
  let pendingDirection: Direction = initialState.direction;
  const highScore = getHighScore();

  const resizeCleanup = attachResponsiveCanvas(
    window,
    canvas,
    context,
    () => currentState,
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
  );

  const loop = createFixedTickLoop({
    initialState,
    update: (state) => {
      const direction = resolveDirectionChange(state.direction, pendingDirection);
      const nextHead = advanceSnake([state.snake[0]], direction)[0];
      const shouldGrow = isFoodEaten(nextHead, state.food);
      const nextSnake = advanceSnake(state.snake, direction, shouldGrow);

      if (
        isWallCollision(nextSnake[0], state.gridSize) ||
        isSelfCollision(nextSnake)
      ) {
        pendingDirection = direction;

        return {
          ...state,
          direction,
          snake: nextSnake,
          status: 'game-over',
        };
      }

      const nextState = resolveFoodConsumption(
        {
          ...state,
          direction,
        },
        nextSnake,
      );

      const updatedState: GameState = {
        ...nextState,
        status: 'running',
        speedMs: getTickIntervalForScore(
          nextState.score,
          config.initialSpeedMs,
          config.speedStepMs,
          config.speedStepInterval,
        ),
      };

      pendingDirection = updatedState.direction;

      return updatedState;
    },
    render: (state) => {
      currentState = state;

      const boardSizePx = Number.parseFloat(canvas.style.width);

      renderGameToCanvas(
        context,
        state,
        Number.isFinite(boardSizePx) && boardSizePx > 0
          ? { boardSizePx }
          : undefined,
      );
      updateHud(container, state, highScore);
      updateGameOverOverlay(container, state, highScore);
    },
  });

  const keyboardCleanup = attachKeyboardInput(window, {
    getCurrentDirection: () => pendingDirection,
    onDirectionChange: (direction) => {
      pendingDirection = direction;
    },
    onControl: (control) => {
      if (control === 'toggle-pause') {
        const status =
          currentState.status === 'running'
            ? 'paused'
            : currentState.status === 'paused' || currentState.status === 'idle'
              ? 'running'
              : currentState.status;

        currentState = {
          ...currentState,
          status,
        };
        loop.setState(currentState);
        return;
      }

      const restartedState = createRestartedGameState(currentState);
      pendingDirection = restartedState.direction;
      currentState = restartedState;
      loop.setState(restartedState);
    },
  });

  loop.start();

  return () => {
    keyboardCleanup();
    loop.stop();
    resizeCleanup();
  };
}
