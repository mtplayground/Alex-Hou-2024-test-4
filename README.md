# Alex-Hou-2024-test-4

A TypeScript + Vite Snake game with a canvas renderer, keyboard controls, fixed-tick game loop primitives, local high-score storage, and Docker-based static delivery through nginx.

## Requirements

- Node.js 22+
- npm
- Docker and Docker Compose for containerized delivery

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the Vite dev server on `0.0.0.0:8080`:

```bash
npm run dev
```

3. Open the app in a browser at `http://localhost:8080`.

## Commands

- `npm run dev`: start the development server
- `npm run build`: create a production build in `dist/`
- `npm run preview`: preview the production build on `0.0.0.0:8080`
- `npm run test`: run the Vitest suite
- `npm run lint`: run ESLint
- `npm run format`: run Prettier

## Environment Variables

Copy `.env.example` to `.env` if you want to override the defaults.

```bash
cp .env.example .env
```

Supported Vite env vars:

- `VITE_GRID_SIZE`: logical board width and height in cells
- `VITE_INITIAL_SPEED_MS`: starting tick interval in milliseconds
- `VITE_SPEED_STEP_MS`: milliseconds removed from the tick interval at each speed-up threshold
- `VITE_SPEED_STEP_INTERVAL`: score interval used to apply each speed-up step

Default values are documented in [`.env.example`](/workspace/.env.example).

## Production Build

Create the static bundle with:

```bash
npm run build
```

This writes the app to `dist/`, which is what the nginx runtime image serves.

## Docker Delivery

Build and run the production container stack with:

```bash
docker compose up --build
```

This serves the built app through nginx on `http://localhost/`.

The nginx config includes an SPA-style fallback so unknown routes resolve to `index.html`.

To stop the container:

```bash
docker compose down
```

## Verification Checklist

- `npm run build`
- `npm run test`
- `npm run lint`
- `docker compose up --build`
