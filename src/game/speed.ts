import { gameplayConfig } from '../config/env';

function assertValidScore(score: number): void {
  if (!Number.isInteger(score) || score < 0) {
    throw new Error('score must be a non-negative integer.');
  }
}

function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
}

export function getTickIntervalForScore(
  score: number,
  initialSpeedMs = gameplayConfig.initialSpeedMs,
  speedStepMs = gameplayConfig.speedStepMs,
  speedStepInterval = gameplayConfig.speedStepInterval,
): number {
  assertValidScore(score);
  assertPositiveInteger(initialSpeedMs, 'initialSpeedMs');
  assertPositiveInteger(speedStepMs, 'speedStepMs');
  assertPositiveInteger(speedStepInterval, 'speedStepInterval');

  const speedReductionSteps = Math.floor(score / speedStepInterval);

  return Math.max(1, initialSpeedMs - speedReductionSteps * speedStepMs);
}
