# Инфраструктура → «Docker и Nginx», «Деплой» (Р20, Н2: Node 22).
# Один Dockerfile, два образа: --target app (Nitro, только POST /api/lead) и --target nginx (статика + прокси).

# ---- build ----
# Н75: версии и digest закреплены; обновляет Dependabot (.github/dependabot.yml).
FROM node:26.13.1-alpine3.24@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Публичные переменные попадают в пререндеренный HTML при сборке (не секреты). Значения — build args из CI;
# файл окружения на сервере на пререндер не влияет. Секреты (SMTP_*, MAIL_*) сюда не передаются.
ARG NUXT_PUBLIC_SITE_URL=https://mesto.studio
ARG NUXT_PUBLIC_ANALYTICS_ENABLED=false
ARG NUXT_PUBLIC_GA_ID=
ARG NUXT_PUBLIC_YM_ID=
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL \
    NUXT_PUBLIC_ANALYTICS_ENABLED=$NUXT_PUBLIC_ANALYTICS_ENABLED \
    NUXT_PUBLIC_GA_ID=$NUXT_PUBLIC_GA_ID \
    NUXT_PUBLIC_YM_ID=$NUXT_PUBLIC_YM_ID
RUN npm run build

# ---- app: node .output/server/index.mjs, непривилегированный пользователь, порт 3000 только внутри сети ----
FROM node:26.13.1-alpine3.24@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS app
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

# ---- nginx: пререндеренные страницы и статика из .output/public, POST /api/lead → app (Н76), gzip + brotli ----
# В стоковом nginx:alpine brotli нет, поэтому nginx и модуль ngx_brotli ставятся из одного репозитория Alpine.
FROM alpine:3.22.8@sha256:49340b346798875b5592e5d420241f2f9cfba5f47e62ebb1446a1b34734e898f AS nginx
RUN apk add --no-cache nginx nginx-mod-http-brotli openssl
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker/ssl-params.conf docker/security-headers.conf /etc/nginx/
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
COPY docker/nginx-csp.sh /nginx-csp.sh
COPY --from=build /app/.output/public /usr/share/nginx/html
# CSP с хешем встроенного скрипта Nuxt (общий для всех страниц), падает, если страницы разошлись.
RUN chmod +x /docker-entrypoint.sh /nginx-csp.sh && /nginx-csp.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
