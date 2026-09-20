#!/bin/sh
# Build and publish the site and the blog service.   Usage: npm run deploy
# Server details come from .deploy.env (not in git) — copy .deploy.env.example to start.
set -e
cd "$(dirname "$0")/.."

if [ ! -f .deploy.env ]; then
  echo "Missing .deploy.env — copy .deploy.env.example and fill it in." >&2
  exit 1
fi
. ./.deploy.env

echo "→ building"
npm run build

echo "→ uploading site"
# -rlptz: contents, times and permissions, compressed. --delete removes files that no longer exist.
# .well-known is left alone: Let's Encrypt writes its renewal challenges there.
rsync -rlptz --delete --exclude '.well-known' --rsync-path='sudo rsync' -e "ssh -p $PORT" dist/ "$HOST:$DEST"

echo "→ uploading blog service"
rsync -rlptz --delete --rsync-path='sudo rsync' -e "ssh -p $PORT" blog/ "$HOST:$BLOG_DEST"

echo "→ fixing ownership, restarting blog"
ssh -p "$PORT" "$HOST" "sudo chown -R $OWNER:$OWNER $DEST $BLOG_DEST \
  && sudo find $DEST -type d -exec chmod 755 {} + \
  && sudo find $DEST -type f -exec chmod 644 {} + \
  && sudo systemctl restart $BLOG_SERVICE"

echo "→ telling search engines"
curl -sS -X POST https://api.indexnow.org/indexnow -H 'content-type: application/json' \
  -d "{\"host\":\"carathepirate.com\",\"key\":\"ee1130088d8db31c6080d51ca9ede73c\",\"keyLocation\":\"$SITE_URL/ee1130088d8db31c6080d51ca9ede73c.txt\",\"urlList\":[\"$SITE_URL/\",\"$SITE_URL/ro/\",\"$SITE_URL/blog\"]}" \
  -o /dev/null -w "  IndexNow: %{http_code}\n" || true

echo "→ live check"
curl -sS -o /dev/null -w "  $SITE_URL  %{http_code}  (%{time_total}s)\n" "$SITE_URL/"
curl -sS -o /dev/null -w "  $SITE_URL/blog  %{http_code}\n" "$SITE_URL/blog"
[ -n "$SHORT_URL" ] && curl -sS -o /dev/null -w "  $SHORT_URL  %{http_code} (redirects to the canonical domain)\n" "$SHORT_URL/"
echo "done"
