export type GameplayConfig = {
  gridSize: number;
  initialSpeedMs: number;
  speedStepMs: number;
  speedStepInterval: number;
};

type EnvSource = Record<string, string | undefined>;

const DEFAULT_GAMEPLAY_CONFIG: GameplayConfig = {
  gridSize: 20,
  initialSpeedMs: 200,
  speedStepMs: 10,
  speedStepInterval: 5,
};

function parsePositiveInteger(
  rawValue: string | undefined,
  envKey: keyof EnvSource,
  fallback: number,
): number {
  if (rawValue === undefined || rawValue.trim() === '') {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${String(envKey)} must be a positive integer.`);
  }

  return parsedValue;
}

export function readGameplayConfig(env: EnvSource): GameplayConfig {
  return {
    gridSize: parsePositiveInteger(
      env.VITE_GRID_SIZE,
      'VITE_GRID_SIZE',
      DEFAULT_GAMEPLAY_CONFIG.gridSize,
    ),
    initialSpeedMs: parsePositiveInteger(
      env.VITE_INITIAL_SPEED_MS,
      'VITE_INITIAL_SPEED_MS',
      DEFAULT_GAMEPLAY_CONFIG.initialSpeedMs,
    ),
    speedStepMs: parsePositiveInteger(
      env.VITE_SPEED_STEP_MS,
      'VITE_SPEED_STEP_MS',
      DEFAULT_GAMEPLAY_CONFIG.speedStepMs,
    ),
    speedStepInterval: parsePositiveInteger(
      env.VITE_SPEED_STEP_INTERVAL,
      'VITE_SPEED_STEP_INTERVAL',
      DEFAULT_GAMEPLAY_CONFIG.speedStepInterval,
    ),
  };
}

export const gameplayConfig = readGameplayConfig(import.meta.env);
