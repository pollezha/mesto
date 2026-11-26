# Инфраструктура → «Docker и Nginx», «Деплой» (Р20, Н2: Node 22).
# Один Dockerfile, два образа: --target app (Nitro, только POST /api/lead) и --target nginx (статика + прокси).

# ---- build ----
# Н75: версии и digest закреплены; обновляет Dependabot (.github/dependabot.yml).
FROM node:22.23.5-alpine3.24@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS build
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
FROM node:22.23.5-alpine3.24@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS app
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

# ---- nginx: пререндеренные страницы и статика из .output/public, POST /api/lead → app (Н76), gzip + brotli ----
# В стоковом nginx:alpine brotli нет, поэтому nginx и модуль ngx_brotli ставятся из одного репозитория Alpine.
FROM alpine:3.24.4@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf AS nginx
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
