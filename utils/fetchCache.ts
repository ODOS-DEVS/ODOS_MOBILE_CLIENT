import { API_BASE_URL } from "@/constants/auth";

export class CachedFetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CachedFetchError";
    this.status = status;
  }
}

type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

export const CACHE_STALE = {
  categories: 15 * 60 * 1000,
  markets: 15 * 60 * 1000,
  products: 60 * 1000,
  productsFlash: 30 * 1000,
  stores: 2 * 60 * 1000,
  detail: 60 * 1000,
} as const;

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();
const backgroundRefreshes = new Set<string>();
const cacheListeners = new Set<(url: string, data: unknown) => void>();

function notifyCacheListeners(url: string, data: unknown) {
  cacheListeners.forEach((listener) => {
    listener(url, data);
  });
}

export function subscribeCacheUpdates(listener: (url: string, data: unknown) => void) {
  cacheListeners.add(listener);
  return () => {
    cacheListeners.delete(listener);
  };
}

export type CachedFetchOptions = {
  staleTimeMs?: number;
  force?: boolean;
};

// The backend runs on a free tier that goes to sleep when idle, so the very
// first request after a period of inactivity (typically right when the app
// cold-starts) can time out or briefly 5xx while it wakes up. Without this,
// that shows up as "flash sales/stores/markets fail to load until I tap
// retry" — the retry only "worked" because by then the backend was awake.
// Retrying a few times with backoff makes that first load self-heal instead
// of requiring a manual tap.
const FETCH_RETRY_DELAYS_MS = [0, 2000, 5000, 10000];
const FETCH_TIMEOUT_MS = 20_000;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const NETWORK_ERROR_PATTERN =
  /network request failed|failed to fetch|timed out|timeout|aborted/i;

function isRetryableFetchError(error: unknown): boolean {
  if (error instanceof CachedFetchError) {
    return error.status >= 500;
  }
  if (error instanceof Error) {
    return NETWORK_ERROR_PATTERN.test(error.message);
  }
  return false;
}

export type FetchErrorKind = "network" | "server" | "unknown";

/**
 * Best-effort classification of a failed request, without any device-level
 * connectivity check (this app has no NetInfo/expo-network dependency): a
 * request that never got an HTTP response (timed out, aborted, DNS/connect
 * failure) reads as "network" — can't reach ODOS, which covers both "you're
 * offline" and "the backend is down" since we can't tell those apart from
 * here. A request that got a 5xx (or other non-2xx) response reads as
 * "server" — we reached ODOS and it had a problem.
 */
export function classifyFetchError(error: unknown): FetchErrorKind {
  if (error instanceof CachedFetchError) {
    return error.status >= 500 ? "server" : "unknown";
  }
  if (error instanceof Error && NETWORK_ERROR_PATTERN.test(error.message)) {
    return "network";
  }
  return "unknown";
}

async function fetchOnce<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new CachedFetchError(`Request failed: ${response.status}`, response.status);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchFresh<T>(url: string, init?: RequestInit): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) {
      await delay(FETCH_RETRY_DELAYS_MS[attempt]);
    }
    try {
      const data = await fetchOnce<T>(url, init);
      memoryCache.set(url, { data, fetchedAt: Date.now() });
      notifyCacheListeners(url, data);
      return data;
    } catch (error) {
      lastError = error;
      if (!isRetryableFetchError(error)) {
        throw error;
      }
    }
  }
  throw lastError;
}

function scheduleBackgroundRefresh<T>(url: string, init?: RequestInit) {
  if (backgroundRefreshes.has(url)) {
    return;
  }

  backgroundRefreshes.add(url);
  void fetchFresh<T>(url, init)
    .catch(() => undefined)
    .finally(() => {
      backgroundRefreshes.delete(url);
    });
}

export function peekCachedJson<T>(url: string): T | undefined {
  return memoryCache.get(url)?.data as T | undefined;
}

export function hasCachedJson(url: string): boolean {
  return memoryCache.has(url);
}

export function invalidateCachedUrl(url: string) {
  memoryCache.delete(url);
}

export async function fetchJsonCached<T>(
  url: string,
  {
    staleTimeMs = CACHE_STALE.products,
    force = false,
    ...init
  }: CachedFetchOptions & RequestInit = {},
): Promise<T> {
  if (force) {
    const inflight = inflightRequests.get(url);
    if (inflight) {
      return inflight as Promise<T>;
    }

    const promise = fetchFresh<T>(url, init);
    inflightRequests.set(url, promise);
    try {
      return await promise;
    } finally {
      inflightRequests.delete(url);
    }
  }

  const cached = memoryCache.get(url);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < staleTimeMs) {
    return cached.data as T;
  }

  if (cached) {
    scheduleBackgroundRefresh<T>(url, init);
    return cached.data as T;
  }

  const inflight = inflightRequests.get(url);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const promise = fetchFresh<T>(url, init);
  inflightRequests.set(url, promise);
  try {
    return await promise;
  } finally {
    inflightRequests.delete(url);
  }
}

export function buildCatalogProductsUrl({
  audience,
  category,
  section,
  placement,
  subcategory,
  storeId,
  flashEvent,
  maxAgeDays,
  limit,
  offset,
}: {
  audience?: string;
  category?: string;
  section?: string;
  placement?: string;
  subcategory?: string;
  storeId?: string;
  flashEvent?: string;
  maxAgeDays?: number;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (audience) {
    query.set("audience", audience);
  }
  if (category) {
    query.set("category", category);
  }
  if (section) {
    query.set("section", section);
  }
  if (placement) {
    query.set("placement", placement);
  }
  if (subcategory) {
    query.set("subcategory", subcategory);
  }
  if (storeId) {
    query.set("store_id", storeId);
  }
  if (flashEvent) {
    query.set("flash_event", flashEvent);
  }
  if (typeof maxAgeDays === "number") {
    query.set("max_age_days", String(maxAgeDays));
  }
  if (typeof limit === "number") {
    query.set("limit", String(limit));
  }
  if (typeof offset === "number" && offset > 0) {
    query.set("offset", String(offset));
  }

  const qs = query.toString();
  return `${API_BASE_URL}/catalog/products${qs ? `?${qs}` : ""}`;
}

export function buildDealProductsUrl({
  minDiscountPercent,
  campaignTag,
  limit,
  offset,
}: {
  minDiscountPercent?: number;
  campaignTag?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (typeof minDiscountPercent === "number" && minDiscountPercent > 0) {
    query.set("min_discount_percent", String(minDiscountPercent));
  }
  if (campaignTag) {
    query.set("campaign_tag", campaignTag);
  }
  if (typeof limit === "number") {
    query.set("limit", String(limit));
  }
  if (typeof offset === "number" && offset > 0) {
    query.set("offset", String(offset));
  }

  const qs = query.toString();
  return `${API_BASE_URL}/catalog/deal-products${qs ? `?${qs}` : ""}`;
}

export function buildCatalogStoresUrl({
  marketSlug,
  audience,
}: {
  marketSlug?: string;
  audience?: string;
}) {
  const query = new URLSearchParams();
  if (marketSlug) {
    query.set("market_slug", marketSlug);
  }
  if (audience) {
    query.set("audience", audience);
  }

  const qs = query.toString();
  return `${API_BASE_URL}/catalog/stores${qs ? `?${qs}` : ""}`;
}

export function productsStaleTimeMs({
  section,
  placement,
}: {
  section?: string;
  placement?: string;
}) {
  if (section === "flash-sale" || placement === "flash-sale") {
    return CACHE_STALE.productsFlash;
  }

  return CACHE_STALE.products;
}
