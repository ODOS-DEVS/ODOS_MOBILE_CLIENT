# Phase 2: Loyalty & Personalization - End-to-End Test Plan

## Test Overview
Complete test coverage for Phase 2 features including loyalty tiers, personalized home feed, wishlist management, and recommendations.

## Prerequisites
- Backend Phase 2 APIs deployed and running
- Mobile app built and running on simulator/device
- Test user accounts with different purchase histories
- Database seeded with products, orders, and user behavior

---

## 1. Loyalty System Tests

### 1.1 Loyalty Account Creation
**Test**: New user should auto-get Bronze tier loyalty account
- Sign up new account
- Verify GET /api/loyalty/account returns Bronze tier
- Verify total_points = 0, lifetime_spend = 0

### 1.2 Tier Auto-Progression
**Test**: User should auto-upgrade tiers at spending thresholds
- Test Bronze → Silver (≥1000 GHS spent)
  - Place orders totaling 1000 GHS
  - Call GET /api/loyalty/account
  - Verify tier_level = "silver"
  - Verify tier_upgraded_at is recent
- Test Silver → Gold (≥5000 GHS spent)
  - Place orders totaling additional 4000 GHS
  - Verify tier_level = "gold"

### 1.3 Point Earning
**Test**: Points should be earned at 1 point per GHS with tier multiplier
- Bronze user: Purchase 100 GHS worth of products
  - Verify 100 points earned (1x multiplier)
  - Check GET /api/loyalty/history shows earn event
- Silver user: Purchase 100 GHS worth of products
  - Verify 125 points earned (1.25x multiplier)
- Gold user: Purchase 100 GHS worth of products
  - Verify 150 points earned (1.5x multiplier)

### 1.4 Point Redemption
**Test**: User should be able to redeem points for account credit
- User has 500 points
- Call POST /api/loyalty/redeem with points=100
- Verify 100 points deducted
- Verify account credit increased by 1 GHS (100 points = 1 GHS)
- Verify GET /api/loyalty/history shows redeem event

### 1.5 Loyalty Benefits Display
**Test**: Tier benefits should display correctly in UI
Mobile test:
- Open Profile → Loyalty card
- Verify tier badge (Bronze/Silver/Gold emoji)
- Verify points balance display
- Verify tier benefits displayed
- Silver: "5% discount", "1.25x points", "Free shipping on 50+ GHS"
- Gold: "10% discount", "1.5x points", "Free shipping on 30+ GHS"

### 1.6 Loyalty Detail Screen
**Test**: Loyalty screen should show full account info and history
Mobile test:
- Navigate to Loyalty detail screen from profile
- Verify current tier displayed prominently
- Verify progress bar to next tier (if not Gold)
- Verify points balance and GHS value
- Verify tier benefits listed with checkmarks
- Verify recent transactions listed (earn/redeem events)
- Test "Redeem Points" button
  - Enter valid point amount
  - Verify modal validation
  - Verify points deducted on success
- Test pull-to-refresh
  - Pull down
  - Verify data reloads

---

## 2. Wishlist Tests

### 2.1 Wishlist CRUD Operations
**Test**: User should be able to add/remove products from wishlist
- Navigate to product detail
- Tap heart icon to add to wishlist
- Verify product added (visual feedback)
- Navigate away and back
- Verify product still in wishlist
- Tap heart again to remove
- Verify product removed from wishlist

### 2.2 Wishlist Sync Across Devices
**Test**: Wishlist should sync via API
- Add products to wishlist in mobile app
- Call GET /api/wishlist
- Verify all added products returned
- Remove a product in API
- Refresh wishlist in mobile
- Verify product no longer in list

### 2.3 Wishlist Screen
**Test**: Wishlist tab should display all saved products
Mobile test:
- Add 5 products to wishlist
- Open Wishlist tab
- Verify all 5 products displayed in grid
- Verify product details (price, rating, image)
- Tap on product
- Verify navigates to product detail
- Tap heart on product card
- Verify product removed from list

