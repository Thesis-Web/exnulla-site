#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"

echo "=== exnulla reactive status runner (shared/ edition) ==="

: "${TWITCH_CLIENT_ID:?Missing TWITCH_CLIENT_ID}"
: "${TWITCH_CLIENT_SECRET:?Missing TWITCH_CLIENT_SECRET}"
TWITCH_LOGIN="${TWITCH_BROADCASTER_LOGIN:-exnulla}"

TOKEN="$(
  curl -sS --fail -X POST "https://id.twitch.tv/oauth2/token" \
    -d "client_id=${TWITCH_CLIENT_ID}" \
    -d "client_secret=${TWITCH_CLIENT_SECRET}" \
    -d "grant_type=client_credentials" \
  | jq -r '.access_token'
)"

STREAMS_JSON="$(
  curl -sS --fail \
    -H "Client-Id: ${TWITCH_CLIENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://api.twitch.tv/helix/streams?user_login=${TWITCH_LOGIN}"
)"

echo "Twitch streams payload head: $(echo "$STREAMS_JSON" | head -c 200) ..."

if echo "$STREAMS_JSON" | jq -e '.data | length > 0' >/dev/null; then
  STATUS="live"
  echo "✅ LIVE on Twitch"
else
  STATUS="offline"
  echo "⭕ Offline (Twitch)"
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
