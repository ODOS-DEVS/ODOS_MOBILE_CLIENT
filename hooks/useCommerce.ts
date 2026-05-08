import { API_BASE_URL } from "@/constants/auth";
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

export function useMarkets(fallback: MarketItem[] = []) {
  const [markets, setMarkets] = useState<MarketItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const loadMarkets = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
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
          setMarkets((current) =>
            areMarketsEqual(current, fallbackRef.current) ? current : fallbackRef.current,
          );
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

  return { markets, isLoading };
}

export function useStores({
  marketSlug,
  audience,
  fallback = [],
}: {
  marketSlug?: string;
  audience?: string;
  fallback?: StoreItem[];
}) {
  const [stores, setStores] = useState<StoreItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const loadStores = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
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
          setStores((current) =>
            areStoresEqual(current, fallbackRef.current) ? current : fallbackRef.current,
          );
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

  useLiveRefresh(() => loadStores({ background: true }));

  return { stores, isLoading };
}

export function useStore({
  storeId,
  fallback,
}: {
  storeId?: string;
  fallback: StoreItem;
}) {
  const [store, setStore] = useState<StoreItem>(fallback);
  const [isLoading, setIsLoading] = useState(Boolean(storeId));
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
          isSameStore(current, nextStore) ? current : nextStore,
        );
      } catch {
        if (isMountedRef.current && !background) {
          setStore((current) =>
            isSameStore(current, fallback) ? current : fallback,
          );
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [fallback, storeId],
  );

  useEffect(() => {
    setStore(fallback);
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

  useLiveRefresh(() => loadStore({ background: true }), {
    enabled: Boolean(storeId),
  });

  return { store, isLoading };
}

export function useMarketLookup(markets: MarketItem[]) {
  return useMemo(() => {
    return new Map(markets.map((market) => [market.title.toLowerCase(), market.slug]));
  }, [markets]);
}