### 2.4 Wishlist Empty State
**Test**: Empty wishlist should show helpful messaging
- Clear wishlist
- Open Wishlist tab
- Verify empty state with icon
- Verify "Nothing saved yet" message
- Verify "Discover products" CTA button
- Tap CTA
- Verify navigates to home/category

### 2.5 Wishlist Count Badge
**Test**: Wishlist icon should show product count
- Add 3 products to wishlist
- Check tab icon
- Verify badge shows "3" (if implemented)
- Add 2 more
- Verify badge updates to "5"

---

## 3. Home Feed Personalization Tests

### 3.1 Feed Section Structure
**Test**: Home feed should have 5 sections in order
Backend test:
- Call GET /api/home-feed
- Verify response has sections for:
  1. recommended
  2. trending
  3. recently_viewed
  4. wishlist
  5. category_spotlight
- Verify each section has: title, subtitle, products[], count

### 3.2 Recommended Section
**Test**: Recommended products should use multi-factor engine
- New user (no purchase history): Should see best-sellers (cold-start)
- Returning user: Should see products similar to past purchases
- Verify 4-6 products in section
- Verify product details (title, price, image, rating)

### 3.3 Trending Section
**Test**: Trending should show best 7-day sellers
- Seed database with products and 7-day sales data
- Call GET /api/home-feed
- Verify trending section shows highest-velocity products
- Verify products have sales/view counts

### 3.4 Recently Viewed Section
**Test**: Recently viewed should show user's last 10 clicked products
- View 10 products in sequence
- Call GET /api/home-feed
- Verify recently_viewed section shows last 10 in reverse order
- Verify recent-most product is first

### 3.5 Wishlist Section
**Test**: Wishlist section should show saved products with count badge
- Add 5 products to wishlist
- Call GET /api/home-feed
- Verify wishlist section exists
- Verify count badge shows "5"
- Verify 5 products displayed
- Tap "View all" in section header
- Verify navigates to full wishlist screen

### 3.6 Category Spotlight
**Test**: Category spotlight should show best products in user's top category
- User has viewed/purchased from Electronics category
- Call GET /api/home-feed
- Verify category_spotlight section shows Electronics products
- Verify products are top-rated in that category

### 3.7 Pull-to-Refresh
**Test**: Home feed should refresh when pulled down
Mobile test:
- Open Home tab
- Pull down refresh gesture
- Verify loading indicator appears
- Verify data reloads after 1-2 seconds
- Verify sections update with latest data

### 3.8 Pagination
**Test**: Individual sections should support pagination
Backend test:
- Call GET /api/home-feed/section/recommended?limit=5&offset=0
- Verify 5 products returned
- Call with offset=5
- Verify next 5 products returned
- Verify no duplicates

---

## 4. Recommendation Engine Tests

### 4.1 Multi-Factor Engine
**Test**: Recommendations should blend behavioral, collaborative, trending, cold-start
- New user: Should mostly get best-sellers
- User after 5 purchases: Should see behavioral recommendations
- User with no history in category: Should see trending in that category
- Verify no out-of-stock products recommended
- Verify rating filter (exclude <3.0 products if configured)

### 4.2 Cold-Start Handling
**Test**: New users should get relevant recommendations without data
- Create new account
- Call GET /api/home-feed
- Verify recommended section shows 4+ products
- Verify products are best-sellers or trending
- Verify no errors

### 4.3 Product Relevance
**Test**: Recommendations should be relevant to user
- User: Frequent electronics buyer
- Call GET /api/recommendations/for-you
- Verify majority of recommendations are electronics
- Verify products user hasn't viewed recently
- Verify products rated ≥3.0 (assuming quality filter)

---

## 5. Integration Tests

### 5.1 Purchase → Points → Loyalty Tier Update
**Test**: End-to-end flow from purchase to loyalty update
1. Bronze user with 900 GHS lifetime spend
2. Make purchase of 150 GHS
3. Order marked as completed
4. Check POST /api/loyalty/account - should show 1050 total spend
5. Verify tier_level auto-upgraded to Silver
6. Verify points earned with Silver multiplier (1.25x)

