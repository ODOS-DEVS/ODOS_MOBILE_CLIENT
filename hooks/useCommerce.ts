import { API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import { useEffect, useMemo, useState } from "react";

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
  marketSlug?: string;
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
};

type StoreApiItem = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  market_slug: string | null;
  image_key: string;
  image_banner_key: string | null;
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
    image: resolveCatalogImage(item.image_key),
  };
}

function mapStore(item: StoreApiItem): StoreItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category ?? undefined,
    marketSlug: item.market_slug ?? undefined,
    image: resolveCatalogImage(item.image_key),
    imageBanner: resolveCatalogImage(item.image_banner_key ?? item.image_key),
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

export function useMarkets(fallback: MarketItem[] = []) {
  const [markets, setMarkets] = useState<MarketItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMarkets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/catalog/markets`);
        if (!response.ok) {
          throw new Error("Failed to load markets.");
        }
        const payload = (await response.json()) as MarketApiItem[];
        if (!isMounted) return;
        setMarkets(payload.map(mapMarket));
      } catch {
        if (isMounted) {
          setMarkets(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMarkets();

    return () => {
      isMounted = false;
    };
  }, [fallback]);

  return { markets, isLoading };
}

export function useStores({
  marketSlug,
  fallback = [],
}: {
  marketSlug?: string;
  fallback?: StoreItem[];
}) {
  const [stores, setStores] = useState<StoreItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStores = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (marketSlug) {
          query.set("market_slug", marketSlug);
        }
        const response = await fetch(
          `${API_BASE_URL}/catalog/stores${query.toString() ? `?${query.toString()}` : ""}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load stores.");
        }
        const payload = (await response.json()) as StoreApiItem[];
        if (!isMounted) return;
        setStores(payload.map(mapStore));
      } catch {
        if (isMounted) {
          setStores(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStores();

    return () => {
      isMounted = false;
    };
  }, [fallback, marketSlug]);

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

  useEffect(() => {
    setStore(fallback);
  }, [fallback]);

  useEffect(() => {
    if (!storeId) {
      return;
    }

    let isMounted = true;

    const loadStore = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/catalog/stores/${encodeURIComponent(storeId)}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load store.");
        }
        const payload = (await response.json()) as StoreApiItem;
        if (!isMounted) return;
        setStore(mapStore(payload));
      } catch {
        if (isMounted) {
          setStore(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [fallback, storeId]);

  return { store, isLoading };
}

export function useMarketLookup(markets: MarketItem[]) {
  return useMemo(() => {
    return new Map(markets.map((market) => [market.title.toLowerCase(), market.slug]));
  }, [markets]);
}
