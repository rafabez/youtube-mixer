#!/usr/bin/env bash
# Deploy the site to the VPS stack at /srv/stacks/youtubemixer.
# Usage: deploy/deploy.sh   (run from anywhere; needs SSH access as root)
set -euo pipefail

HOST="${DEPLOY_HOST:-root@69.62.117.27}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/d2deploy}"
DIR=/srv/stacks/youtubemixer
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH=(ssh -i "$KEY" -o BatchMode=yes "$HOST")

"${SSH[@]}" "mkdir -p $DIR/site"

# Stack files; .env is only created on first deploy.
tar -C "$ROOT/deploy" -cf - docker-compose.yml .env.example | "${SSH[@]}" "tar -C $DIR -xf - && [ -f $DIR/.env ] || cp $DIR/.env.example $DIR/.env"

# Site files. api/.env (the YouTube key) lives only on the server and is never overwritten.
tar -C "$ROOT" -cf - .htaccess index.html script.js styles.css bg.png favicon.ico \
  api/.htaccess api/config.php api/common.php api/youtube-search.php api/invidious-search.php api/related.php \
  | "${SSH[@]}" "tar -C $DIR/site -xf -"

"${SSH[@]}" "cd $DIR && docker compose up -d && docker compose ps"
