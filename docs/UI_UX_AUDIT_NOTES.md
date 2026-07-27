# UI/UX Audit & Polish — Mobile Companion Notes

Full dual-surface report: see `ODOS_ADMIN/docs/UI_UX_AUDIT_REPORT.md`.

## Mobile changes in this pass

- Fixed invalid `##F9F9F9` accent (`constants/Colors.ts`, `tailwind.config.js`)
- Added `components/ui/FeedbackBanner.tsx` for auth/forms
- Theme-aware: `LoadingSpinner`, `SearchFilterSheet`, vendor `StatCard` / `StatusBadge`
- `ViewAllButton` + `VendorScrollBody` spacing/token alignment
- Accessibility: filter sheet labels + larger close targets

## Principle

Reuse `useTheme()` + Account/Vendor primitives; do not invent parallel design systems.
