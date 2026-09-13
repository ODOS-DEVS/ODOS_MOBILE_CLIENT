/**
 * Which gateway collects order payments.
 *
 * iPay is the live collector; Paystack stays wired up because vendor payouts
 * run through its transfer API, and because a single env var is the fastest
 * way back if a live collection problem has to be rolled back without a build.
 *
 * Payouts are unaffected by this setting -- iPay publishes no transfer API.
 */
export type CollectionsProvider = "ipay" | "paystack";

const configured = process.env.EXPO_PUBLIC_COLLECTIONS_PROVIDER?.trim().toLowerCase();

export const COLLECTIONS_PROVIDER: CollectionsProvider =
  configured === "paystack" ? "paystack" : "ipay";

export const CHECKOUT_PATH =
  COLLECTIONS_PROVIDER === "ipay" ? "/payments/ipay/checkout" : "/payments/checkout";
