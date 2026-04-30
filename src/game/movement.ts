import type { Direction, Position, Snake } from './types';

function assertSnakeIsNotEmpty(snake: Snake): void {
  if (snake.length === 0) {
    throw new Error('snake must contain at least one segment.');
  }
}

export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}

export function resolveDirectionChange(
  currentDirection: Direction,
  requestedDirection: Direction,
): Direction {
  if (requestedDirection === getOppositeDirection(currentDirection)) {
    return currentDirection;
  }

  return requestedDirection;
}

export function getNextHeadPosition(
  currentHead: Position,
  direction: Direction,
): Position {
  switch (direction) {
    case 'up':
      return { x: currentHead.x, y: currentHead.y - 1 };
    case 'down':
      return { x: currentHead.x, y: currentHead.y + 1 };
    case 'left':
      return { x: currentHead.x - 1, y: currentHead.y };
    case 'right':
      return { x: currentHead.x + 1, y: currentHead.y };
  }
}

export function advanceSnake(
  snake: Snake,
  direction: Direction,
  shouldGrow = false,
): Snake {
  assertSnakeIsNotEmpty(snake);

  const nextHead = getNextHeadPosition(snake[0], direction);
  const nextSnake = [nextHead, ...snake];

  if (!shouldGrow) {
    nextSnake.pop();
  }

  return nextSnake;
}
