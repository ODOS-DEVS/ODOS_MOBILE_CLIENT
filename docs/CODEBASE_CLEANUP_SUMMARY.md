# Codebase Cleanup Summary — odos-mobile-expo

**Date:** July 27, 2026  
**Scope:** Dead code removal, currency consolidation, deprecated export cleanup

## Files Removed (11)

| File | Reason |
|------|--------|
| `constants/Data.ts` | 577-line mock catalog; zero imports |
| `components/SocialLoginButtons.tsx` | Deprecated; superseded by auth blocks |
| `components/SortTabs.tsx` | Unused component |
| `components/buttons/AddToCart.tsx` | Superseded by `AddToCartBtn.tsx` |
| `components/loaders/AppLoadingOverlay.tsx` | Unused wrapper |
| `components/loaders/LoaderPanel.tsx` | Unused wrapper |
| `components/navigation/TabBarImageIcon.tsx` | Superseded by `TabBarVectorIcon` |
| `components/NotificationItem.tsx` | Unused component |
| `components/PreferencesItem.tsx` | Unused component |
| `components/theme/ThemedScreen.tsx` | Unused component |

## Duplicate Code Eliminated

- Consolidated 5 local `formatCurrency` / `formatPrice` implementations onto `utils/currency.ts` in:
  - `components/cards/ProductCard.tsx`
  - `components/cards/RecommendationCard.tsx`
  - `components/store/StoreFeaturedShowcase.tsx`
  - `app/(root)/screens/[id].tsx`
  - `utils/shareCatalog.ts`
- `utils/deals.ts` now re-exports `formatCurrency` from the shared utility

## Deprecated Exports Removed

- `useRecommendedProducts()` and its scoring helpers from `hooks/useCatalog.ts`
- `consumePasswordResetToken` alias from `utils/passwordResetSession.ts`
- `HomeHeaderSkeleton`, `SearchLauncherSkeleton` from `CommerceSkeletons.tsx`
- `categorySearchBarStyle` from `CategoryUi.tsx`
- Static `accountStyles` and `commerceSeeAllScreenStyles` deprecated exports

## Other Fixes

- Removed broken `reset-project` npm script (missing `scripts/reset-project.js`)

## Verification

- `npm run lint` — 0 errors (pre-existing warnings only)

## Remaining Technical Debt

- `context/AuthContext.tsx` (~1,779 lines) — candidate for module split
- 8 near-identical commerce “see all” screens — candidate for parameterized route
- Parallel vendor routes (`/(tabs)/seller-*` vs `/vendor/*`) — document or unify
- No automated test runner (Jest/Detox); only lint + one manual integration script
- 98 ESLint warnings (mostly unused vars, duplicate imports, array-type style)

## Recommendations

1. Add Jest + React Native Testing Library for critical flows
2. Extract shared commerce browse screen from duplicated pages
3. Run `expo lint --fix` for auto-fixable import/style warnings
4. Split `AuthContext` into session vs profile modules
