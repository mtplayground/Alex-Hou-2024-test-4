/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRID_SIZE?: string;
  readonly VITE_INITIAL_SPEED_MS?: string;
  readonly VITE_SPEED_STEP_MS?: string;
  readonly VITE_SPEED_STEP_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
