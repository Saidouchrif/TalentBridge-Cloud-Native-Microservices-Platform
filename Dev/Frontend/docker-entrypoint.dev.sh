#!/bin/sh
set -e
cd /app

# Le volume frontend_node_modules peut rester bloque sur une ancienne install.
# On re-synchronise quand package-lock.json change (bind-mount depuis l'hote).
want=$(md5sum package-lock.json | awk '{print $1}')
got=$(cat node_modules/.tb-lock-md5 2>/dev/null || true)
if [ "$want" != "$got" ]; then
  echo "[frontend] package-lock.json a change, npm ci..."
  npm ci \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000
  echo "$want" > node_modules/.tb-lock-md5
fi

exec "$@"
