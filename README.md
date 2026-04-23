# ODOS Mobile Client

ODOS Mobile Client is an Expo React Native marketplace app for browsing products, stores, local markets, and account flows from a mobile device. The current project includes a connected authentication flow for email/password login and signup, plus in-app state for cart, wishlist, profile, checkout, and vendor chat experiences.

This repository is the frontend/mobile client. The FastAPI backend lives in a separate project folder and exposes the auth endpoints this app currently uses.

## Current Status

The app is working as an Expo Go-friendly mobile client with:

- onboarding, sign in, sign up, and logout
- session restore using a stored bearer token
- cart, wishlist, profile, address, wallet, and checkout state
- local marketplace/catalog mock data
- profile navigation, help screens, vouchers, reviews, and vendor request flows

Important current realities:

- email/password auth is connected to the backend
- Google auth is not active in Expo Go right now
- most catalog and shopping content still comes from local mock data
- cart, wishlist, chat, and profile utility state is mostly local to the app
- order placement is still not connected to a full backend checkout flow

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- NativeWind
- React Context
- Expo Secure Store

## Prerequisites

- Node.js 18+
- npm
- Expo Go on your phone, or simulator/emulator if preferred
- The ODOS backend running locally if you want auth to work

## Frontend Setup

Install dependencies:

```bash
npm install
```

Create or update your frontend env file:

```env
EXPO_PUBLIC_API_URL=http://YOUR-MAC-LAN-IP:8000/api
```

Example:

```env
EXPO_PUBLIC_API_URL=http://10.11.24.79:8000/api
```

If you are using Expo Go on a real phone, your phone and Mac need to be on the same Wi‑Fi network.

## Run The App

Start the Expo server:

```bash
npx expo start -c
```

Then scan the QR code using Expo Go.

If Expo opens in a mode other than Expo Go, switch from the terminal UI.

## Available Scripts

```bash
npm start
npm run ios
npm run android
npm run web
npm run lint
```

Notes:

- `npm start` runs `expo start`
- `npm run ios` and `npm run android` are for native runs, not required for normal Expo Go usage
- `npm run web` exists, but this project is primarily being developed as a mobile app

## Required Backend

This frontend expects the backend to expose:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

If the backend is not running or the API URL is wrong, login/signup will fail and the app will show connection-related auth errors.

## Typical Local Workflow

Start the backend:

```bash
cd /Users/paul/Desktop/DeV/odos-workspace/ODOS_MOBILE_BACKEND
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend:

```bash
cd /Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo
npx expo start -c
```

Before opening the app, you can confirm the backend is reachable from your phone by opening:

```text
http://YOUR-MAC-LAN-IP:8000/api/health
```

## Auth Flow

Current production-like auth flow in the app:

1. user signs up with name, email, and password
2. frontend calls backend signup
3. frontend logs the user in immediately after successful signup
4. backend returns a bearer token
5. frontend stores the token in Expo Secure Store
6. app restores the user session on launch using `/api/auth/me`
7. logout clears the local token and resets the user session

## Google Auth Note

Google auth exists conceptually in the backend, but it is not enabled in the current Expo Go mobile flow.

The Google buttons are still shown in the UI for continuity, but they currently display a message instead of completing authentication.

This is intentional for now because the app has been stabilized around Expo Go and normal auth.

## Project Structure

```text
app/
  _layout.tsx
  (root)/
    splash.tsx
    (auth)/
    (tabs)/
    screens/

components/
  buttons/
  cards/
  home/
  profile/

constants/
  auth.ts
  Colors.ts
  Data.ts
  Fonts.ts

context/
  AuthContext.tsx
  CartContext.tsx
  ChatContext.tsx
  ProfileContext.tsx
  ToastContext.tsx
  WishlistContext.tsx

styles/
  responsive.ts

assets/
  fonts/
  images/
```

## What Is Connected vs Mocked

Connected:

- sign in
- sign up
- session restore
- logout

Still local/mock:

- marketplace data
- product data
- stores and categories
- chat threads
- much of checkout/order flow

## Development Notes

- `app.json` includes the app scheme required by Expo Router linking
- auth state is managed in `context/AuthContext.tsx`
- form validation and backend error mapping are handled in the auth screens plus auth context
- sensitive session data is stored with Expo Secure Store

## Troubleshooting

### Expo Go scans but app cannot reach backend

Check:

- backend is running with `--host 0.0.0.0`
- your phone and Mac are on the same Wi‑Fi
- `EXPO_PUBLIC_API_URL` matches your current Mac LAN IP

### Auth keeps failing

Check:

- backend is running
- frontend `.env` has the right API URL
- backend database is up
- your test account exists if you are signing in instead of signing up

### Mac LAN IP changed

Re-check with:

```bash
ipconfig getifaddr en0
```

If that returns nothing:

```bash
ipconfig getifaddr en1
```

Then update `.env` if needed.

## Recommended Next Steps

1. connect catalog/product/store data to the backend
2. connect profile editing to backend user endpoints
3. connect checkout/order creation to backend order endpoints
4. add password reset flow
5. reintroduce Google auth later with a mobile strategy outside plain Expo Go
