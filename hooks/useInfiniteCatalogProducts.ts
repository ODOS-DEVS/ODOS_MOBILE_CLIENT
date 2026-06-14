import type { CatalogProductItem } from "@/hooks/useCatalog";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import {
  buildCatalogProductsUrl,
  fetchJsonCached,
  productsStaleTimeMs,
} from "@/utils/fetchCache";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const CATALOG_PAGE_SIZE = 20;

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

function appendUniqueProducts(
  current: CatalogProductItem[],
  incoming: CatalogProductItem[],
) {
  if (incoming.length === 0) {
    return current;
  }

  const seen = new Set(current.map((item) => item.id));
  const next = [...current];

  incoming.forEach((item) => {
    if (!item.id || seen.has(item.id)) {
      return;
    }
    seen.add(item.id);
    next.push(item);
  });

  return next;
}

export type InfiniteCatalogFilters = {
  audience?: string;
  category?: string;
  section?: string;
  placement?: string;
  flashEvent?: string;
  subcategory?: string;
  storeId?: string;
};

export function useInfiniteCatalogProducts({
  audience,
  category,
  section,
  placement,
  flashEvent,
  subcategory,
  storeId,
  pageSize = CATALOG_PAGE_SIZE,
  enabled = true,
}: InfiniteCatalogFilters & {
  pageSize?: number;
  enabled?: boolean;
}) {
  const filters = useMemo(
    () => ({
      audience,
      category,
      section,
      placement,
      flashEvent,
      subcategory,
      storeId,
    }),
    [audience, category, flashEvent, placement, section, storeId, subcategory],
  );

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const staleTimeMs = useMemo(
    () => productsStaleTimeMs({ section, placement }),
    [placement, section],
  );

  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);

  const fetchPage = useCallback(
    async ({ offset, append }: { offset: number; append: boolean }) => {
      const url = buildCatalogProductsUrl({
        ...filters,
        limit: pageSize,
        offset,
      });

      const payload = await fetchJsonCached<ProductApiItem[]>(url, {
        staleTimeMs,
        force: append,
      });
      const mapped = payload.map(mapProduct);

      if (!isMountedRef.current) {
        return mapped;
      }

      setProducts((current) => (append ? appendUniqueProducts(current, mapped) : mapped));
      const nextHasMore = mapped.length >= pageSize;
      hasMoreRef.current = nextHasMore;
      setHasMore(nextHasMore);
      offsetRef.current = offset + mapped.length;
      setError(null);

      return mapped;
    },
    [filters, pageSize, staleTimeMs],
  );

  const loadInitial = useCallback(async () => {
    if (!enabled || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    offsetRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    setIsLoading(true);
    setError(null);

    try {
      await fetchPage({ offset: 0, append: false });
    } catch {
      if (isMountedRef.current) {
        setProducts([]);
        setError("We couldn't load products right now.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [enabled, fetchPage]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      isFetchingRef.current ||
      isLoadingMore ||
      isLoading ||
      !hasMoreRef.current
    ) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      await fetchPage({ offset: offsetRef.current, append: true });
    } catch {
      if (isMountedRef.current) {
        setError("We couldn't load more products.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMore(false);
      }
      isFetchingRef.current = false;
    }
  }, [enabled, fetchPage, isLoading, isLoadingMore]);

  const refresh = useCallback(async () => {
    offsetRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setProducts([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasMore(false);
      setError(null);
      return;
    }

    void loadInitial();
  }, [enabled, filterKey, loadInitial]);

  useLiveRefresh(() => {
    if (enabled) {
      void refresh();
    }
  });

  return {
    products,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}
