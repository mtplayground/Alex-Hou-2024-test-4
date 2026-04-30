import { positionsMatch } from './food';

import type { Position, Snake } from './types';

export function isWallCollision(position: Position, gridSize: number): boolean {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

export function isSelfCollision(snake: Snake): boolean {
  const [head, ...body] = snake;

  if (!head) {
    throw new Error('snake must contain at least one segment.');
  }

  return body.some((segment) => positionsMatch(head, segment));
}
