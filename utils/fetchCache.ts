import { API_BASE_URL } from "@/constants/auth";

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

async function fetchFresh<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = (await response.json()) as T;
  memoryCache.set(url, { data, fetchedAt: Date.now() });
  notifyCacheListeners(url, data);
  return data;
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
