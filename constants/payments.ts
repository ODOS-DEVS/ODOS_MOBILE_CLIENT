/**
 * Which gateway collects order payments.
 *
 * KutanaPay is the live collector. Paystack stays wired up because vendor
 * payouts run through its transfer API, and because a single env var is the
 * fastest way back if a live collection problem has to be rolled back without
 * shipping a build.
 *
 * Payouts are unaffected by this setting — KutanaPay's public API covers
 * checkouts only, so vendor transfers remain on Paystack either way.
 */
export type CollectionsProvider = "kutanapay" | "paystack";

const configured = process.env.EXPO_PUBLIC_COLLECTIONS_PROVIDER?.trim().toLowerCase();

export const COLLECTIONS_PROVIDER: CollectionsProvider =
  configured === "paystack" ? "paystack" : "kutanapay";

export const CHECKOUT_PATH =
  COLLECTIONS_PROVIDER === "kutanapay"
    ? "/payments/kutanapay/checkout"
    : "/payments/checkout";
