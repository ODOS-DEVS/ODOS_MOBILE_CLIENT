# ODOS Mobile Client

ODOS Mobile Client is the Expo React Native frontend for ODOS, a marketplace app for browsing products, stores, and local markets from a phone.

This app currently supports real backend-connected auth for:

- sign up
- sign in
- email verification
- forgot password
- reset password
- session restore
- logout
- profile editing

The backend lives in a separate project folder:

`/Users/paul/Desktop/DeV/odos-workspace/ODOS_MOBILE_BACKEND`

## Current Status

The mobile app is currently in a good Expo Go development state.

What is already connected:

- email/password auth
- email verification flow
- password reset flow
- bearer-token session restore with Expo SecureStore
- profile loading and profile updates
- guest browsing with auth-gated protected actions

What is still mostly local or mocked:

- product data
- categories
- stores
- cart persistence
- wishlist persistence
- order placement
- full checkout backend flow

Important current realities:

- the app is designed to work well in Expo Go for normal development
- Google auth is not active in the current Expo Go flow
- most shopping content is still driven by local mock data

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- NativeWind
- React Context
- Expo Secure Store
- Expo Image Picker

## Prerequisites

- Node.js 18+
- npm
- Expo Go on your phone, or simulator/emulator
- the ODOS backend running locally if you want auth to work

## Setup

Install dependencies:

```bash
npm install
```

Create a frontend `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=http://YOUR-MAC-LAN-IP:8000/api
```

Example:

```env
EXPO_PUBLIC_API_URL=http://10.11.24.79:8000/api
```

If you are running on a real phone with Expo Go, your phone and Mac must be on the same Wi‑Fi network.

## Run The App

Start Expo:

```bash
npx expo start -c
```

Then scan the QR code with Expo Go.

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
- `npm run ios` and `npm run android` are optional native runs
- `npm run web` exists, but the project is being developed as a mobile app first

## Required Backend Endpoints

The frontend currently expects these backend routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification-code`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/health`

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

## Auth Flows

### Sign Up And Verification

1. user signs up with full name, email, and password
2. backend creates the account
3. backend sends a 6-digit verification code by email
4. frontend logs the user in and routes them to the verification screen
5. user enters the code
6. backend marks `is_verified = true`
7. backend sends a verification success email

### Sign In

1. user signs in with email and password
2. backend returns a bearer token and the current user
3. frontend stores the token in Expo SecureStore
4. if the user is already verified, they continue into the app
5. if not verified, they are routed to the verification screen

### Forgot Password

1. user enters their email on the forgot password screen
2. backend sends a 6-digit reset code
3. user enters the code on the verification screen
4. backend returns a short-lived reset token
5. user creates a new password
6. backend updates the password
7. backend sends a password-changed confirmation email

### Session Restore

On launch, the app checks SecureStore for a saved bearer token and calls:

- `GET /api/auth/me`

If the token is valid, the user session is restored automatically.

## Profile Behavior

The app supports:

- viewing the real signed-in user
- editing profile fields
- saving profile fields to the backend
- updating avatar

Default avatar behavior:

- if `avatar_url` exists, it is shown
- if not, the app renders a consistent built-in fallback avatar across the main profile surfaces

## Guest Browsing Behavior

Fresh app launches are guest-friendly.

Users can browse the app without signing in, but protected flows prompt them to authenticate before doing important actions such as:

- managing profile data
- checkout
- other account-protected flows

## Google Auth Note

Google auth is intentionally not active in the current Expo Go flow.

The backend still has Google auth support, but the mobile client is currently stabilized around:

- Expo Go
- normal email/password auth
- email verification
- password reset

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
  UserAvatar.tsx

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

hooks/
  useRequireAuth.ts

styles/
  responsive.ts

assets/
  fonts/
  images/
```

## What Is Connected vs Mocked

Connected:

- sign up
- sign in
- email verification
- resend verification code
- forgot password
- verify reset code
- reset password
- session restore
- logout
- profile update

Still local/mock:

- marketplace data
- product data
- stores and categories
- much of cart/wishlist persistence
- much of checkout/order flow

## Development Notes

- `app.json` includes the app scheme needed by Expo Router
- auth state lives in `context/AuthContext.tsx`
- auth recovery and verification UI currently flows through `verification.tsx`
- sensitive session data is stored in Expo SecureStore

## Troubleshooting

### Expo Go scans but app cannot reach backend

Check:

- backend is running with `--host 0.0.0.0`
- your phone and Mac are on the same Wi‑Fi
- `EXPO_PUBLIC_API_URL` matches your current Mac LAN IP

### Emails are not arriving

Check:

- backend Brevo settings are correct
- verified sender email is configured in the backend `.env`
- backend has been restarted after env changes
- email was not blocked or deferred in Brevo transactional logs

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

1. connect product, store, and category data to the backend
2. add real cart and wishlist persistence
3. add order creation and checkout endpoints
4. reintroduce Google auth later with a mobile strategy outside plain Expo Go
5. add automated tests for critical auth flows
