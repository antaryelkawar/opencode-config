#!/usr/bin/env bash
# Cross-platform setup for opencode-config (POSIX entry point).
# Thin wrapper around scripts/setup.mjs. Creates config links in the parent
# repo and provisions the rtk binary. Requires Node.js.
#
# Usage:
#   ./setup.sh              # create links + download rtk
#   ./setup.sh --remove     # remove created links
#   ./setup.sh --env-var-only
#   ./setup.sh --skip-rtk
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETUP_MJS="$SCRIPT_DIR/setup.mjs"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run setup. Install it from https://nodejs.org" >&2
  exit 1
fi

exec node "$SETUP_MJS" "$@"
