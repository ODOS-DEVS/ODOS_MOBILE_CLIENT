#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
unset GIT_HTTP_PROXY GIT_HTTPS_PROXY SOCKS_PROXY SOCKS5_PROXY
unset socks_proxy socks5_proxy EXPO_TOKEN

echo "=== Checking Google OAuth env in eas.json ==="
node -e "
const eas = require('./eas.json');
const prod = eas.build.production.env || {};
const preview = eas.build.preview.env || {};
for (const [name, env] of [['production', prod], ['preview', preview]]) {
  const ios = env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
  const web = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
  if (!ios || !web) {
    console.error('Missing Google client IDs in eas.json build.' + name + '.env');
    process.exit(1);
  }
  if (ios === web) {
    console.error('iOS client ID must not equal Web client ID (causes Google Access blocked).');
    process.exit(1);
  }
  console.log(name + ': web + ios client IDs present and distinct');
}
"

echo "=== EAS whoami ==="
npx eas-cli whoami

echo "=== Android preview APK (non-interactive, no-wait) ==="
npx eas-cli build --platform android --profile preview --non-interactive --no-wait

echo "=== iOS production + TestFlight auto-submit (non-interactive, no-wait) ==="
npx eas-cli build --platform ios --profile production --auto-submit --non-interactive --no-wait

echo "=== Done. Monitor builds at https://expo.dev ==="
date
