import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const moduleMocks = vi.hoisted(() => ({
  resizeCleanupMock: vi.fn(),
  keyboardCleanupMock: vi.fn(),
  attachResponsiveCanvasMock: vi.fn(),
  attachKeyboardInputMock: vi.fn(),
  createFixedTickLoopMock: vi.fn(),
  renderGameToCanvasMock: vi.fn(),
  getHighScoreMock: vi.fn(),
  setHighScoreMock: vi.fn(),
}));

vi.mock('./render/sizing', () => ({
  attachResponsiveCanvas: moduleMocks.attachResponsiveCanvasMock,
}));

vi.mock('./input/keyboard', () => ({
  attachKeyboardInput: moduleMocks.attachKeyboardInputMock,
}));

vi.mock('./game/loop', () => ({
  createFixedTickLoop: moduleMocks.createFixedTickLoopMock,
}));

vi.mock('./render/canvas', () => ({
  renderGameToCanvas: moduleMocks.renderGameToCanvasMock,
}));

vi.mock('./storage/high-score', () => ({
  getHighScore: moduleMocks.getHighScoreMock,
  setHighScore: moduleMocks.setHighScoreMock,
}));

import { getAppMarkup, renderApp } from './app';
import { readGameplayConfig } from './config/env';
import { createInitialGameState } from './game/initial-state';
import type { GameState } from './game/types';

moduleMocks.attachResponsiveCanvasMock.mockImplementation(
  () => moduleMocks.resizeCleanupMock,
);
moduleMocks.attachKeyboardInputMock.mockImplementation(
  () => moduleMocks.keyboardCleanupMock,
);

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

class MockCanvasContext {
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  imageSmoothingEnabled = false;

  clearRect(): void {}
  fillRect(): void {}
  beginPath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  stroke(): void {}
  setTransform(): void {}
}

class MockCanvasElement {
  width = 0;
  height = 0;
  style = {
    width: '320px',
    height: '320px',
  };

  constructor(private readonly context: MockCanvasContext) {}

  getContext(type: string): MockCanvasContext | null {
    return type === '2d' ? this.context : null;
  }
}

class MockContainer {
  innerHTML = '';
  private readonly elements = new Map<string, unknown>();

  add(selector: string, element: unknown): void {
    this.elements.set(selector, element);
  }

  querySelector<T>(selector: string): T | null {
    return (this.elements.get(selector) as T | undefined) ?? null;
  }
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gridSize: 7,
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
    ],
    food: { x: 5, y: 3 },
    direction: 'right',
    status: 'idle',
    score: 0,
    speedMs: 120,
    ...overrides,
  };
}

function createRenderContainer() {
  const container = new MockContainer();
  const context = new MockCanvasContext();
  const canvas = new MockCanvasElement(context);

  container.add('#game-board', canvas);
  container.add('#score-value', new MockElement());
  container.add('#high-score-value', new MockElement());
  container.add('#status-value', new MockElement());
  container.add('#pause-overlay', new MockElement());
  container.add('#game-over-overlay', new MockElement());
  container.add('#final-score-value', new MockElement());
  container.add('#new-high-score-badge', new MockElement());
  container.add('#restart-button', new MockElement());

  return {
    container,
    canvas,
    context,
  };
}

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

