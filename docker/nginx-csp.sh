#!/bin/sh
# Собирает /etc/nginx/csp.conf при сборке образа nginx.
# Единственный встроенный скрипт страниц — window.__NUXT__ (config), он один и тот же на всех страницах:
# разрешается по хешу, без 'unsafe-inline' в script-src. Если скрипты разошлись или появился второй — сборка падает.
# Стили: Vue вшивает scoped-стили в <style> на каждой странице, хешами это не покрыть — style-src 'unsafe-inline'
# (TODO(question): new Н42).
set -eu

ROOT=/usr/share/nginx/html
HASH=""
for f in $(find "$ROOT" -name '*.html'); do
  n=$(grep -o '<script>' "$f" | wc -l)
  [ "$n" -le 1 ] || { echo "csp: в $f $n встроенных скриптов" >&2; exit 1; }
  [ "$n" -eq 1 ] || continue
  h=$(grep -o '<script>[^<]*</script>' "$f" | sed 's/^<script>//; s/<\/script>$//' | tr -d '\n' | openssl dgst -sha256 -binary | openssl base64 -A)
  if [ -z "$HASH" ]; then HASH="$h"; fi
  [ "$h" = "$HASH" ] || { echo "csp: хеш встроенного скрипта в $f отличается" >&2; exit 1; }
done
[ -n "$HASH" ] || { echo "csp: встроенный скрипт не найден" >&2; exit 1; }

GA_CONNECT="https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com"
YM_CONNECT="https://mc.yandex.ru https://mc.yandex.com"

CSP="default-src 'self'; script-src 'self' 'sha256-$HASH' https://www.googletagmanager.com https://mc.yandex.ru; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://mc.yandex.ru https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self'; connect-src 'self' $GA_CONNECT $YM_CONNECT; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
printf 'add_header Content-Security-Policy "%s" always;\n' "$CSP" > /etc/nginx/csp.conf
echo "csp: sha256-$HASH"
