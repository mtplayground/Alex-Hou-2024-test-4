# Host cargo build: not applicable; this is a Node/Vite project, so Rust PATH A/PATH B rules do not apply.
# Production image strategy: build static assets in Node, then serve only dist/ with nginx at runtime.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts eslint.config.js ./
COPY .env.example ./
COPY src ./src
RUN npm run build

FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
