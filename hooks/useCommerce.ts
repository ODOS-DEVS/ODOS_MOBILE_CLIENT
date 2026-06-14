import { API_BASE_URL } from "@/constants/auth";
import { useRealtime } from "@/context/RealtimeContext";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { resolveApiMediaUrl } from "@/utils/media";
import {
  buildCatalogStoresUrl,
  CACHE_STALE,
  fetchJsonCached,
  hasCachedJson,
  invalidateCachedUrl,
  peekCachedJson,
  subscribeCacheUpdates,
} from "@/utils/fetchCache";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MarketItem = {
  id: string;
  slug: string;
  title: string;
  image: any;
};

export type StoreItem = {
  id: string;
  slug: string;
  title: string;
  status?: string;
  category?: string;
  audienceSlugs?: string[];
  marketSlug?: string;
  imageKey?: string;
  imageUrl?: string;
  imageBannerKey?: string;
  imageBannerUrl?: string;
  image: any;
  imageBanner?: any;
  rating?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  city?: string;
  region?: string;
  distanceKm?: string;
  travelMinutes?: string;
  description?: string;
};

type MarketApiItem = {
  id: string;
  slug: string;
  title: string;
  image_key: string;
  image_url?: string | null;
};

type StoreApiItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  category: string | null;
  audience_slugs?: string[] | null;
  market_slug: string | null;
  image_key: string;
  image_url?: string | null;
  image_banner_key: string | null;
  image_banner_url?: string | null;
  rating: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  whatsapp_url: string | null;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  region: string | null;
  distance_km: string | null;
  travel_minutes: string | null;
  description: string | null;
};

type CatalogStoreChangedEvent = {
  store_id?: string;
};

function mapMarket(item: MarketApiItem): MarketItem {
  const imageUrl = resolveApiMediaUrl(item.image_url);
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    image: imageUrl ? { uri: imageUrl } : null,
  };
}

function mapStore(item: StoreApiItem): StoreItem {
  const primaryStoreImageUrl = item.image_url ?? item.image_banner_url ?? null;
  const resolvedPrimaryImageUrl = resolveApiMediaUrl(primaryStoreImageUrl);
  const resolvedBannerImageUrl = resolveApiMediaUrl(item.image_banner_url ?? item.image_url);
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    category: item.category ?? undefined,
    audienceSlugs: item.audience_slugs ?? undefined,
    marketSlug: item.market_slug ?? undefined,
    imageKey: item.image_key || item.image_banner_key || undefined,
    imageUrl: resolvedPrimaryImageUrl,
    imageBannerKey: item.image_banner_key ?? undefined,
    imageBannerUrl: resolvedBannerImageUrl,
    image: resolvedPrimaryImageUrl ? { uri: resolvedPrimaryImageUrl } : null,
    imageBanner: resolvedBannerImageUrl ? { uri: resolvedBannerImageUrl } : null,
    rating: item.rating ?? undefined,
    address: item.address ?? undefined,
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
    instagramUrl: item.instagram_url ?? undefined,
    facebookUrl: item.facebook_url ?? undefined,
    tiktokUrl: item.tiktok_url ?? undefined,
    twitterUrl: item.twitter_url ?? undefined,
    whatsappUrl: item.whatsapp_url ?? undefined,
    websiteUrl: item.website_url ?? undefined,
    phone: item.phone ?? undefined,
    email: item.email ?? undefined,
    city: item.city ?? undefined,
    region: item.region ?? undefined,
    distanceKm: item.distance_km ?? undefined,
    travelMinutes: item.travel_minutes ?? undefined,
    description: item.description ?? undefined,
  };
}

