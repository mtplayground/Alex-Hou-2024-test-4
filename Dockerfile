# Self-check: `cargo build --release` is not applicable because this repository is a Node/Vite static app.
# Host build status: `npm run build` succeeded on the host, so this runtime image copies the prebuilt `dist/` bundle.
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
