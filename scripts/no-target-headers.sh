#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"

matches="$(
  find "$root" -type f \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -exec sh -c '
      f="$1"
      l="$(head -n 1 "$f" 2>/dev/null | tr -d "\r")"
      case "$l" in
        "// TARGET:"*|"# TARGET:"*|"<!-- TARGET:"*)
          echo "$f"
          ;;
      esac
    ' sh {} \;
)"

if [ -n "$matches" ]; then
  echo "ERROR: Found routing TARGET headers at line 1 in:"
  echo "$matches"
  exit 1
fi

echo "OK: no routing TARGET headers found."
