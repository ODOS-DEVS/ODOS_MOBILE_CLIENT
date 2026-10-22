import type { LoyaltyAccount } from "@/hooks/useLoyalty";

/**
 * The last loaded loyalty account, held across mounts.
 *
 * This lives in its own module rather than inside `useLoyalty` to keep
 * `AuthContext` out of a require cycle. Sign-out has to clear the cache, so
 * AuthContext needs `clearLoyaltyCache`; the hook needs `useAuth` to key the
 * cache per user. Those two together made
 * `AuthContext -> useLoyalty -> AuthContext`, and a cycle through the module
 * every screen depends on resolves to a half-initialised export at startup —
 * which surfaced as `Cannot read property 'displayName' of undefined` with
 * stack frames pointing at unrelated files.
 *
 * The only import here is a *type*, which is erased at compile time, so this
 * module sits at the bottom of the graph and depends on nothing at runtime.
 */

export type CachedLoyalty = {
  userId: string;
  account: LoyaltyAccount;
  fetchedAt: number;
};

/** How long a cached account is served before a refetch. */
export const LOYALTY_ACCOUNT_STALE_MS = 2 * 60_000;

let cached: CachedLoyalty | null = null;

/** The cached account for this user, or null if absent, stale or another user's. */
export function readLoyaltyCache(userId: string | null): CachedLoyalty | null {
  if (!cached || !userId || cached.userId !== userId) {
    return null;
  }
  return cached;
}

export function isLoyaltyCacheFresh(entry: CachedLoyalty | null) {
  return Boolean(entry && Date.now() - entry.fetchedAt < LOYALTY_ACCOUNT_STALE_MS);
}

export function writeLoyaltyCache(userId: string | null, account: LoyaltyAccount) {
  if (!userId) {
    return;
  }
  cached = { userId, account, fetchedAt: Date.now() };
}

export function clearLoyaltyCache() {
  cached = null;
}