function areStringArraysEqual(a: string[] = [], b: string[] = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function isSameMarket(a: MarketItem, b: MarketItem) {
  return a.id === b.id && a.slug === b.slug && a.title === b.title;
}

function areMarketsEqual(current: MarketItem[], next: MarketItem[]) {
  return (
    current.length === next.length &&
    current.every((item, index) => isSameMarket(item, next[index]))
  );
}

function isSameStore(a: StoreItem, b: StoreItem) {
  return (
    a.id === b.id &&
    a.slug === b.slug &&
    a.title === b.title &&
    a.status === b.status &&
    a.category === b.category &&
    areStringArraysEqual(a.audienceSlugs, b.audienceSlugs) &&
    a.marketSlug === b.marketSlug &&
    a.imageKey === b.imageKey &&
    a.imageUrl === b.imageUrl &&
    a.imageBannerKey === b.imageBannerKey &&
    a.imageBannerUrl === b.imageBannerUrl &&
    a.rating === b.rating &&
    a.address === b.address &&
    a.phone === b.phone &&
    a.email === b.email &&
    a.city === b.city &&
    a.distanceKm === b.distanceKm &&
    a.travelMinutes === b.travelMinutes &&
    a.description === b.description
  );
}

function areStoresEqual(current: StoreItem[], next: StoreItem[]) {
  return (
    current.length === next.length &&
    current.every((item, index) => isSameStore(item, next[index]))
  );
}

export function useMarkets() {
  const marketsUrl = `${API_BASE_URL}/catalog/markets`;
  const { subscribe } = useRealtime();
  const [markets, setMarkets] = useState<MarketItem[]>(() => {
    const cached = peekCachedJson<MarketApiItem[]>(marketsUrl);
    return cached ? cached.map(mapMarket) : [];
  });
  const [isLoading, setIsLoading] = useState(() => !hasCachedJson(marketsUrl));
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadMarkets = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background && !hasCachedJson(marketsUrl)) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const payload = await fetchJsonCached<MarketApiItem[]>(marketsUrl, {
          staleTimeMs: CACHE_STALE.markets,
          force: background,
        });
        if (!isMountedRef.current) {
          return;
        }

        const nextMarkets = payload.map(mapMarket);
        setMarkets((current) =>
          areMarketsEqual(current, nextMarkets) ? current : nextMarkets,
        );
      } catch {
        if (isMountedRef.current && !background && !hasCachedJson(marketsUrl)) {
          setError("We couldn't load markets right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [marketsUrl],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadMarkets();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadMarkets]);

  useLiveRefresh(() => loadMarkets({ background: true }));

  useEffect(() => {
    return subscribeCacheUpdates((url, data) => {
      if (url !== marketsUrl) {
        return;
      }

      const nextMarkets = (data as MarketApiItem[]).map(mapMarket);
      setMarkets((current) =>
        areMarketsEqual(current, nextMarkets) ? current : nextMarkets,
      );
      setIsLoading(false);
      setError(null);
    });
  }, [marketsUrl]);

  useEffect(() => {
    return subscribe("catalog.market.changed", () => {
      invalidateCachedUrl(marketsUrl);
      void loadMarkets({ background: true });
    });
  }, [loadMarkets, marketsUrl, subscribe]);

  return { markets, isLoading, error, refresh: loadMarkets };
}

export function useStores({
  marketSlug,
  audience,
}: {
  marketSlug?: string;
  audience?: string;
}) {
  const storesUrl = useMemo(
    () => buildCatalogStoresUrl({ marketSlug, audience }),
    [audience, marketSlug],
  );
  const [stores, setStores] = useState<StoreItem[]>(() => {
    const cached = peekCachedJson<StoreApiItem[]>(storesUrl);
    return cached ? cached.map(mapStore) : [];
  });
  const [isLoading, setIsLoading] = useState(() => !hasCachedJson(storesUrl));
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useRealtime();
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const cached = peekCachedJson<StoreApiItem[]>(storesUrl);
    setStores(cached ? cached.map(mapStore) : []);
    setIsLoading(!cached);
    setError(null);
  }, [storesUrl]);

  const loadStores = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background && !hasCachedJson(storesUrl)) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const payload = await fetchJsonCached<StoreApiItem[]>(storesUrl, {
          staleTimeMs: CACHE_STALE.stores,
          force: background,
        });
        if (!isMountedRef.current) {
          return;
        }

        const nextStores = payload.map(mapStore);
        setStores((current) =>
          areStoresEqual(current, nextStores) ? current : nextStores,
        );
      } catch {
        if (isMountedRef.current && !background && !hasCachedJson(storesUrl)) {
          setError("We couldn't load stores right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [storesUrl],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadStores();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadStores]);

  useEffect(() => {
    return subscribeCacheUpdates((url, data) => {
      if (url !== storesUrl) {
        return;
      }

      const nextStores = (data as StoreApiItem[]).map(mapStore);
      setStores((current) =>
        areStoresEqual(current, nextStores) ? current : nextStores,
      );
      setIsLoading(false);
      setError(null);
    });
  }, [storesUrl]);

  useEffect(() => {
    return subscribe("catalog.store.changed", () => {
      invalidateCachedUrl(storesUrl);
      void loadStores({ background: true });
    });
  }, [loadStores, storesUrl, subscribe]);

  return { stores, isLoading, error, refresh: loadStores };
}

export function useStore({
  storeId,
  fallback,
}: {
  storeId?: string;
  fallback?: StoreItem | null;
}) {
  const storeUrl = storeId
    ? `${API_BASE_URL}/catalog/stores/${encodeURIComponent(storeId)}`
    : "";
  const [store, setStore] = useState<StoreItem | null>(() => {
    if (!storeUrl) {
      return fallback ?? null;
    }

    const cached = peekCachedJson<StoreApiItem>(storeUrl);
    return cached ? mapStore(cached) : fallback ?? null;
  });
  const [isLoading, setIsLoading] = useState(
    () => Boolean(storeId) && !hasCachedJson(storeUrl),
  );
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useRealtime();
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadStore = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (!storeId || !storeUrl || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background && !hasCachedJson(storeUrl)) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const payload = await fetchJsonCached<StoreApiItem>(storeUrl, {
          staleTimeMs: CACHE_STALE.detail,
          force: background,
        });
        if (!isMountedRef.current) {
          return;
        }

        const nextStore = mapStore(payload);
        setStore((current) =>
          current && isSameStore(current, nextStore) ? current : nextStore,
        );
      } catch {
        if (isMountedRef.current && !background && !hasCachedJson(storeUrl)) {
          setError("We couldn't load this store right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [storeId, storeUrl],
  );

  useEffect(() => {
    setStore(fallback ?? null);
  }, [fallback]);

  useEffect(() => {
    return subscribeCacheUpdates((url, data) => {
      if (!storeUrl || url !== storeUrl) {
        return;
      }

      const nextStore = mapStore(data as StoreApiItem);
      setStore((current) =>
        current && isSameStore(current, nextStore) ? current : nextStore,
      );
      setIsLoading(false);
      setError(null);
    });
  }, [storeUrl]);

  useEffect(() => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    isMountedRef.current = true;
    void loadStore();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadStore, storeId]);

  useEffect(() => {
    if (!storeId) {
      return;
    }

    return subscribe("catalog.store.changed", (event) => {
      const payload = event.payload as CatalogStoreChangedEvent | undefined;
      if (!payload?.store_id || payload.store_id !== storeId) {
        return;
      }

      invalidateCachedUrl(storeUrl);
      void loadStore({ background: true });
    });
  }, [loadStore, storeId, storeUrl, subscribe]);

  return { store, isLoading, error, refresh: loadStore };
}

export function useMarketLookup(markets: MarketItem[]) {
  return useMemo(() => {
    return new Map(markets.map((market) => [market.title.toLowerCase(), market.slug]));
  }, [markets]);
}
