#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"

echo "=== exnulla reactive status runner (shared/ edition) ==="

RESPONSE=$(curl -s -f --max-time 10 "https://kick.com/api/v1/channels/exnulla" || echo '{"livestream":null}')

if echo "$RESPONSE" | grep -q '"is_live":true'; then
  STATUS='live'
  echo "✅ LIVE on Kick"
else
  STATUS='offline'
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
