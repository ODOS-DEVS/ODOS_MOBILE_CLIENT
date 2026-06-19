import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import {
  type CatalogProductItem,
  mapProduct,
  type ProductApiItem,
} from "@/hooks/useCatalog";
import { buildCatalogProductsUrl, fetchJsonCached } from "@/utils/fetchCache";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";

export type RecommendationFeed = {
  title: string;
  subtitle?: string;
  personalized: boolean;
  products: CatalogProductItem[];
};

type RecommendationFeedApi = {
  title: string;
  subtitle?: string | null;
  personalized: boolean;
  products: ProductApiItem[];
};

async function getAccessToken(currentToken: string | null) {
  return currentToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
}

function mapFeed(payload: RecommendationFeedApi): RecommendationFeed {
  return {
    title: payload.title,
    subtitle: payload.subtitle ?? undefined,
    personalized: payload.personalized,
    products: payload.products.map(mapProduct),
  };
}

function dedupeProducts(products: CatalogProductItem[]) {
  const seen = new Set<string>();
  const next: CatalogProductItem[] = [];
  for (const product of products) {
    if (seen.has(product.id)) {
      continue;
    }
    seen.add(product.id);
    next.push(product);
  }
  return next;
}

async function loadCatalogFallback(limit: number) {
  const urls = [
    buildCatalogProductsUrl({ section: "recommendations", limit }),
    buildCatalogProductsUrl({ section: "popular", limit }),
  ];

  const batches = await Promise.all(
    urls.map(async (url) => {
      try {
        return (await fetchJsonCached<ProductApiItem[]>(url)).map(mapProduct);
      } catch {
        return [] as CatalogProductItem[];
      }
    }),
  );

  return dedupeProducts(batches.flat()).slice(0, limit);
}

export function useForYouRecommendations({ limit = 12 }: { limit?: number } = {}) {
  const { accessToken } = useAuth();
  const [feed, setFeed] = useState<RecommendationFeed>({
    title: "For you",
    subtitle: undefined,
    personalized: false,
    products: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!hasLoadedOnceRef.current) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const token = await getAccessToken(accessToken);
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/recommendations/for-you?limit=${encodeURIComponent(String(limit))}`,
        { headers },
      );

      if (!response.ok) {
        throw new Error("We couldn't load your recommendations.");
      }

      const nextFeed = mapFeed((await response.json()) as RecommendationFeedApi);
      if (nextFeed.products.length === 0) {
        const fallbackProducts = await loadCatalogFallback(limit);
        setFeed({
          title: fallbackProducts.length > 0 ? "Popular on ODOS" : nextFeed.title,
          subtitle:
            fallbackProducts.length > 0
              ? "Hand-picked marketplace favorites while we learn your taste"
              : nextFeed.subtitle,
          personalized: false,
          products: fallbackProducts,
        });
      } else {
        setFeed(nextFeed);
      }
      hasLoadedOnceRef.current = true;
    } catch (loadError) {
      const fallbackProducts = await loadCatalogFallback(limit);
      if (fallbackProducts.length > 0) {
        setFeed({
          title: "Popular on ODOS",
          subtitle: "Live catalog picks while recommendations refresh",
          personalized: false,
          products: fallbackProducts,
        });
        setError(null);
        hasLoadedOnceRef.current = true;
      } else {
        setError(loadError instanceof Error ? loadError.message : "We couldn't load recommendations.");
        setFeed({
          title: "Popular on ODOS",
          subtitle: undefined,
          personalized: false,
          products: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    feed,
    products: feed.products,
    isLoading,
    error,
    refresh,
  };
}

export function useSimilarProducts({
  productId,
  limit = 8,
}: {
  productId?: string;
  limit?: number;
}) {
  const { accessToken } = useAuth();
  const [feed, setFeed] = useState<RecommendationFeed>({
    title: "More like this",
    subtitle: undefined,
    personalized: false,
    products: [],
  });
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!productId) {
      setFeed({
        title: "More like this",
        products: [],
        personalized: false,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessToken(accessToken);
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/recommendations/similar/${encodeURIComponent(productId)}?limit=${encodeURIComponent(String(limit))}`,
        { headers },
      );

      if (!response.ok) {
        throw new Error("We couldn't load similar products.");
      }

      setFeed(mapFeed((await response.json()) as RecommendationFeedApi));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "We couldn't load similar products.");
      setFeed({
        title: "More like this",
        products: [],
        personalized: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, limit, productId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    feed,
    products: feed.products,
    isLoading,
    error,
    refresh,
  };
}