describe('renderApp', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 600,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    moduleMocks.resizeCleanupMock.mockClear();
    moduleMocks.keyboardCleanupMock.mockClear();
    moduleMocks.attachResponsiveCanvasMock.mockImplementation(
      () => moduleMocks.resizeCleanupMock,
    );
    moduleMocks.attachKeyboardInputMock.mockImplementation(
      () => moduleMocks.keyboardCleanupMock,
    );
    moduleMocks.getHighScoreMock.mockReturnValue(0);
    moduleMocks.setHighScoreMock.mockImplementation((score) => score);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('starts the fixed-tick loop, renders frames, and cleans up resources', () => {
    const config = readGameplayConfig({});
    const initialState = createState();
    const { container, context } = createRenderContainer();
    const loopStart = vi.fn();
    const loopStop = vi.fn();
    const loopSetState = vi.fn();
    let keyboardBindings:
      | {
          getCurrentDirection: () => string;
          onDirectionChange: (direction: string) => void;
          onControl: (control: string) => void;
        }
      | undefined;
    let loopOptions:
      | {
          update: (state: GameState) => GameState;
          render: (state: GameState) => void;
        }
      | undefined;

    moduleMocks.resizeCleanupMock.mockClear();
    moduleMocks.keyboardCleanupMock.mockClear();
    moduleMocks.renderGameToCanvasMock.mockClear();
    moduleMocks.attachKeyboardInputMock.mockImplementation((_, bindings) => {
      keyboardBindings = bindings;
      return moduleMocks.keyboardCleanupMock;
    });
    moduleMocks.createFixedTickLoopMock.mockImplementation((options) => {
      loopOptions = options;

      return {
        start: loopStart,
        stop: loopStop,
        getState: () => initialState,
        setState: loopSetState,
        isRunning: () => false,
      };
    });

    const cleanup = renderApp(
      container as unknown as Element,
      config,
      initialState,
    );

    expect(moduleMocks.attachResponsiveCanvasMock).toHaveBeenCalledOnce();
    expect(moduleMocks.attachKeyboardInputMock).toHaveBeenCalledOnce();
    expect(moduleMocks.createFixedTickLoopMock).toHaveBeenCalledOnce();
    expect(loopStart).toHaveBeenCalledOnce();

    keyboardBindings?.onControl('toggle-pause');
    expect(loopSetState).toHaveBeenLastCalledWith({
      ...initialState,
      status: 'running',
    });

    keyboardBindings?.onDirectionChange('up');
    const movedState = loopOptions?.update({
      ...initialState,
      status: 'running',
    });
    expect(movedState?.direction).toBe('up');

    loopOptions?.render({
      ...initialState,
      status: 'running',
    });

    expect(moduleMocks.renderGameToCanvasMock).toHaveBeenCalledWith(
      context,
      {
        ...initialState,
        status: 'running',
      },
      { boardSizePx: 320 },
    );

    const statusElement = container.querySelector<MockElement>('#status-value');
    expect(statusElement?.textContent).toBe('Running');

    cleanup();

    expect(moduleMocks.keyboardCleanupMock).toHaveBeenCalledOnce();
    expect(loopStop).toHaveBeenCalledOnce();
    expect(moduleMocks.resizeCleanupMock).toHaveBeenCalledOnce();
  });

  it('updates state through movement, food consumption, and game-over collisions', () => {
    const config = readGameplayConfig({});
    const initialState = createState();
    const { container } = createRenderContainer();
    let keyboardBindings:
      | {
          getCurrentDirection: () => string;
          onDirectionChange: (direction: string) => void;
          onControl: (control: string) => void;
        }
      | undefined;
    const loopSetState = vi.fn();
    let loopOptions:
      | {
          update: (state: GameState) => GameState;
          render: (state: GameState) => void;
        }
      | undefined;

    moduleMocks.attachKeyboardInputMock.mockImplementation((_, bindings) => {
      keyboardBindings = bindings;
      return moduleMocks.keyboardCleanupMock;
    });
    moduleMocks.createFixedTickLoopMock.mockImplementation((options) => {
      loopOptions = options;

      return {
        start: vi.fn(),
        stop: vi.fn(),
        getState: () => initialState,
        setState: loopSetState,
        isRunning: () => false,
      };
    });

    renderApp(container as unknown as Element, config, initialState);

    const scoredState = loopOptions?.update(
      createState({
        status: 'running',
        food: { x: 4, y: 3 },
      }),
    );

    expect(scoredState).toEqual({
      gridSize: 7,
      snake: [
        { x: 4, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'running',
      score: 1,
      speedMs: config.initialSpeedMs,
    });

    const gameOverState = loopOptions?.update(
      createState({
        status: 'running',
        snake: [
          { x: 6, y: 3 },
          { x: 5, y: 3 },
          { x: 4, y: 3 },
        ],
        food: { x: 0, y: 0 },
      }),
    );

    expect(gameOverState).toEqual({
      gridSize: 7,
      snake: [
        { x: 7, y: 3 },
        { x: 6, y: 3 },
        { x: 5, y: 3 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'game-over',
      score: 0,
      speedMs: 120,
    });

    keyboardBindings?.onControl('toggle-pause');
    expect(loopSetState).toHaveBeenLastCalledWith({
      ...initialState,
      status: 'running',
    });

    loopSetState.mockClear();
    keyboardBindings?.onControl('toggle-pause');
    expect(loopSetState).toHaveBeenLastCalledWith({
      ...initialState,
      status: 'paused',
    });

    loopSetState.mockClear();
    keyboardBindings?.onControl('restart');
    expect(loopSetState).toHaveBeenLastCalledWith({
      gridSize: 7,
      snake: [
        { x: 4, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'idle',
      score: 0,
      speedMs: 120,
    });
  });

  it('persists a new high score on game over and restarts from the overlay button', () => {
    const config = readGameplayConfig({});
    const initialState = createState();
    const { container } = createRenderContainer();
    const loopSetState = vi.fn();
    let loopOptions:
      | {
          update: (state: GameState) => GameState;
          render: (state: GameState) => void;
        }
      | undefined;

    moduleMocks.getHighScoreMock.mockReturnValue(4);
    moduleMocks.setHighScoreMock.mockReturnValue(9);
    moduleMocks.createFixedTickLoopMock.mockImplementation((options) => {
      loopOptions = options;

      return {
        start: vi.fn(),
        stop: vi.fn(),
        getState: () => initialState,
        setState: loopSetState,
        isRunning: () => false,
      };
    });

    const cleanup = renderApp(
      container as unknown as Element,
      config,
      initialState,
    );

    loopOptions?.render(
      createState({
        status: 'game-over',
        score: 9,
      }),
    );
    loopOptions?.render(
      createState({
        status: 'game-over',
        score: 9,
      }),
    );

    expect(moduleMocks.setHighScoreMock).toHaveBeenCalledTimes(1);
    expect(moduleMocks.setHighScoreMock).toHaveBeenCalledWith(9);

    const highScoreElement =
      container.querySelector<MockElement>('#high-score-value');
    const badgeElement =
      container.querySelector<MockElement>('#new-high-score-badge');
    expect(highScoreElement?.textContent).toBe('9');
    expect(badgeElement?.hidden).toBe(false);

    const restartButton =
      container.querySelector<MockElement>('#restart-button');
    restartButton?.click();

    expect(loopSetState).toHaveBeenLastCalledWith({
      gridSize: 7,
      snake: [
        { x: 4, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
      ],
      food: { x: 0, y: 0 },
      direction: 'right',
      status: 'idle',
      score: 0,
      speedMs: 120,
    });

    cleanup();
    loopSetState.mockClear();
    restartButton?.click();
    expect(loopSetState).not.toHaveBeenCalled();
  });
});
