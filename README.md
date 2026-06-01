# ODOS Mobile App

Expo React Native shopper app for ODOS. Connects to the FastAPI backend for catalog, cart, checkout, orders, activity, chat, and vendor flows.

| Repo | Path |
|------|------|
| Backend | `../ODOS_MOBILE_BACKEND` |
| Admin | `../ODOS_ADMIN` |

## Stack

- Expo SDK 54 · React Native 0.81 · React 19 · TypeScript
- Expo Router · NativeWind · Expo Secure Store · Expo Notifications
- `react-native-maps` for store location and vendor onboarding maps

## Features

- Auth: signup, login, email verification, password reset, session restore
- Shop: home, categories, search, product detail, cart, wishlist, checkout (Paystack)
- Orders: tracking, cancel, confirm delivery, returns, receipts
- Account: profile, addresses, wallet, vouchers, preferences (including **dark mode**)
- Activity feed and in-app notifications (with product images when provided by API)
- Store detail, **full-screen store map** with bottom sheet, vendor apply/dashboard
- Product share sheet · themed UI across tabs and commerce screens

## Development notes

- **Expo Go** works for everyday development.
- **Push notifications** do not deliver on Android Expo Go (SDK 54); use a dev or production build for real push.
- **Maps** need a Google Maps API key in env; without it, map screens show a fallback layout.
- Category and product data come from the admin-managed backend taxonomy.

## Prerequisites

- Node.js 18+
- npm
- Expo Go or simulator/device
- ODOS backend running (local or Render)

## Environment

Copy the example file and set your API URL:

```bash
cp .env.example .env
```

Minimum:

```env
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000/api
```

Staging (example):

```env
EXPO_PUBLIC_API_URL=https://odos-backend.onrender.com/api
```

Optional:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
EXPO_PUBLIC_SHARE_WEB_BASE_URL=https://your-site.com
EXPO_PUBLIC_APP_DOWNLOAD_URL=https://odos.app
```

For a physical device on the same Wi‑Fi, use your Mac’s LAN IP and start the backend with `--host 0.0.0.0`.

## Install and run

```bash
npm install
npx expo start -c
```

Other commands:

```bash
npx expo start --tunnel -c   # different network / remote device
npm run web
npm run ios                  # native build, not Expo Go
npm run android
```

## Local workflow (all three apps)

**Backend**

```bash
cd ../ODOS_MOBILE_BACKEND
source .venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Mobile**

```bash
cd ../odos-mobile-expo
npx expo start -c
```

**Admin**

```bash
cd ../ODOS_ADMIN
npm run dev
```

## API surface used by the app

- `/api/auth/*` · `/api/account/*` · `/api/cart*` · `/api/wishlist*`
- `/api/catalog/*` · `/api/orders*` · `/api/notifications*`
- `/api/chat/*` · `/api/vouchers*` · `/api/health`

## Project layout

```text
app/                 # Expo Router screens
components/          # UI, cards, loaders, theme
context/             # Auth, cart, theme, profile, …
hooks/               # API hooks
styles/              # Responsive + themed style factories
constants/           # Theme tokens, share config
utils/
```

## TestFlight / iOS beta (summary)

1. Enroll in [Apple Developer Program](https://developer.apple.com) ($99/year).
2. Install EAS: `npm install -g eas-cli` → `eas login` → `eas init` → `eas build:configure`.
3. Create the app in [App Store Connect](https://appstoreconnect.apple.com) with bundle ID `com.paul.odos`.
4. Build and submit:

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

5. In App Store Connect → **TestFlight**, add internal or external testers; they install via the **TestFlight** app.

Set production API and map keys as [EAS secrets](https://docs.expo.dev/build-reference/variables/) before release builds.

## Verification

```bash
npx tsc --noEmit
npm run lint
```

## Troubleshooting

| Issue | Check |
|--------|--------|
| Cannot reach API | Backend on `0.0.0.0:8000`, same Wi‑Fi, correct `EXPO_PUBLIC_API_URL` |
| Metro / dev server | `npx expo start -c` or `--tunnel` |
| Stale catalog | Backend migrations applied; pull to refresh |
| Map blank | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` set; use dev build on device |
| Route export errors | Clear cache: `npx expo start -c` |
