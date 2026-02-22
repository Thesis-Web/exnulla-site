#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
: "${TWITCH_CLIENT_ID:?Missing TWITCH_CLIENT_ID}"
: "${TWITCH_CLIENT_SECRET:?Missing TWITCH_CLIENT_SECRET}"
: "${TWITCH_USER_LOGIN:?Missing TWITCH_USER_LOGIN}"

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"

echo "=== exnulla Twitch status runner (full Helix data) ==="

# 1. OAuth token
TOKEN=$(curl -sS -X POST "https://id.twitch.tv/oauth2/token" \
  -d "client_id=${TWITCH_CLIENT_ID}" \
  -d "client_secret=${TWITCH_CLIENT_SECRET}" \
  -d "grant_type=client_credentials" | jq -r '.access_token')

# 2. Stream data
DATA=$(curl -sS -H "Client-ID: ${TWITCH_CLIENT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  "https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER_LOGIN}")

if echo "$DATA" | jq -e '.data | length > 0' >/dev/null; then
  LIVE=true
  STREAM=$(echo "$DATA" | jq '.data[0]')
  TITLE=$(echo "$STREAM" | jq -r '.title // ""')
  GAME_NAME=$(echo "$STREAM" | jq -r '.game_name // "Unknown"')
  VIEWERS=$(echo "$STREAM" | jq -r '.viewer_count // 0')
  STARTED_AT=$(echo "$STREAM" | jq -r '.started_at // ""')
  TYPE="live"
else
  LIVE=false
  TITLE=""
  GAME_NAME=""
  VIEWERS=0
  STARTED_AT=""
  TYPE="offline"
fi

# 3. Build JSON (exact shape you already have working)
cat > /tmp/status.json <<JSON
{
  "source": "twitch",
  "user_login": "${TWITCH_USER_LOGIN}",
  "url": "https://www.twitch.tv/${TWITCH_USER_LOGIN}",
  "checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "live": ${LIVE},
  "isLive": ${LIVE},
  "type": "${TYPE}",
  "title": "${TITLE}",
  "game_name": "${GAME_NAME}",
  "viewer_count": ${VIEWERS},
  "started_at": "${STARTED_AT}"
}
JSON

# 4. Ship to shared/ (survives deploys)
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}/shared/stream'"
rsync -az --delete /tmp/status.json "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/stream/status.json"

echo "Status shipped - Live: ${LIVE} at $(date -u)"
