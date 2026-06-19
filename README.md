# ODOS Mobile

Expo React Native shopper app for the ODOS marketplace — browse, buy, track orders, and manage your wallet from one place.

| Repository | GitHub |
|------------|--------|
| Backend API | [ODOS_MOBILE_BACKEND](https://github.com/ODOS-DEVS/ODOS_MOBILE_BACKEND) |
| Admin dashboard | [ODOS_ADMIN](https://github.com/ODOS-DEVS/ODOS_ADMIN) |

## Stack

- Expo SDK 54 · React Native · TypeScript · Expo Router · NativeWind
- Zustand · react-native-maps · react-native-reanimated · react-native-gesture-handler

## What’s in the app

**Shopping**

- Home feed with personalized recommendations, top deals, stores, and promo banners
- Category browse, search, product detail with image gallery, variants, and reviews
- Cart, wishlist, checkout (wallet / card / MoMo via Paystack), vouchers, order history

**Deals & discovery**

- Deals hub with promo codes and flash sales (live countdowns)
- Recommendation engine (“For you”, similar products, behavior-aware ranking)
- Per-banner tap destinations (product, category, deals, flash sale, etc.)

**Commerce details**

- Delivery speed selection at checkout (standard, express, same-day where available)
- Store profiles with location map and directions
- Product sharing, dark mode, pull-to-refresh across main feeds

**Vendor**

- Vendor onboarding, store management, products, orders, and store vouchers

## Requirements

- Node.js 18+
- ODOS backend running locally or on Render
- **Expo Go** works for most flows; **native builds** are required for Google Maps and production APK installs

## Local setup

```bash
npm install
```

Copy `.env.example` to `.env` and set at least:

```env
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000/api
```

For staging / device testing against Render:

```env
EXPO_PUBLIC_API_URL=https://odos-backend.onrender.com/api
```

Start Metro:

```bash
npx expo start -c
```

When testing on a physical phone, use your Mac’s LAN IP (not `127.0.0.1`) and run the backend with `--host 0.0.0.0`.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API base URL |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | For Google sign-in | Must match backend `GOOGLE_CLIENT_IDS` |
| `EXPO_PUBLIC_ENABLE_GOOGLE_MAPS` | For maps | Set `true` when Maps API keys are configured |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | For maps | Shared Google Maps key |
| `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` | Optional | Android-specific override |
| `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` | Optional | iOS-specific override |
| `EXPO_PUBLIC_SHARE_WEB_BASE_URL` | Optional | Product share links |
| `EXPO_PUBLIC_APP_DOWNLOAD_URL` | Optional | App download CTA in shares |

Maps are injected into the native build via `app.config.js`. Changing map keys requires a **new native build**, not just a Metro refresh.

## Google Maps setup (Android)

Maps use `react-native-maps` with the Google provider. They do **not** work in Expo Go.

1. Create a Google Cloud project and enable **Maps SDK for Android**.
2. Create an API key and restrict it to package `com.paul.odos` plus your keystore SHA-1.
3. Add to `.env`:

```env
EXPO_PUBLIC_ENABLE_GOOGLE_MAPS=true
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

4. Rebuild with EAS or `npx expo run:android`.

Debug SHA-1 (local builds):

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

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
npx expo start -c              # Metro (clear cache)
npx expo start --tunnel -c       # Tunnel for remote devices
npm run android                  # Local native Android run
npm run ios                      # Local native iOS run
npm run lint
npx tsc --noEmit
```

## Android APK (EAS)

Install EAS CLI and log in once:

```bash
npm install -g eas-cli
eas login
```

**Preview APK** (internal install link, points at Render API):

```bash
eas build --platform android --profile preview
```

**Preview with maps enabled** (requires Maps API key in EAS secrets or env):

```bash
eas build --platform android --profile preview-maps
```

When the build finishes, EAS prints a download URL. Open it on your Android device, allow installs from the browser if prompted, and install the APK.

Production release:

```bash
eas build --platform android --profile production
```

`eas.json` profiles:

| Profile | Output | API | Maps |
|---------|--------|-----|------|
| `preview` | APK | Render staging | Off |
| `preview-maps` | APK | Render staging | On |
| `production` | AAB/APK | EAS env | Per secrets |

## Project structure (high level)

```text
app/                  # Expo Router screens
components/           # UI, cards, delivery, media
context/              # Auth, cart, profile, behavior tracking
hooks/                # Catalog, recommendations, vouchers, orders
services/             # API clients, behavior events
stores/               # Zustand (delivery, vendor)
utils/                # Navigation, delivery, media, promos
```

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Cannot reach API | Same Wi‑Fi, backend on `0.0.0.0:8000`, correct `EXPO_PUBLIC_API_URL` |
| Stale catalog | Pull to refresh; confirm backend is up and migrations applied |
| Map is blank | `EXPO_PUBLIC_ENABLE_GOOGLE_MAPS=true`, valid API key, native rebuild (not Expo Go) |
| Google Cloud billing error `OR_BACR2_44` | Try Firefox/Edge, disable VPN/ad blockers, or contact Google billing support |
| Metro cache issues | `npx expo start -c` |
| Recommendations empty | Sign in and browse products; backend needs behavior migrations |

## License

Proprietary — ODOS-DEVS.
