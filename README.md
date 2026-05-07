# ODOS Mobile App

ODOS Mobile App is the Expo React Native shopper client for ODOS. It connects to the FastAPI backend and lets customers browse categories, stores, and products, manage cart and wishlist state, place orders, and track account activity.

Backend repo:

`/Users/paul/Desktop/DeV/odos-workspace/ODOS_MOBILE_BACKEND`

Admin repo:

`/Users/paul/Desktop/DeV/odos-workspace/ODOS_ADMIN`

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- NativeWind
- Expo Secure Store
- Expo Notifications

## Current App Capabilities

- Email/password signup, login, verification, password reset
- Session restore with SecureStore
- Profile editing and account preferences
- Cart and wishlist persistence
- Backend-driven markets, stores, categories, and products
- Dynamic category browsing from admin-managed categories and subcategories
- Order placement, tracking, cancellation, delivery confirmation, reorder, and receipt views
- In-app activity feed and notification settings

## Important Development Notes

- Expo Go is supported for everyday development.
- Remote push notifications are intentionally disabled in Android Expo Go on Expo SDK 54.
- The app still renders normally in Expo Go; use a development build or production build for real push notification delivery.
- Category cards and category-detail browsing now come from backend/admin taxonomy instead of hardcoded shopper buckets.

## Prerequisites

- Node.js 18+
- npm
- Expo Go or a simulator/emulator
- ODOS backend running locally

## Environment

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=http://YOUR-MAC-LAN-IP:8000/api
```

Example:

```env
EXPO_PUBLIC_API_URL=http://172.20.10.2:8000/api
```

For real device testing, the phone and your Mac must be on the same Wi-Fi unless you run Expo in tunnel mode.

## Install

```bash
npm install
```

## Run

```bash
npx expo start -c
```

Useful alternatives:

```bash
npx expo start --tunnel -c
npm run web
```

`npm run ios` and `npm run android` use native run commands, not Expo Go.

## Typical Local Workflow

Start backend:

```bash
cd /Users/paul/Desktop/DeV/odos-workspace/ODOS_MOBILE_BACKEND
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start mobile app:

```bash
cd /Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo
npx expo start -c
```

## Key Backend Dependencies

The mobile client expects these backend route groups:

- `/api/auth/*`
- `/api/account/*`
- `/api/cart*`
- `/api/wishlist*`
- `/api/catalog/*`
- `/api/orders*`
- `/api/notifications*`
- `/api/health`

## Project Structure

```text
app/
  (root)/
    (auth)/
    (tabs)/
    screens/

components/
constants/
context/
hooks/
utils/
```

## Notable Files

- [context/AuthContext.tsx](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/context/AuthContext.tsx:1)
- [context/PushNotificationsProvider.tsx](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/context/PushNotificationsProvider.tsx:1)
- [hooks/useCatalog.ts](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/hooks/useCatalog.ts:1)
- [hooks/useCommerce.ts](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/hooks/useCommerce.ts:1)
- [app/(root)/(tabs)/category.tsx](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/app/(root)/(tabs)/category.tsx:1)
- [app/(root)/screens/categories/[slug].tsx](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/app/(root)/screens/categories/[slug].tsx:1)

## Verification

Typecheck:

```bash
./node_modules/.bin/tsc --noEmit --pretty false
```

## Troubleshooting

### Expo Go cannot reach backend

Check:

- backend is running with `--host 0.0.0.0`
- phone and Mac are on the same Wi-Fi
- `EXPO_PUBLIC_API_URL` points to your current LAN IP

### Red screen says it cannot connect to development server

Check:

- Metro is running
- device is not on LTE only
- Expo was started from this project
- use `npx expo start --tunnel -c` if same-network testing is not possible

### Categories or products do not look updated

The app now auto-refreshes catalog and store data in the background, but it still depends on backend state and successful API responses. Confirm the backend migration has been applied and the new product/category data exists there.
