#!/bin/bash
set -euo pipefail
cd /Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo

unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
unset GIT_HTTP_PROXY GIT_HTTPS_PROXY SOCKS_PROXY SOCKS5_PROXY
unset socks_proxy socks5_proxy EXPO_TOKEN

echo "=== EAS whoami ==="
npx eas-cli whoami

echo "=== Android preview APK (non-interactive, no-wait) ==="
npx eas-cli build --platform android --profile preview --non-interactive --no-wait

echo "=== iOS production + TestFlight auto-submit (non-interactive, no-wait) ==="
npx eas-cli build --platform ios --profile production --auto-submit --non-interactive --no-wait

echo "=== Done. Monitor builds at https://expo.dev ==="
date
