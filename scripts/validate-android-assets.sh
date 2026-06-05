#!/usr/bin/env bash
# Fails if any assets/images/*.png is not a real PNG (Android AAPT rejects JPEG/WebP renamed as .png).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/assets/images"
FAILED=0

for file in "$ASSETS"/*.png; do
  [[ -f "$file" ]] || continue
  if ! file -b "$file" | grep -q '^PNG image'; then
    echo "Invalid PNG asset: $(basename "$file") ($(file -b "$file"))"
    FAILED=1
  fi
done

if [[ "$FAILED" -ne 0 ]]; then
  echo "Fix assets before running eas build --platform android."
  exit 1
fi

echo "Android PNG assets OK."
