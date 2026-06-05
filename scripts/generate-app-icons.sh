#!/usr/bin/env bash
# Builds 1024×1024 app icons from assets/images/splash.png (ODOS logo mark).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/assets/images"
SPLASH="$ASSETS/splash.png"
WORK="$(mktemp -d)"

cleanup() {
  rm -rf "$WORK"
}
trap cleanup EXIT

if [[ ! -f "$SPLASH" ]]; then
  echo "Missing $SPLASH" >&2
  exit 1
fi

# Crop the circular bag logo from the top-center of the splash artwork.
sips --cropToHeightWidth 130 130 --cropOffset 0 55 "$SPLASH" --out "$WORK/logo-crop.png" >/dev/null
sips -z 1024 1024 "$WORK/logo-crop.png" --out "$ASSETS/icon.png" >/dev/null

# Android adaptive icon foreground (logo inset for system mask safe zone).
sips -z 820 820 "$WORK/logo-crop.png" --out "$WORK/adaptive-fg.png" >/dev/null
sips -p 1024 1024 "$WORK/adaptive-fg.png" --padColor 000000 --out "$ASSETS/adaptive-icon.png" >/dev/null

echo "Wrote $ASSETS/icon.png and $ASSETS/adaptive-icon.png"
