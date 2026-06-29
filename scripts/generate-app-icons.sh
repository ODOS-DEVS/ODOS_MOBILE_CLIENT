#!/usr/bin/env bash
# Builds opaque 1024×1024 app icons from assets/images/splash.png (ODOS logo mark).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$ROOT/scripts/fix-app-icons.py"
