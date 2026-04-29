# ODOS Mobile Client

ODOS Mobile Client is the Expo React Native frontend for ODOS, a mobile marketplace app for browsing products, stores, and markets, managing a cart and wishlist, placing orders, and tracking account activity.

The backend lives in a separate project folder:

`/Users/paul/Desktop/DeV/odos-workspace/ODOS_MOBILE_BACKEND`

## Current Status

The app is in a solid Expo Go development state for day-to-day work.

### Connected to the backend

- email/password sign up
- sign in
- email verification
- resend verification code
- forgot password
- verify reset code
- reset password
- session restore with Expo SecureStore
- logout
- profile editing
- notification preferences
- in-app activity feed
- wishlist persistence
- cart persistence
- categories, products, stores, and markets
- order creation
- order tracking, cancellation, delivery confirmation, reorder, and receipt
- saved delivery addresses
- saved payment methods

### Still simplified or mocked

- real payment gateway integration
- production-grade push notification delivery flow
- Google auth in the current Expo Go client flow
- admin/vendor-side order management

Important reality:

- the app is tuned to work well in **Expo Go**
- Google auth is intentionally not active in the current Expo Go flow
- checkout uses saved/mock payment methods, not a live payment processor yet

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
- Expo Notifications

## Prerequisites

- Node.js 18+
- npm
- Expo Go on your phone, or a simulator/emulator
- the ODOS backend running locally

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
EXPO_PUBLIC_API_URL=http://172.20.10.2:8000/api
```

If you are running on a real phone with Expo Go, your phone and Mac must be on the same Wi‑Fi network.

## Run The App

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

## Main User Flows

### Auth

- Sign up with full name, email, and password
- Receive a 6-digit verification code by email
- Verify email before fully completing onboarding
- Sign in with bearer-token session restore
- Recover account through reset-code verification and password reset

### Guest Browsing

Fresh app launches are guest-friendly.

Users can browse the storefront without signing in, but protected actions prompt for authentication before they continue, including:

- profile management
- checkout
- order history
- activity feed

### Shopping

- Browse backend-backed categories, products, stores, and markets
- Save wishlist items to the backend
- Save cart items to the backend
- Use `Buy Now` or cart checkout flows
- Save delivery addresses and payment methods
- Place orders and track them through the app

### Orders

- place order
- view success screen
- track order
- cancel processing order
- confirm delivery
- reorder items
- view receipt

### Notifications

The app currently has two notification-related surfaces:

- **Activity**: live in-app account and order updates
- **Notification Settings**: saved preference toggles

Push-notification plumbing exists, but the current reliable user-facing experience is the in-app Activity feed.

## Required Backend API Areas

The frontend currently depends on these backend route groups:

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
  _layout.tsx
  (root)/
    splash.tsx
    (auth)/
    (tabs)/
    screens/

components/
  buttons/
  cards/
  loaders/
  profile/
  skeletons/
  HomeHeader.tsx
  NotificationItem.tsx
  UserAvatar.tsx

constants/
  auth.ts
  catalogImages.ts
  Colors.ts
  Data.ts
  Fonts.ts

context/
  AuthContext.tsx
  CartContext.tsx
  ChatContext.tsx
  ProfileContext.tsx
  PushNotificationsProvider.tsx
  ToastContext.tsx
  WishlistContext.tsx

hooks/
  useActivityFeed.ts
  useCatalog.ts
  useCommerce.ts
  useOrders.ts
  useRequireAuth.ts
```

## Development Notes

- `app.json` includes the app scheme required by Expo Router
- auth state lives in [context/AuthContext.tsx](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/context/AuthContext.tsx)
- saved addresses and payment methods live in [context/ProfileContext.tsx](/Users/paul/Desktop/DeV/odos-workspace/odos-mobile-expo/context/ProfileContext.tsx)
- sensitive session data is stored in Expo SecureStore
- the activity feed is backed by the backend notifications API

## Troubleshooting

### Expo Go scans but app cannot reach backend

Check:

- backend is running with `--host 0.0.0.0`
- your phone and Mac are on the same Wi‑Fi
- `EXPO_PUBLIC_API_URL` matches your current Mac LAN IP

### Emails are not arriving

Check:

- backend Brevo settings are correct
- verified sender email is configured in backend `.env`
- backend has been restarted after env changes
- email was not blocked or deferred in Brevo transactional logs

### Activity feed is empty

Check:

- the backend is running on the latest code
- you are opening **Activity**, not **Notification Settings**
- `/api/notifications` and `/api/notifications/read-state` both respond successfully

### Saved address or payment method disappears

Check:

- you were signed in when saving it
- the backend is reachable from the app
- the save request succeeded without validation errors

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

1. add proper editing for saved payment methods
2. introduce a real payment gateway
3. add admin/vendor controls for order progression
4. add automated tests for key flows
5. reintroduce Google auth later with a mobile strategy outside plain Expo Go
