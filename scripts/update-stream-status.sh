#!/usr/bin/env bash
set -euo pipefail

# Twitch authoritative stream status (app token, client_credentials)
# Writes: /var/www/exnulla-site/shared/stream/status.json

: "${TWITCH_CLIENT_ID:?missing TWITCH_CLIENT_ID}"
: "${TWITCH_CLIENT_SECRET:?missing TWITCH_CLIENT_SECRET}"

USER_LOGIN="${TWITCH_USER_LOGIN:-exnulla}"
OUT_PATH="${STREAM_STATUS_PATH:-/var/www/exnulla-site/shared/stream/status.json}"
TMP_PATH="${OUT_PATH}.tmp.$$"
TWITCH_TOKEN_URL="https://id.twitch.tv/oauth2/token"
TWITCH_STREAMS_URL="https://api.twitch.tv/helix/streams?user_login=${USER_LOGIN}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: missing dependency: $1" >&2; exit 1; }; }
need curl
need jq
need date

utc_now() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

get_app_token() {
  curl -fsS -X POST "${TWITCH_TOKEN_URL}" \
    -d "client_id=${TWITCH_CLIENT_ID}" \
    -d "client_secret=${TWITCH_CLIENT_SECRET}" \
    -d "grant_type=client_credentials" \
  | jq -r '.access_token'
}

main() {
  local checked_at token resp live type title game_name viewer_count started_at

  checked_at="$(utc_now)"
  token="$(get_app_token)"

  resp="$(
    curl -fsS \
      -H "Client-Id: ${TWITCH_CLIENT_ID}" \
      -H "Authorization: Bearer ${token}" \
      "${TWITCH_STREAMS_URL}"
  )"

  live="$(jq -r '(.data | length) > 0' <<<"${resp}")"

  if [[ "${live}" == "true" ]]; then
    type="$(jq -r '.data[0].type // "live"' <<<"${resp}")"
    title="$(jq -r '.data[0].title // ""' <<<"${resp}")"
    game_name="$(jq -r '.data[0].game_name // ""' <<<"${resp}")"
    viewer_count="$(jq -r '.data[0].viewer_count // 0' <<<"${resp}")"
    started_at="$(jq -r '.data[0].started_at // ""' <<<"${resp}")"
  else
    type="offline"
    title=""
    game_name=""
    viewer_count=0
    started_at=""
  fi

  # Emit a stable status object; include both live + isLive for backward compatibility.
  jq -n \
    --arg source "twitch" \
    --arg user_login "${USER_LOGIN}" \
    --arg url "https://www.twitch.tv/${USER_LOGIN}" \
    --arg checked_at "${checked_at}" \
    --arg type "${type}" \
    --arg title "${title}" \
    --arg game_name "${game_name}" \
    --arg started_at "${started_at}" \
    --argjson live "$( [[ "${live}" == "true" ]] && echo true || echo false )" \
    --argjson viewer_count "${viewer_count}" \
    '{
      source: $source,
      user_login: $user_login,
      url: $url,
      checked_at: $checked_at,

      # Compatibility fields (frontend may already expect one of these)
      live: $live,
      isLive: $live,
      type: $type,

      title: $title,
      game_name: $game_name,
      viewer_count: $viewer_count,
      started_at: $started_at
    }' > "${TMP_PATH}"

  # Atomic replace
  install -d "$(dirname "${OUT_PATH}")"
  chmod 0644 "${TMP_PATH}"
  mv -f "${TMP_PATH}" "${OUT_PATH}"
}

main
