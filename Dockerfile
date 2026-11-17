# Заготовка — docs «Инфраструктура» → «Docker и Nginx», «Деплой». Доводит агент devops.
# Один Dockerfile, два образа: стадия app (Nitro, только /api/lead) и стадия nginx (статика + прокси).
# TODO(question): new — node:20 вышел из поддержки 30.04.2026; см. docs/questions-log.md

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- app: node .output/server/index.mjs, непривилегированный пользователь, порт 3000 ----
FROM node:20-alpine AS app
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

# ---- nginx: отдаёт пререндеренные страницы и статику из .output/public ----
# TODO: brotli — в стандартном nginx:alpine модуля нет, нужен образ с модулем или сборка
FROM nginx:alpine AS nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
