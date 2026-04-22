# ODOS Mobile Client

ODOS Mobile Client is an Expo React Native marketplace app for browsing products, stores, and local markets from a mobile device. The current app is a client-side prototype with shopping, checkout, profile, wishlist, and vendor chat flows built around local mock data.

The experience is shaped like a local commerce app: users can explore flash sales, recommendations, product categories, stores, markets, carts, payment methods, delivery addresses, orders, vouchers, and support screens.

## What The App Does

- Browse a marketplace home feed with flash sales, recommendations, stores, popular products, and markets.
- Search products from the home screen.
- Explore product categories such as Gents, Ladies, Kids, Sports, Electronics, Beauty, Groceries, Automobile, and Others.
- View product details with image carousel, pricing, ratings, variants, shipping options, return policy, reviews, related products, and store navigation.
- Add products to the cart or wishlist.
- Buy now from a product detail page and continue into checkout.
- Manage checkout details through saved delivery addresses and payment methods.
- Chat with vendors from product pages.
- View profile sections for orders, returns, addresses, chats, payment methods, reviews, vouchers, vendor requests, personalization, help, legal resources, and FAQ.
- Run onboarding and authentication screens for sign in, sign up, verification, password reset, and password creation.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router for file-based routing
- NativeWind and Tailwind CSS configuration for utility styling
- React Context for local app state
- Expo Font with Montserrat font assets
- Expo Image, Linear Gradient, Haptics, Web Browser, Status Bar, and related Expo modules
- Lucide React Native and Expo vector icons

## Project Status

This repository currently behaves like a front-end/mobile client prototype. It does not appear to be connected to a backend API yet.

Important current characteristics:

- Product, store, market, category, and promotional data is mostly defined in `constants/Data.ts`.
- Cart, wishlist, profile, checkout selections, toast, and chat state are stored in React Context.
- Most state is in memory and will reset when the app reloads.
- Authentication screens exist, but there is no visible real authentication service integration.
- Checkout can collect/select address and payment state locally, but order submission is still marked as a TODO.
- Some product and policy copy is placeholder text and should be replaced before production use.

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo CLI through `npx expo`
- iOS Simulator, Android Emulator, Expo Go, or a development build environment

### Install Dependencies

```bash
npm install
```

### Start The App

```bash
npm start
```

This runs `expo start`. From the Expo terminal UI, you can open the app in Expo Go, an iOS Simulator, an Android Emulator, or a development build.

### Platform Commands

```bash
npm run ios
npm run android
npm run web
```

### Lint

```bash
npm run lint
```

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Starts the Expo development server. |
| `npm run ios` | Runs the native iOS app through Expo. |
| `npm run android` | Runs the native Android app through Expo. |
| `npm run web` | Starts the Expo web build. |
| `npm run lint` | Runs Expo linting. |

Note: `package.json` also contains a `reset-project` script that points to `scripts/reset-project.js`, but this repository does not currently include that `scripts` directory.

## App Structure

```text
app/
  _layout.tsx                         Root providers, fonts, and navigation stack
  (root)/
    splash.tsx                        Splash screen route
    index.tsx                         Entry route that redirects/exports splash
    (auth)/                           Onboarding and authentication screens
    (tabs)/                           Main tab navigation
      index.tsx                       Home marketplace feed
      category.tsx                    Category browsing
      cart.tsx                        Cart screen
      wishlist.tsx                    Wishlist screen
      profile.tsx                     Profile menu
    screens/                          Product, checkout, stores, markets, and profile sub-screens

components/
  buttons/                            Reusable button components
  cards/                              Product, store, market, cart, banner, and voucher cards
  home/                               Home-specific UI
  profile/                            Profile-specific UI

constants/
  Data.ts                             Mock marketplace data
  Colors.ts                           Color tokens
  Fonts.ts                            Font names
  icons.ts                            Icon references

context/
  CartContext.tsx                     Cart state and quantity actions
  WishlistContext.tsx                 Wishlist state
  ChatContext.tsx                     Vendor chat threads and messages
  ProfileContext.tsx                  Addresses, payment methods, and checkout selections
  ToastContext.tsx                    Toast state

styles/
  responsive.ts                       Responsive sizing helpers

assets/
  fonts/                              Montserrat font files
  images/                             Product, category, auth, splash, and UI images
  icons/                              Additional icon assets
```

## Navigation Overview

The app uses Expo Router, so route files map directly to screens.

Main tabs:

- `app/(root)/(tabs)/index.tsx` - Home
- `app/(root)/(tabs)/category.tsx` - Explore categories
- `app/(root)/(tabs)/cart.tsx` - Cart
- `app/(root)/(tabs)/wishlist.tsx` - Wishlist
- `app/(root)/(tabs)/profile.tsx` - Profile

Important screens:

- `app/(root)/screens/[id].tsx` - Product detail screen
- `app/(root)/screens/Checkout.tsx` - Checkout
- `app/(root)/screens/market.tsx` - Markets list
- `app/(root)/screens/popular.tsx` - Popular products
- `app/(root)/screens/recommendation.tsx` - Recommendations
- `app/(root)/screens/stores/stores.tsx` - Stores list
- `app/(root)/screens/stores/[id].tsx` - Store detail
- `app/(root)/screens/productDetails/chat/[vendorId].tsx` - Vendor chat

Authentication and onboarding routes live in `app/(root)/(auth)/`.

## State Management

The app currently uses lightweight React Context providers mounted in `app/_layout.tsx`:

- `CartProvider` stores cart items and exposes add, remove, increase, decrease, and clear actions.
- `WishlistProvider` stores favorited products.
- `ChatProvider` stores vendor chat threads and in-memory messages.
- `ProfileProvider` stores addresses, payment methods, defaults, and checkout selections.
- `ToastProvider` stores transient toast notifications.

Because this data is not persisted yet, app reloads will clear most user state.

## Data Model

Most marketplace content is local mock data in `constants/Data.ts`, including:

- `flashSales`
- `recommendations`
- `PopularProducts`
- `Stores`
- `markets`
- `categories`

The product detail screen receives product information through route params and falls back to mock data for related images and store matching.

## Styling

The project mixes React Native `StyleSheet` styles with NativeWind utility classes.

Shared styling resources:

- `constants/Colors.ts`
- `constants/Fonts.ts`
- `styles/responsive.ts`
- `tailwind.config.js`
- `app/global.css`

Montserrat fonts are loaded in the root layout before the app renders.

## Development Notes

- Keep route paths aligned with Expo Router file names.
- Prefer updating shared cards and buttons in `components/` instead of duplicating UI in screens.
- Keep mock marketplace data in `constants/Data.ts` until a backend/API layer is introduced.
- If persistence is added, the cart, wishlist, profile, and chat contexts are the first places to integrate storage.
- Before production, replace placeholder copy, connect authentication, persist user data, implement order submission, and validate checkout/payment flows.

## Recommended Next Steps

1. Add backend/API integration for products, stores, users, carts, and orders.
2. Persist cart, wishlist, addresses, payment methods, and chat state with secure/local storage where appropriate.
3. Replace placeholder product descriptions, reviews, return policy copy, and sample user data.
4. Implement real authentication and session handling.
5. Complete order placement and confirmation flow.
6. Add automated tests for cart, wishlist, checkout, and profile state behavior.
7. Review mobile responsiveness across small Android devices, modern iPhones, tablets, and web.
