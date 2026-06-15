#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

LINKS=(
  "$CONFIG_ROOT/opencode.json:$REPO_ROOT/opencode.json"
  "$CONFIG_ROOT/.opencode:$REPO_ROOT/.opencode"
  "$CONFIG_ROOT/openspec:$REPO_ROOT/openspec"
  "$CONFIG_ROOT/docs/agents:$REPO_ROOT/docs/agents"
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

# ---- Create agent config in parent repo ----
MARKER_FILE="$REPO_ROOT/PARENT_REPO_URL"
if [ -f "$MARKER_FILE" ]; then
  echo "[--] PARENT_REPO_URL marker already exists: $MARKER_FILE"
else
  REMOTE=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true)
  if [ -n "$REMOTE" ]; then
    echo "$REMOTE" | sed -E 's|.*github\.com[:/](.+)\.git|\1|' > "$MARKER_FILE"
    echo "[OK] Created PARENT_REPO_URL marker: $MARKER_FILE"
  else
    echo "[!!] Could not determine git remote URL for parent repo"
  fi
fi

SCRATCH_DIR="$REPO_ROOT/.scratch"
if [ -d "$SCRATCH_DIR" ]; then
  echo "[--] .scratch directory already exists: $SCRATCH_DIR"
else
  mkdir -p "$SCRATCH_DIR"
  echo "[OK] Created .scratch directory: $SCRATCH_DIR"
fi
