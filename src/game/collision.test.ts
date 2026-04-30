import { describe, expect, it } from 'vitest';

import { isSelfCollision, isWallCollision } from './collision';

describe('isWallCollision', () => {
  it('detects positions outside the grid', () => {
    expect(isWallCollision({ x: -1, y: 0 }, 10)).toBe(true);
    expect(isWallCollision({ x: 0, y: -1 }, 10)).toBe(true);
    expect(isWallCollision({ x: 10, y: 0 }, 10)).toBe(true);
    expect(isWallCollision({ x: 0, y: 10 }, 10)).toBe(true);
  });

  it('returns false for positions inside the grid', () => {
    expect(isWallCollision({ x: 0, y: 0 }, 10)).toBe(false);
    expect(isWallCollision({ x: 9, y: 9 }, 10)).toBe(false);
  });
});

describe('isSelfCollision', () => {
  it('detects when the head overlaps the body', () => {
    expect(
      isSelfCollision([
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ]),
    ).toBe(true);
  });

  it('returns false when the head does not overlap the body', () => {
    expect(
      isSelfCollision([
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 2, y: 2 },
      ]),
    ).toBe(false);
  });

  it('throws for an empty snake', () => {
    expect(() => isSelfCollision([])).toThrow(
      'snake must contain at least one segment.',
    );
  });
});
