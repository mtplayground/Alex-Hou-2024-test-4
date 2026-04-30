const HIGH_SCORE_STORAGE_KEY = 'snake-high-score';

export type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>;

function getDefaultStorage(): ScoreStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getHighScore(storage = getDefaultStorage()): number {
  if (!storage) {
    return 0;
  }

  try {
    const value = storage.getItem(HIGH_SCORE_STORAGE_KEY);

    if (value === null) {
      return 0;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
      return 0;
    }

    return parsedValue;
  } catch {
    return 0;
  }
}

export function setHighScore(
  nextHighScore: number,
  storage = getDefaultStorage(),
): number {
  if (!Number.isInteger(nextHighScore) || nextHighScore < 0) {
    throw new Error('nextHighScore must be a non-negative integer.');
  }

  const currentHighScore = getHighScore(storage);
  const storedHighScore = Math.max(currentHighScore, nextHighScore);

  if (!storage) {
    return storedHighScore;
  }

  try {
    storage.setItem(HIGH_SCORE_STORAGE_KEY, String(storedHighScore));
  } catch {
    return currentHighScore;
  }

  return storedHighScore;
}
