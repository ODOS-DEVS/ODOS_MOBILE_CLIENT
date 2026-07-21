# Mobile Marketplace Audit & Enhancement Report

**Date:** 2026-07-20  
**Repos:** `odos-mobile-expo` + `ODOS_MOBILE_BACKEND`

---

## 1. Architecture overview

| Layer | Pattern |
|-------|---------|
| Mobile routing | Expo Router — root Stack, `(tabs)`, `/vendor/*` stack |
| State | React Context (auth, cart, wishlist, chat, theme…) + Zustand (workspace, vendor, store) |
| API | Raw `fetch` + env `EXPO_PUBLIC_API_URL`; new shared `services/apiClient.ts` |
| Auth | JWT in SecureStore; Google via `expo-auth-session`; password-reset token in SecureStore |
| Modes | `shop_and_sell` \| `sell_only` (Seller Center tab remapping) |
| Backend | FastAPI `/api/*`; vendor routes under `/api/vendor` |

---

## 2. Issues identified

### Critical / high
- Password reset JWT was URL-param mangled → generic “Something went wrong.”
- Google OAuth used wrong iOS redirect URI → `invalid_request`
- Multi-vendor order status could cancel/deliver another seller’s cart lines
- Dashboard sales statuses disagreed across today / total / analytics
- FastAPI 422 validation arrays broke vendor `parseErrorMessage` (string-only)
- Auth `/me` polled every **15s** (battery / re-render cost)
- Language settings faked a successful save

### Medium
- No shared API error helper (duplicated across services)
- Vendor UI shell hard-coded light background (dark-mode mismatch)
- Seller hub pushed stack routes while sell-only also has tab screens
- Customer aggregation included cancelled orders; fragile sort on naive datetimes
- Password-reset session was memory-only (process kill mid-flow)

### Deferred (documented, not fully rebuilt)
- Full design-system unification (`AppColors` vs `ThemeContext`)
- Vendor orders/products pagination + SQL dashboard aggregates
- Deduplicating seller tab vs stack list screens into one shared component
- Cart/wishlist silent sync failures → toast (partial infrastructure ready via `apiClient`)

---

## 3. Improvements implemented

### Auth & API (mobile)
- Shared `services/apiClient.ts` (`formatApiDetail`, `parseApiErrorMessage`, `apiFetch`)
- Vendor + store services use shared error parsing (422-safe)
- Session refresh interval **15s → 3 minutes**
- Password-reset token persisted in SecureStore (15 min TTL) + async hydrate on create-password
- Google redirect URI uses reversed iOS client ID (prior fix retained)
- Reset JWT no longer passed through Expo Router params (prior fix retained)

### Seller Center UX
- Vendor screen shell uses theme `colors.screen` (dark-mode aware)
- In sell-only, hub Orders/Products deep-link to seller tabs (fewer duplicate journeys)
- Language screen: English-only truthfulness; removed fake save

### Backend
- Global exception handlers normalize `detail` to a **string** (HTTP + validation)
- Canonical `VENDOR_SALES_ORDER_STATUSES` for dashboard + analytics
- Customers: exclude cancelled/refunded; safer keys; timezone-safe sort
- Multi-vendor order status: sole-vendor cancel/deliver only; shared carts settle this vendor without marking the whole order delivered/cancelled

---

## 4–7. Backend / frontend / API / database

| Area | Change |
|------|--------|
| Backend | `app/main.py` error handlers; `vendor_controller.py` sales/customers/order-status |
| Frontend | `apiClient`, auth session interval, password reset persistence, VendorUi theme, Language, VendorTabHub routing |
| API | Error `detail` always string for HTTP/validation; behavior change on shared-cart cancel |
| Database | **No migrations** |

---

## 8. UI/UX enhancements
- Seller screens respect dark mode background
- Language no longer pretends unsupported locales were saved
- Sell-only navigation prefers tab destinations for daily ops

## 9. Performance
- Auth session refresh reduced ~12× (every 3 min vs 15s)

## 10. Security
- Shared-cart cancel blocked for non-sole vendors
- Shared-cart deliver no longer marks the entire customer order delivered
- Reset token kept out of URLs; short-lived SecureStore

---

## 11. Files modified / added

### Mobile
- `services/apiClient.ts` *(new)*
- `services/vendorService.ts`, `services/storeService.ts`
- `utils/passwordResetSession.ts`, `context/AuthContext.tsx`
- `app/(root)/(auth)/createpassowrd.tsx`
- `components/vendor/VendorUi.tsx`, `components/vendor/VendorTabHub.tsx`
- `app/(root)/screens/profileScreens/personalization/Language.tsx`
- `docs/MOBILE_AUDIT_REPORT.md` *(this file)*

### Backend
- `app/main.py`
- `app/controllers/vendor_controller.py`

---

## 12. Recommendations (next)

1. Paginate `GET /vendor/orders` and `/vendor/products`; wire `onEndReached` on mobile lists  
2. SQL aggregates for `/vendor/dashboard` (stop loading full order payloads)  
3. Extract shared Vendor Orders/Products list component (tabs + stack wrappers)  
4. Rename `createpassowrd` → `createpassword` with redirect alias  
5. Align mobile Google client IDs with backend `GOOGLE_CLIENT_IDS` + EAS secrets  
6. Per-line-item vendor fulfillment status for true multi-vendor carts  
7. Toast + retry for cart/wishlist sync failures  
8. Gradual migration of remaining `AppColors` screens to `useTheme()`
