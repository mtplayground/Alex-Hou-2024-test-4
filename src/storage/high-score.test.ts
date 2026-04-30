import { describe, expect, it } from 'vitest';

import { getHighScore, setHighScore } from './high-score';

class MockStorage {
  private readonly values = new Map<string, string>();

  constructor(
    private readonly options: {
      throwOnGet?: boolean;
      throwOnSet?: boolean;
    } = {},
  ) {}

  getItem(key: string): string | null {
    if (this.options.throwOnGet) {
      throw new Error('storage unavailable');
    }

    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.options.throwOnSet) {
      throw new Error('storage unavailable');
    }

    this.values.set(key, value);
  }
}

describe('getHighScore', () => {
  it('returns zero when storage is unavailable', () => {
    expect(getHighScore(null)).toBe(0);
  });

  it('returns zero when no value is stored', () => {
    expect(getHighScore(new MockStorage())).toBe(0);
  });

  it('returns zero when the stored value is invalid', () => {
    const storage = new MockStorage();
    storage.setItem('snake-high-score', 'not-a-number');

    expect(getHighScore(storage)).toBe(0);
  });

  it('returns the stored high score when available', () => {
    const storage = new MockStorage();
    storage.setItem('snake-high-score', '42');

    expect(getHighScore(storage)).toBe(42);
  });

  it('falls back to zero when storage access throws', () => {
    expect(getHighScore(new MockStorage({ throwOnGet: true }))).toBe(0);
  });
});

describe('setHighScore', () => {
  it('stores a new high score', () => {
    const storage = new MockStorage();

    expect(setHighScore(15, storage)).toBe(15);
    expect(getHighScore(storage)).toBe(15);
  });

  it('does not lower an existing high score', () => {
    const storage = new MockStorage();
    storage.setItem('snake-high-score', '20');

    expect(setHighScore(10, storage)).toBe(20);
    expect(getHighScore(storage)).toBe(20);
  });

  it('returns the score without storing when storage is unavailable', () => {
    expect(setHighScore(8, null)).toBe(8);
  });

  it('falls back to the current high score when writes fail', () => {
    const storage = new MockStorage({ throwOnSet: true });

    expect(setHighScore(12, storage)).toBe(0);
  });

  it('throws for an invalid next high score', () => {
    expect(() => setHighScore(-1, new MockStorage())).toThrow(
      'nextHighScore must be a non-negative integer.',
    );
  });
});
