#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <target-repo-path>"
  exit 1
fi

TARGET_DIR="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Target directory does not exist: $TARGET_DIR"
  exit 1
fi

echo "Copying blueprint from: $SOURCE_DIR"
echo "To target repo: $TARGET_DIR"

rsync -av --delete \
  --exclude='.git' \
  --exclude='.DS_Store' \
  "$SOURCE_DIR/" \
  "$TARGET_DIR/"

echo "Done. Next steps:"
echo "1) Review changes in target repo"
echo "2) Configure branch protection using .github/branch-protection-checklist.md"
echo "3) Commit and push"
