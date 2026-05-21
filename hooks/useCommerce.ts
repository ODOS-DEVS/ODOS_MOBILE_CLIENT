import { API_BASE_URL } from "@/constants/auth";
import { useRealtime } from "@/context/RealtimeContext";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
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
  phone?: string;
  email?: string;
  city?: string;
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
  phone: string | null;
  email: string | null;
  city: string | null;
  distance_km: string | null;
  travel_minutes: string | null;
  description: string | null;
};

type CatalogStoreChangedEvent = {
  store_id?: string;
};

function mapMarket(item: MarketApiItem): MarketItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    image: resolveImageSource(item.image_url, item.image_key),
  };
}

function mapStore(item: StoreApiItem): StoreItem {
  const primaryStoreImageUrl = item.image_url ?? item.image_banner_url ?? null;
  const primaryStoreImageKey = item.image_key || item.image_banner_key || "bag";
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    category: item.category ?? undefined,
    audienceSlugs: item.audience_slugs ?? undefined,
    marketSlug: item.market_slug ?? undefined,
    imageKey: primaryStoreImageKey,
    imageUrl: resolveApiMediaUrl(primaryStoreImageUrl),
    imageBannerKey: item.image_banner_key ?? undefined,
    imageBannerUrl: resolveApiMediaUrl(item.image_banner_url),
    image: resolveImageSource(primaryStoreImageUrl, primaryStoreImageKey),
    imageBanner: resolveImageSource(
      item.image_banner_url ?? item.image_url,
      item.image_banner_key ?? item.image_key,
    ),
    rating: item.rating ?? undefined,
    address: item.address ?? undefined,
    phone: item.phone ?? undefined,
    email: item.email ?? undefined,
    city: item.city ?? undefined,
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
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadMarkets = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/catalog/markets`);
        if (!response.ok) {
          throw new Error("Failed to load markets.");
        }
        const payload = (await response.json()) as MarketApiItem[];
        if (!isMountedRef.current) {
          return;
        }

        const nextMarkets = payload.map(mapMarket);
        setMarkets((current) =>
          areMarketsEqual(current, nextMarkets) ? current : nextMarkets,
        );
      } catch {
        if (isMountedRef.current && !background) {
          setError("We couldn't load markets right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadMarkets();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadMarkets]);

  useLiveRefresh(() => loadMarkets({ background: true }));

  return { markets, isLoading, error, refresh: loadMarkets };
}

export function useStores({
  marketSlug,
  audience,
}: {
  marketSlug?: string;
  audience?: string;
}) {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useRealtime();
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadStores = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const query = new URLSearchParams();
        if (marketSlug) {
          query.set("market_slug", marketSlug);
        }
        if (audience) {
          query.set("audience", audience);
        }
        const response = await fetch(
          `${API_BASE_URL}/catalog/stores${query.toString() ? `?${query.toString()}` : ""}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load stores.");
        }
        const payload = (await response.json()) as StoreApiItem[];
        if (!isMountedRef.current) {
          return;
        }

        const nextStores = payload.map(mapStore);
        setStores((current) =>
          areStoresEqual(current, nextStores) ? current : nextStores,
        );
      } catch {
        if (isMountedRef.current && !background) {
          setError("We couldn't load stores right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [audience, marketSlug],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadStores();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadStores]);

  useEffect(() => {
    return subscribe("catalog.store.changed", () => {
      void loadStores({ background: true });
    });
  }, [loadStores, subscribe]);

  return { stores, isLoading, error, refresh: loadStores };
}

export function useStore({
  storeId,
  fallback,
}: {
  storeId?: string;
  fallback?: StoreItem | null;
}) {
  const [store, setStore] = useState<StoreItem | null>(fallback ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(storeId));
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useRealtime();
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadStore = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (!storeId || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/catalog/stores/${encodeURIComponent(storeId)}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load store.");
        }
        const payload = (await response.json()) as StoreApiItem;
        if (!isMountedRef.current) {
          return;
        }

        const nextStore = mapStore(payload);
        setStore((current) =>
          current && isSameStore(current, nextStore) ? current : nextStore,
        );
      } catch {
        if (isMountedRef.current && !background) {
          setError("We couldn't load this store right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [storeId],
  );

  useEffect(() => {
    setStore(fallback ?? null);
  }, [fallback]);

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

      void loadStore({ background: true });
    });
  }, [loadStore, storeId, subscribe]);

  return { store, isLoading, error, refresh: loadStore };
}

export function useMarketLookup(markets: MarketItem[]) {
  return useMemo(() => {
    return new Map(markets.map((market) => [market.title.toLowerCase(), market.slug]));
  }, [markets]);
}
