# Seller Center — Audit & Delivery Report

## Existing Seller Center (baseline)

### Mobile
- Workspace modes: `shop_and_sell` | `sell_only` (SecureStore-persisted)
- Sell-only tabs: **Home · Orders · Products · Stock · Business** (shopping tabs hidden; labels shown)
- Full `/vendor/*` stack: apply, store, products, orders, returns, inventory, customers, reviews, chats, analytics, wallet, vouchers, flash sales, settings
- Realtime order alerts + dashboard/product/order subscriptions

### Backend (`/api/vendor`)
- Onboarding, store, products CRUD + stock/status, orders + acknowledge, returns, wallet/payouts, vouchers, flash nominations, campaign opt-in, dashboard, analytics, reviews list, customers aggregate

---

## Wave 1 enhancements implemented

### Experience & navigation
- Sell-only **Profile** remapped to business tools (Orders, Returns, Messages, Wallet, Reviews, Vouchers, Seller Settings); shopper personalization hidden in sell-only
- Shared list components: `VendorOrdersList`, `VendorProductsList` + `VendorListSearch` (search on orders/products/inventory)
- Product **Duplicate** action (`duplicateFrom` create flow)
- Hub rebuilt as command center: **Needs attention → Today → Quick actions → Business insights → Analytics → Grow & manage**
- Vacation banner on hub when store is paused
- `refreshVendorState(session, { force: true })` for trustworthy pull-to-refresh

### Store & catalog ops
- Vacation mode + vacation message + business hours on store profile (mobile + API)
- Vacationing stores excluded from public catalog / assistant store surfaces
- Inventory search + available-stock labeling
- Order detail: buyer phone + call / open chats shortcuts
- Customers: tap into vendor orders (mode-aware)

### Reviews & analytics
- Vendor reply on reviews (`PATCH /vendor/reviews/{id}/reply`) with ownership checks
- Mobile: All / Unanswered filters + reply composer
- Analytics period chips `7d | 30d | 90d` with `daily_points` time series
- Dashboard adds `active_voucher_count`, `is_on_vacation`

### Finance & security
- Wallet auth aligned to `require_vendor_access` (dual-role approved sellers can access payouts)
- List endpoints support `q`, `limit`, `offset` (products, orders, reviews, customers)

### Admin
- Admin review detail shows **Seller reply** (read-only) when present

---

## Files (primary)

### Backend
- `alembic/versions/s9t0u1v2w3x4_add_seller_center_wave1_fields.py`
- `app/models/catalog.py`, `app/models/order.py`
- `app/schemas/vendor.py`, `app/schemas/admin.py`
- `app/controllers/vendor_controller.py`, `wallet_controller.py`, `admin_controller.py`, `catalog_controller.py`
- `app/routes/vendor.py`
- Tests: `test_vendor_review_reply.py`, `test_wallet_auth.py`, `test_vendor_analytics.py`

### Mobile
- Hub: `components/vendor/VendorTabHub.tsx`
- Lists: `VendorOrdersList.tsx`, `VendorProductsList.tsx`, `VendorListSearch.tsx`
- Screens: `profile.tsx`, `store.tsx`, `reviews.tsx`, `customers.tsx`, `inventory.tsx`, `analytics.tsx`, `products/new.tsx`, seller/vendor order+product tabs
- Services/types: `vendorService.ts`, `storeService.ts`, `types/vendor.ts`, `types/store.ts`, `vendorStore.ts`, `useVendorAnalytics.ts`, `vendorAnalytics.ts`
- Order detail: `VendorOrderDetailView.tsx`

### Admin
- `types/index.ts`, `api/mappers.ts`, `api/reviewsApi.ts`, `pages/full/FullReviewsPage.tsx`

### Database
- Migration adds: `stores.is_on_vacation`, `stores.vacation_message`, `stores.business_hours`; `reviews.vendor_reply`, `reviews.vendor_replied_at`

---

## API contracts added/extended

| Endpoint | Change |
|----------|--------|
| `GET/PATCH /vendor/store` | `is_on_vacation`, `vacation_message`, `business_hours` |
| `PATCH /vendor/reviews/{id}/reply` | `{ reply }` → review with reply fields |
| `GET /vendor/reviews` | reply fields + `q`/`limit`/`offset` |
| `GET /vendor/analytics?period=` | `7d\|30d\|90d`, `daily_points`, period totals |
| `GET /vendor/products\|orders\|customers` | `q`/`limit`/`offset` |
| `GET /vendor/dashboard` | `active_voucher_count`, `is_on_vacation` |

---

## Performance / security notes
- Pagination/search params reduce full-list pressure for larger catalogs
- Review reply and all vendor ops remain scoped by `vendor_user_id` / store ownership
- Wallet gate no longer blocks approved sellers who still have `role=customer`

---

## Wave 2 enhancements implemented (Ops Core)

### Inventory ledger & reserved stock
- `InventoryMovement` ledger via `record_stock_change` on manual patch, product create/update, order sales, admin stock edits, and bulk updates
- `GET /vendor/products/{id}/inventory-movements` with ownership checks
- Vendor product payloads include `reserved_stock` (open order qty) and `available_stock`
- Mobile inventory: On hand / Reserved / Available + per-SKU history sheet

### Bulk catalog ops
- `PATCH /vendor/products/bulk` (`product_ids`, optional `stock` / `status`, max 50, reason=`bulk`)
- Mobile products list: multi-select → hide / relist / set stock

### Seller notification prefs
- User columns: `vendor_notify_orders|inventory|reviews|payouts` (synced with `vendor_order_notifications` for orders)
- Gates: order pushes/reminders, inventory low/OOS, withdrawal updates
- Seller Settings toggles + Auth profile mapping
- Activity deep-links already cover `vendor_product` / `vendor_order` / `vendor_wallet`

### Campaigns
- `GET /vendor/merchandising-campaign-opt-ins` — vendor’s opt-ins with campaign title + status
- Mobile `/vendor/campaigns` + hub / settings links

### Deferred (still out of scope)
- Staff accounts & RBAC
- Tax / invoice PDFs
- CSV bulk import
- Multi-warehouse / locations

### Database
- Migration `t0u1v2w3x4y5_seller_center_wave2.py` — `inventory_movements` + `vendor_notify_*` columns (after Wave 1 head)

### API contracts added/extended (Wave 2)

| Endpoint | Change |
|----------|--------|
| `PATCH /vendor/products/{id}/stock` | Writes ledger (`manual`) |
| `GET /vendor/products/{id}/inventory-movements` | Stock history |
| `PATCH /vendor/products/bulk` | Bulk stock/status |
| `GET /vendor/products` | `reserved_stock`, `available_stock` |
| `GET /vendor/merchandising-campaign-opt-ins` | Opt-in status list |
| `GET/PATCH /auth/me` | `vendor_notify_*` prefs |

---

## Vendor acceptance checklist
1. Switch to sell-only → only Seller/Orders/Products/Profile
2. Hub Needs attention → correct queues
3. Quick Action Add Product / Duplicate works
4. Inventory search + stock save; history sheet shows ledger rows
5. Inventory shows reserved vs available when open orders exist
6. Bulk select → hide 3 products + bulk stock; ledger reason=`bulk`
7. Disable inventory alerts → no low/OOS push; orders prefs independent
8. Campaigns screen lists own opt-in statuses
9. Reply to a review; unanswered filter works
10. Toggle vacation → hub banner; storefront hidden from browse
11. Analytics period chips update trend
12. Dual-role seller can open Wallet
13. Profile in sell-only opens vendor Returns/Chats/Wallet/Settings
