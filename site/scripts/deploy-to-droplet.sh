#!/usr/bin/env bash
set -euo pipefail

# Required env:
# DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH=/var/www/exnulla-site
# Optional: SERVICE_RELOAD_CMD="sudo systemctl reload nginx"

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/exnulla-site}"
RELEASE_ID="${RELEASE_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"
REMOTE_RELEASE_DIR="${DEPLOY_PATH}/releases/${RELEASE_ID}"

# local build output should be site/dist
LOCAL_DIST="${LOCAL_DIST:-site/dist}"

echo "Deploying release ${RELEASE_ID} to ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}"

# ensure remote dirs
ssh -o StrictHostKeyChecking=yes "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "mkdir -p '${REMOTE_RELEASE_DIR}' '${DEPLOY_PATH}/shared'"

# upload dist into release dir
rsync -az --delete "${LOCAL_DIST}/" "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RELEASE_DIR}/"

# flip symlink atomically + sanity check nginx + reload
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" bash -lc "set -euo pipefail
  ln -sfn '${REMOTE_RELEASE_DIR}' '${DEPLOY_PATH}/current'
  sudo nginx -t
  sudo systemctl reload nginx
  echo 'Current ->' \$(readlink -f '${DEPLOY_PATH}/current')
"

echo "Done."
