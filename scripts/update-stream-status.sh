#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
: "${TWITCH_CLIENT_ID:?Missing TWITCH_CLIENT_ID}"
: "${TWITCH_CLIENT_SECRET:?Missing TWITCH_CLIENT_SECRET}"
: "${TWITCH_USER_LOGIN:?Missing TWITCH_USER_LOGIN}"

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"

echo "=== exnulla reactive status runner (Twitch + shared/) ==="

# 1. Get OAuth token (client credentials)
TOKEN_RESPONSE=$(curl -sS -X POST "https://id.twitch.tv/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: Failed to get Twitch token"
  exit 1
fi

# 2. Check if live
STREAM_RESPONSE=$(curl -sS --fail --max-time 15 \
  -H "Client-ID: ${TWITCH_CLIENT_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  "https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER_LOGIN}")

IS_LIVE=$(echo "$STREAM_RESPONSE" | jq -r '(.data | length) > 0')

if [ "$IS_LIVE" = "true" ]; then
  STATUS="live"
  TYPE=$(echo "$STREAM_RESPONSE" | jq -r '.data[0].type // "live"')
  echo "LIVE on Twitch (${TYPE})"
else
  STATUS="offline"
  echo "Offline"
fi

# 3. Build atomic JSON
cat > /tmp/status.json <<EOF
{
  "status": "${STATUS}",
  "url": "https://twitch.tv/${TWITCH_USER_LOGIN}",
  "lastChecked": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "provenance": {
    "buildSha": "${GITHUB_SHA:-local-dev}",
    "runner": "github-actions",
    "updatedBy": "grok-xai-team"
  }
}
