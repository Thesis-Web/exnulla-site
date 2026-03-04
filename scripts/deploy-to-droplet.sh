#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"
RELEASE_ID="${RELEASE_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"
REMOTE_RELEASE_DIR="${DEPLOY_PATH}/releases/${RELEASE_ID}"

# When run in CI from repo root, Astro output is site/dist
LOCAL_DIST="${LOCAL_DIST:-site/dist}"

echo "Deploying ${LOCAL_DIST} -> ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}"

ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}/releases' '${DEPLOY_PATH}/shared' '${REMOTE_RELEASE_DIR}'"

rsync -az --delete "${LOCAL_DIST}/" "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}/"

ssh "${DEPLOY_USER}@${DEPLOY_HOST}" \
  DEPLOY_PATH="${DEPLOY_PATH}" \
  REMOTE_RELEASE_DIR="${REMOTE_RELEASE_DIR}" \
  'bash -seu' <<'EOF'
set -euo pipefail

if [ -d "${DEPLOY_PATH}/current" ] && [ ! -L "${DEPLOY_PATH}/current" ]; then
  mv "${DEPLOY_PATH}/current" "${DEPLOY_PATH}/current.dir.bak.$(date -u +%Y%m%dT%H%M%SZ)"
fi

# REQUIRED invariants before flip
test -f "$REMOTE_RELEASE_DIR/meta/version.json"
test -f "$REMOTE_RELEASE_DIR/demos/intent-file-router/index.html"

ln -sfnT "${REMOTE_RELEASE_DIR}" "${DEPLOY_PATH}/current"

sudo nginx -t
sudo systemctl reload nginx

echo "Current -> $(readlink -f "${DEPLOY_PATH}/current")"
EOF
