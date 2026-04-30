import { describe, expect, it } from 'vitest';

import {
  advanceSnake,
  getNextHeadPosition,
  getOppositeDirection,
  resolveDirectionChange,
} from './movement';

describe('getOppositeDirection', () => {
  it('returns the opposite cardinal direction', () => {
    expect(getOppositeDirection('up')).toBe('down');
    expect(getOppositeDirection('down')).toBe('up');
    expect(getOppositeDirection('left')).toBe('right');
    expect(getOppositeDirection('right')).toBe('left');
  });
});

describe('resolveDirectionChange', () => {
  it('applies a non-reversing direction change', () => {
    expect(resolveDirectionChange('right', 'up')).toBe('up');
  });

  it('rejects a 180-degree reversal', () => {
    expect(resolveDirectionChange('right', 'left')).toBe('right');
    expect(resolveDirectionChange('up', 'down')).toBe('up');
  });
});

describe('getNextHeadPosition', () => {
  it('computes the next head position for each direction', () => {
    expect(getNextHeadPosition({ x: 4, y: 4 }, 'up')).toEqual({ x: 4, y: 3 });
    expect(getNextHeadPosition({ x: 4, y: 4 }, 'down')).toEqual({
      x: 4,
      y: 5,
    });
    expect(getNextHeadPosition({ x: 4, y: 4 }, 'left')).toEqual({
      x: 3,
      y: 4,
    });
    expect(getNextHeadPosition({ x: 4, y: 4 }, 'right')).toEqual({
      x: 5,
      y: 4,
    });
  });
});

describe('advanceSnake', () => {
  it('moves the snake forward by one tick', () => {
    expect(
      advanceSnake(
        [
          { x: 5, y: 3 },
          { x: 4, y: 3 },
          { x: 3, y: 3 },
        ],
        'right',
      ),
    ).toEqual([
      { x: 6, y: 3 },
      { x: 5, y: 3 },
      { x: 4, y: 3 },
    ]);
  });

  it('grows the snake when requested', () => {
    expect(
      advanceSnake(
        [
          { x: 5, y: 3 },
          { x: 4, y: 3 },
          { x: 3, y: 3 },
        ],
        'right',
        true,
      ),
    ).toEqual([
      { x: 6, y: 3 },
      { x: 5, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 3 },
    ]);
  });

  it('throws for an empty snake', () => {
    expect(() => advanceSnake([], 'right')).toThrow(
      'snake must contain at least one segment.',
    );
  });
});
