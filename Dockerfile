# Host cargo build: not applicable; this is a Node/Vite project, and `npm run build` succeeded on the host.
# Production image strategy: copy the prebuilt dist/ bundle into an nginx runtime image.
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