### 5.2 Profile Tab Journey
**Test**: Complete user journey in profile tab
Mobile test:
1. Open Profile tab
2. Verify user info displayed
3. Verify vendor section (if applicable)
4. Verify loyalty card displays tier and points
5. Tap loyalty card
6. Navigate to loyalty detail screen
7. Verify tier info, progress, benefits
8. Tap "Redeem Points"
9. Enter points, verify redemption
10. Verify transaction appears in history
11. Tap back to return to profile

### 5.3 Shopping → Wishlist → Recommendation Flow
**Test**: Discovery and saving flow
Mobile test:
1. Open Home tab
2. Verify 5 feed sections displayed
3. View 5 products (triggers recently_viewed)
4. Add 3 products to wishlist
5. Open Wishlist tab
6. Verify 3 products saved
7. Open Home tab again
8. Verify recently_viewed section shows viewed products
9. Verify wishlist section shows count "3"
10. Verify recommendations changed based on views

### 5.4 Auth-Gated Features
**Test**: Guest users should be prompted to sign in
Mobile test:
- Log out
- Try to access Wishlist tab
- Verify "Sign in to save favorites" prompt
- Try to add product to wishlist
- Verify auth gate/redirect

---

## 6. Error Handling Tests

### 6.1 Network Errors
- Disable network while loading home feed
- Verify error state displayed
- Verify retry button works
- Verify manual refresh attempts

### 6.2 API Failures
- Mock 500 error on /api/loyalty/account
- Verify graceful error handling
- Verify user can still navigate

### 6.3 Invalid Data
- Empty wishlist response
- Null product in recommendation
- Verify no crashes
- Verify empty states displayed

---

## 7. Performance Tests

### 7.1 Home Feed Load Time
- Measure GET /api/home-feed response time
- Target: <500ms for first page
- Target: <1s including image loads in UI

### 7.2 Loyalty Account Load
- Measure GET /api/loyalty/account response time
- Target: <200ms
- Should include tier benefits without N+1

### 7.3 Image Rendering
- Home feed with 20+ images
- Verify smooth scrolling (60fps)
- Verify no memory leaks

---

## 8. Browser/Device Testing

### Devices to Test
- iPhone 12+ (iOS 15+)
- Android 10+ (Samsung, Pixel)
- iPad (if app supports)

### Test Scenarios
- Light/dark mode
- Portrait/landscape
- Network: WiFi, 4G, 3G
- Background refresh
- App backgrounding/foregrounding

---

## 9. Test Data Requirements

### Seed Database With
```
Users:
- User A: 0 purchases, 0 points (NEW)
- User B: 5 purchases, 500 GHS spend (ACTIVE)
- User C: 15 purchases, 1200 GHS spend (SILVER)
- User D: 50 purchases, 6000 GHS spend (GOLD)

Products:
- 50 products across 5 categories
- 20 with ratings 4.0+
- 10 with sales in last 7 days (trending)
- Mix of in-stock/out-of-stock

Orders:
- User B: 5 orders, mix of electronics and clothing
- User C: 15 orders, heavily electronics
- User D: 50 orders, diverse categories

Behavior Events:
- 1000+ view events
- 200+ click events
- 100+ purchase events
```

---

## 10. Success Criteria

✅ All CRUD operations work (loyalty, wishlist, recommendations)
✅ Tier auto-progression triggers correctly
✅ Home feed displays all 5 sections
✅ Recommendations are relevant and diverse
✅ Wishlist syncs across devices/tabs
✅ UI is responsive and error-free
✅ No console errors or crashes
✅ All screens have proper loading/empty states
✅ Pull-to-refresh works on all feed screens
✅ Performance targets met

---

## Test Execution Checklist

- [ ] Backend APIs deployed
- [ ] Mobile app built and running
- [ ] Test data seeded
- [ ] Manual testing completed
- [ ] Edge cases verified
- [ ] Error scenarios handled
- [ ] Performance benchmarked
- [ ] All devices tested
- [ ] Documentation complete
- [ ] Ready for production
