# ODOS Mobile

Expo React Native shopper app for the ODOS marketplace.

| Repository | GitHub |
|------------|--------|
| Backend API | [ODOS_MOBILE_BACKEND](https://github.com/ODOS-DEVS/ODOS_MOBILE_BACKEND) |
| Admin dashboard | [ODOS_ADMIN](https://github.com/ODOS-DEVS/ODOS_ADMIN) |

## Stack

- Expo SDK 54 · React Native · TypeScript · Expo Router · NativeWind

## Features

- Auth, catalog, cart, checkout (Paystack), orders, wallet, vouchers
- Deals hub, flash sales with live countdowns, CMS promo banners
- Store discovery, maps, vendor onboarding, activity feed, dark mode

## Requirements

- Node.js 18+
- Expo Go or dev/production build
- ODOS backend (local or Render)

## Local setup

```bash
npm install
```

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000/api
```

Staging example:

```env
EXPO_PUBLIC_API_URL=https://odos-backend.onrender.com/api
```

Optional:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_SHARE_WEB_BASE_URL=
EXPO_PUBLIC_APP_DOWNLOAD_URL=
```

Run:

```bash
npx expo start -c
```

For a device on the same Wi‑Fi, use your machine's LAN IP and start the backend with `--host 0.0.0.0`.

## Full local stack

**Backend**

```bash
cd ../ODOS_MOBILE_BACKEND
source .venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Mobile**

```bash
npx expo start -c
```

**Admin**

```bash
cd ../ODOS_ADMIN
npm run dev
```

## Scripts

```bash
npx expo start -c
npx expo start --tunnel -c
npm run ios
npm run android
npm run lint
npx tsc --noEmit
```

## Production builds (EAS)

Configure `eas.json`, set secrets in EAS, then:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Cannot reach API | Same Wi‑Fi, backend on `0.0.0.0:8000`, correct `EXPO_PUBLIC_API_URL` |
| Stale catalog | Pull to refresh; confirm backend migrations and cache TTL |
| Map blank | Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`; use a dev build on device |
| Metro errors | `npx expo start -c` |

## License

Proprietary — ODOS-DEVS.
