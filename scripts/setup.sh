#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

LINKS=(
  "$CONFIG_ROOT/opencode.json:$REPO_ROOT/opencode.json"
  "$CONFIG_ROOT/.opencode:$REPO_ROOT/.opencode"
)

if [ "${1:-}" = "--remove" ]; then
  for entry in "${LINKS[@]}"; do
    link="${entry#*:}"
    if [ -L "$link" ] || [ -f "$link" ] || [ -d "$link" ]; then
      rm -f "$link"
      echo "[OK] Removed: $link"
    else
      echo "[--] Not found: $link"
    fi
  done
  exit 0
fi

for entry in "${LINKS[@]}"; do
  target="${entry%:*}"
  link="${entry#*:}"
  if [ -e "$link" ]; then
    echo "[--] Already exists: $link"
  else
    ln -s "$target" "$link"
    echo "[OK] Created: $link -> $target"
  fi
done
