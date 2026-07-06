#!/usr/bin/env bash
# Builds iOS/Android app icons from the logo mark in assets/images/splash.png.
# Run before EAS/TestFlight builds: npm run generate-icons
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$ROOT/scripts/fix-app-icons.py"
