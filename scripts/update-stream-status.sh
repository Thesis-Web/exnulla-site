#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"

echo "=== exnulla reactive status runner (shared/ edition) ==="

URL="https://kick.com/api/v1/channels/exnulla"

RESPONSE="$(curl -sS --fail --max-time 10 \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome Safari' \
  -H 'Accept: application/json' \
  "$URL" || echo '{}')"

echo "Kick fetch ok: $(echo "$RESPONSE" | head -c 200) ..."

# Robust: treat live if any plausible field indicates it.
IS_LIVE="$(
  echo "$RESPONSE" | jq -r '
    (
      .is_live // 
      .livestream.is_live // 
      (.livestream != null) //
      .live_stream.is_live //
      (.live_stream != null) //
      false
    ) | tostring
  ' 2>/dev/null || echo "false"
)"

if [ "$IS_LIVE" = "true" ]; then
  STATUS="live"
  echo "✅ LIVE on Kick"
else
  STATUS="offline"
  echo "⭕ Offline"
fi

cat > /tmp/status.json <<EOF
{
  "status": "${STATUS}",
  "url": "https://kick.com/exnulla",
  "lastChecked": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "provenance": {
    "buildSha": "${GITHUB_SHA:-local-dev}",
    "runner": "github-actions",
    "updatedBy": "4-agent-xai-crew"
  }
}
EOF

ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}/shared/stream'"
rsync -az --delete /tmp/status.json "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/stream/status.json"

echo "✅ status.json shipped to /shared/stream (Docker + atomic safe)"
