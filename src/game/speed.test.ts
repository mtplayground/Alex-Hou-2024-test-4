import { describe, expect, it } from 'vitest';

import { getTickIntervalForScore } from './speed';

describe('getTickIntervalForScore', () => {
  it('returns the initial speed before the first threshold', () => {
    expect(getTickIntervalForScore(0, 200, 10, 5)).toBe(200);
    expect(getTickIntervalForScore(4, 200, 10, 5)).toBe(200);
  });

  it('reduces speed at each configured score interval', () => {
    expect(getTickIntervalForScore(5, 200, 10, 5)).toBe(190);
    expect(getTickIntervalForScore(10, 200, 10, 5)).toBe(180);
    expect(getTickIntervalForScore(14, 200, 10, 5)).toBe(180);
  });

  it('never returns less than one millisecond', () => {
    expect(getTickIntervalForScore(200, 20, 10, 2)).toBe(1);
  });

  it('throws for an invalid score', () => {
    expect(() => getTickIntervalForScore(-1, 200, 10, 5)).toThrow(
      'score must be a non-negative integer.',
    );
  });

  it('throws for invalid speed config values', () => {
    expect(() => getTickIntervalForScore(0, 0, 10, 5)).toThrow(
      'initialSpeedMs must be a positive integer.',
    );
    expect(() => getTickIntervalForScore(0, 200, 0, 5)).toThrow(
      'speedStepMs must be a positive integer.',
    );
    expect(() => getTickIntervalForScore(0, 200, 10, 0)).toThrow(
      'speedStepInterval must be a positive integer.',
    );
  });
});
