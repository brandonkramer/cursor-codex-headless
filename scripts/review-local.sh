#!/usr/bin/env bash
# Local diff review via codex-headless (outside Cursor / CI).
#
# Usage:
#   review-local.sh --uncommitted [-o out.md]
#   review-local.sh --base origin/main [-o out.md]
#   review-local.sh --commit <sha> [-o out.md]
#   review-local.sh -f prompt.md [-o out.md]
#   review-local.sh --structured -f prompt.md -o verdict.json
#
# Passes through to: bin/codex-headless review …

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/codex-headless"

if [[ ! -x "$CLI" ]]; then
  echo "error: run chmod +x $CLI" >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "error: codex CLI required (bash scripts/install.sh)" >&2
  exit 1
fi

exec "$CLI" review "$@"
