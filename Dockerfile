# Self-check: `cargo build --release` is not applicable because this repository is a Node/Vite static app.
# Host build status: `npm run build` succeeded on the host; this Dockerfile rebuilds the static bundle in a builder stage because `dist/` is not committed.
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
