import type { CatalogProductItem } from "@/hooks/useCatalog";
import { API_BASE_URL } from "@/constants/auth";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import { buildDealProductsUrl } from "@/utils/fetchCache";
import { useCallback, useEffect, useState } from "react";

type ProductApiItem = {
  id: string;
  audience_slug: string | null;
  section: string | null;
  placement_tags?: string[] | null;
  title: string;
  description?: string | null;
  category: string | null;
  subcategory?: string | null;
  category_slugs?: string[] | null;
  subcategory_slugs?: string[] | null;
  price: number;
  old_price: number | null;
  discount: string | null;
  rating: number | null;
  reviews: string | null;
  image_key: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  color_options?: string[] | null;
  size_options?: string[] | null;
  specifications?: string[] | null;
  store_id?: string | null;
  stock?: number;
  status?: string;
  flash_sale_ends_at?: string | null;
  flash_sale_event_slug?: string | null;
  flash_sale_event_title?: string | null;
  created_at?: string;
  updated_at?: string;
};

function mapProduct(item: ProductApiItem): CatalogProductItem {
  const imageUrl = resolveApiMediaUrl(item.image_url);
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    category: item.category ?? undefined,
    price: item.price,
    oldPrice: item.old_price ?? undefined,
    discount: item.discount ?? undefined,
    rating: item.rating ?? undefined,
    reviews: item.reviews ?? undefined,
    imageKey: item.image_key,
    imageUrl,
    imageUrls: item.image_urls?.map((value) => resolveApiMediaUrl(value) ?? value) ?? undefined,
    audienceSlug: item.audience_slug ?? undefined,
    section: item.section ?? undefined,
    placementTags: item.placement_tags ?? undefined,
    subcategory: item.subcategory ?? undefined,
    categorySlugs: item.category_slugs ?? undefined,
    subcategorySlugs: item.subcategory_slugs ?? undefined,
    colorOptions: item.color_options ?? undefined,
    sizeOptions: item.size_options ?? undefined,
    specifications: item.specifications ?? undefined,
    storeId: item.store_id ?? undefined,
    stock: item.stock ?? undefined,
    status: item.status ?? undefined,
    flashSaleEndsAt: item.flash_sale_ends_at ?? undefined,
    flashSaleEventSlug: item.flash_sale_event_slug ?? undefined,
    flashSaleEventTitle: item.flash_sale_event_title ?? undefined,
    createdAt: item.created_at ?? undefined,
    updatedAt: item.updated_at ?? undefined,
    image: resolveImageSource(item.image_url, item.image_key),
  };
}

type UseDealProductsOptions = {
  minDiscountPercent?: number;
  campaignTag?: string;
  pageSize?: number;
};

export function useDealProducts({
  minDiscountPercent,
  campaignTag,
  pageSize = 24,
}: UseDealProductsOptions) {
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (offset: number, append: boolean) => {
      const url = buildDealProductsUrl({
        minDiscountPercent,
        campaignTag,
        limit: pageSize,
        offset,
      });

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("Unable to load discounted products right now.");
      }

      const payload = (await response.json()) as ProductApiItem[];
      const mapped = payload.map(mapProduct);
      setProducts((current) => (append ? [...current, ...mapped] : mapped));
      setHasMore(mapped.length >= pageSize);
    },
    [campaignTag, minDiscountPercent, pageSize],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadPage(0, false);
    } catch (loadError) {
      setProducts([]);
      setHasMore(false);
      setError(loadError instanceof Error ? loadError.message : "Unable to load deals.");
    } finally {
      setIsLoading(false);
    }
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await loadPage(products.length, true);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, loadPage, products.length]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}

export type CampaignTagOption = {
  tag: string;
  label: string;
};

export async function fetchCampaignTags(): Promise<CampaignTagOption[]> {
  const response = await fetch(`${API_BASE_URL}/catalog/campaign-tags`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as CampaignTagOption[];
}
