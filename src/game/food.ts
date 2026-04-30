import type { GameState, Position, Snake } from './types';

export function positionsMatch(left: Position, right: Position): boolean {
  return left.x === right.x && left.y === right.y;
}

export function isFoodEaten(head: Position, food: Position): boolean {
  return positionsMatch(head, food);
}

export function spawnFood(
  gridSize: number,
  snake: Snake,
  random = Math.random,
): Position {
  const availablePositions: Position[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const candidate = { x, y };

      if (!snake.some((segment) => positionsMatch(segment, candidate))) {
        availablePositions.push(candidate);
      }
    }
  }

  if (availablePositions.length === 0) {
    throw new Error('Unable to place food on the grid.');
  }

  const index = Math.min(
    availablePositions.length - 1,
    Math.floor(random() * availablePositions.length),
  );

  return availablePositions[index];
}

export function resolveFoodConsumption(
  state: GameState,
  snake: Snake,
  random = Math.random,
): GameState {
  if (!isFoodEaten(snake[0], state.food)) {
    return {
      ...state,
      snake,
    };
  }

  return {
    ...state,
    snake,
    food: spawnFood(state.gridSize, snake, random),
    score: state.score + 1,
  };
}
