import { API_BASE_URL } from "@/constants/auth";
import { mapProduct, type CatalogProductItem } from "@/hooks/useCatalog";
import { useCallback, useEffect, useRef, useState } from "react";

export type MerchandisingCampaignItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  bannerImageUrl?: string;
  thumbnailImageUrl?: string;
  iconKey?: string;
  themeColor?: string;
  isFeatured: boolean;
  startsAt?: string;
  endsAt?: string;
  displayPriority: number;
  productCount: number;
  secondsRemaining: number;
};

type CampaignApiItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  banner_image_url?: string | null;
  thumbnail_image_url?: string | null;
  icon_key?: string | null;
  theme_color?: string | null;
  is_featured?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  display_priority?: number;
  product_count?: number;
  seconds_remaining?: number;
  products?: Parameters<typeof mapProduct>[0][];
  has_more?: boolean;
};

function mapCampaign(item: CampaignApiItem): MerchandisingCampaignItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle ?? undefined,
    description: item.description ?? undefined,
    bannerImageUrl: item.banner_image_url ?? undefined,
    thumbnailImageUrl: item.thumbnail_image_url ?? undefined,
    iconKey: item.icon_key ?? undefined,
    themeColor: item.theme_color ?? undefined,
    isFeatured: Boolean(item.is_featured),
    startsAt: item.starts_at ?? undefined,
    endsAt: item.ends_at ?? undefined,
    displayPriority: item.display_priority ?? 0,
    productCount: item.product_count ?? 0,
    secondsRemaining: item.seconds_remaining ?? 0,
  };
}

export function useMerchandisingCampaigns(options?: { featuredOnly?: boolean }) {
  const featuredOnly = Boolean(options?.featuredOnly);
  const [campaigns, setCampaigns] = useState<MerchandisingCampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        featured: featuredOnly ? "true" : "false",
        limit: "40",
      });
      const response = await fetch(`${API_BASE_URL}/catalog/campaigns?${query}`);
      if (!response.ok) {
        throw new Error("Unable to load campaigns.");
      }
      const payload = (await response.json()) as CampaignApiItem[];
      setCampaigns(payload.map(mapCampaign));
    } catch (loadError) {
      setCampaigns([]);
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load campaigns.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [featuredOnly]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { campaigns, isLoading, error, refresh };
}

export function useMerchandisingCampaignDetail(slug: string) {
  const [campaign, setCampaign] = useState<MerchandisingCampaignItem | null>(null);
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(slug));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!slug.trim()) {
      setCampaign(null);
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    offsetRef.current = 0;

    try {
      const query = new URLSearchParams({ limit: "20", offset: "0" });
      const response = await fetch(
        `${API_BASE_URL}/catalog/campaigns/${encodeURIComponent(slug)}?${query}`,
      );
      if (!response.ok) {
        throw new Error("Unable to load this campaign.");
      }
      const payload = (await response.json()) as CampaignApiItem;
      const mappedProducts = (payload.products ?? []).map(mapProduct);
      setCampaign(mapCampaign(payload));
      setProducts(mappedProducts);
      setHasMore(Boolean(payload.has_more));
      offsetRef.current = mappedProducts.length;
    } catch (loadError) {
      setCampaign(null);
      setProducts([]);
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load this campaign.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const loadMore = useCallback(async () => {
    if (!slug.trim() || !hasMore || isLoadingMore || isLoading) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const query = new URLSearchParams({
        limit: "20",
        offset: String(offsetRef.current),
      });
      const response = await fetch(
        `${API_BASE_URL}/catalog/campaigns/${encodeURIComponent(slug)}?${query}`,
      );
      if (!response.ok) {
        throw new Error("Unable to load more products.");
      }
      const payload = (await response.json()) as CampaignApiItem;
      const mappedProducts = (payload.products ?? []).map(mapProduct);
      setProducts((current) => [...current, ...mappedProducts]);
      setHasMore(Boolean(payload.has_more));
      offsetRef.current += mappedProducts.length;
    } catch {
      // Keep existing products if pagination fails.
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    campaign,
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
