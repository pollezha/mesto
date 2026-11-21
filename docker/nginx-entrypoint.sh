#!/bin/sh
# Запуск nginx: подбирает сертификат и периодически перечитывает конфигурацию (продление Let's Encrypt).
set -eu

LIVE=/etc/letsencrypt/live/mesto.studio
FALLBACK=/etc/nginx/fallback-cert

# Пока Let's Encrypt не выпустил сертификат (первый запуск, локальная проверка), nginx стартует
# с самоподписанным, иначе он не поднимется и certbot не пройдёт проверку по http.
select_cert() {
  if [ -s "$LIVE/fullchain.pem" ] && [ -s "$LIVE/privkey.pem" ]; then
    CERT="$LIVE/fullchain.pem"; KEY="$LIVE/privkey.pem"
  else
    echo "nginx: сертификат Let's Encrypt не найден, используется самоподписанный" >&2
    mkdir -p "$FALLBACK"
    if [ ! -s "$FALLBACK/fullchain.pem" ]; then
      openssl req -x509 -nodes -newkey rsa:2048 -days 30 -subj "/CN=mesto.studio" \
        -keyout "$FALLBACK/privkey.pem" -out "$FALLBACK/fullchain.pem" 2>/dev/null
    fi
    CERT="$FALLBACK/fullchain.pem"; KEY="$FALLBACK/privkey.pem"
  fi
  printf 'ssl_certificate %s;\nssl_certificate_key %s;\n' "$CERT" "$KEY" > /etc/nginx/ssl-cert.conf
}

select_cert

# certbot продлевает сертификат сам; nginx раз в 6 часов заново выбирает сертификат и перечитывает конфигурацию.
(while :; do sleep 21600; select_cert 2>/dev/null; nginx -s reload 2>/dev/null || true; done) &

exec "$@"
