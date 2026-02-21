#!/usr/bin/env bash
set -euo pipefail

SHA="$(git rev-parse HEAD)"
NAME="${NAME:-exnulla-site-test}"
IMAGE="${IMAGE:-exnulla-site:runtime}"

docker rm -f "$NAME" >/dev/null 2>&1 || true

docker build \
  --build-arg GIT_SHA="$SHA" \
  -t "$IMAGE" .

CID="$(docker run -d --name "$NAME" -p 127.0.0.1::80 "$IMAGE")"
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT

# discover which host port was assigned
PORT="$(docker port "$NAME" 80/tcp | awk -F: '{print $2}' | tail -n1)"

# wait briefly for nginx
for _ in {1..20}; do
  if curl -fsS "http://127.0.0.1:${PORT}/meta/version.json" >/dev/null; then
    break
  fi
  sleep 0.2
done

curl -sSf "http://127.0.0.1:${PORT}/meta/version.json" | grep -q "$SHA"

echo "OK: SHA verified ($SHA) on :$PORT (container=$CID)"
