export type Position = {
  x: number;
  y: number;
};

export type Snake = Position[];

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameStatus = 'idle' | 'running' | 'game-over';

export type GameState = {
  gridSize: number;
  snake: Snake;
  food: Position;
  direction: Direction;
  status: GameStatus;
  score: number;
  speedMs: number;
};
