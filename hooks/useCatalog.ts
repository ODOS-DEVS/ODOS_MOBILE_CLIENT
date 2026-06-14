import type { ProductCardProps } from "@/components/cards/ProductCard";
import { API_BASE_URL } from "@/constants/auth";
import { useRealtime } from "@/context/RealtimeContext";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
import {
  buildCatalogProductsUrl,
  CACHE_STALE,
  fetchJsonCached,
  hasCachedJson,
  invalidateCachedUrl,
  peekCachedJson,
  productsStaleTimeMs,
  subscribeCacheUpdates,
} from "@/utils/fetchCache";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CatalogCategoryItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: any;
  imageKey?: string;
  imageUrl?: string;
  subcategories?: string[];
};

export type CatalogProductItem = ProductCardProps & {
  description?: string;
  imageKey?: string;
  imageUrl?: string;
  imageUrls?: string[];
  audienceSlug?: string;
  section?: string;
  placementTags?: string[];
  subcategory?: string;
  categorySlugs?: string[];
  subcategorySlugs?: string[];
  colorOptions?: string[];
  sizeOptions?: string[];
  specifications?: string[];
  storeId?: string;
  stock?: number;
  status?: string;
  flashSaleEndsAt?: string;
  flashSaleEventSlug?: string;
  flashSaleEventTitle?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryApiItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image_key: string;
  image_url?: string | null;
  subcategories?: string[] | null;
};

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

type CatalogProductChangedEvent = {
  product_id?: string;
};

function mapCategory(item: CategoryApiItem): CatalogCategoryItem {
  const imageUrl = resolveApiMediaUrl(item.image_url);
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    imageKey: item.image_key,
    imageUrl,
    subcategories: item.subcategories ?? undefined,
    image: resolveImageSource(item.image_url, item.image_key),
  };
}

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

function isSameCategory(a: CatalogCategoryItem, b: CatalogCategoryItem) {
  return (
    a.id === b.id &&
    a.slug === b.slug &&
    a.title === b.title &&
    a.subtitle === b.subtitle &&
    a.imageKey === b.imageKey &&
    a.imageUrl === b.imageUrl &&
    areStringArraysEqual(a.subcategories, b.subcategories)
  );
}

function areStringArraysEqual(a: string[] = [], b: string[] = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function areCategoriesEqual(
  current: CatalogCategoryItem[],
  next: CatalogCategoryItem[],
) {
  return (
    current.length === next.length &&
    current.every((item, index) => isSameCategory(item, next[index]))
  );
}

function buildFallbackProduct(product: Partial<CatalogProductItem> & { id: string }): CatalogProductItem {
  return {
    id: product.id,
    title: product.title ?? "Product",
    description: product.description ?? undefined,
    category: product.category ?? undefined,
    price: product.price ?? 0,
    oldPrice: product.oldPrice ?? undefined,
    discount: product.discount ?? undefined,
    rating: product.rating ?? undefined,
    reviews: product.reviews ?? undefined,
    imageKey: product.imageKey ?? undefined,
    imageUrl: product.imageUrl ?? undefined,
    imageUrls: product.imageUrls ?? undefined,
    audienceSlug: product.audienceSlug ?? undefined,
    section: product.section ?? undefined,
    placementTags: product.placementTags ?? undefined,
    subcategory: product.subcategory ?? undefined,
    categorySlugs: product.categorySlugs ?? undefined,
    subcategorySlugs: product.subcategorySlugs ?? undefined,
    colorOptions: product.colorOptions ?? undefined,
    sizeOptions: product.sizeOptions ?? undefined,
    specifications: product.specifications ?? undefined,
    storeId: product.storeId ?? undefined,
    stock: product.stock ?? undefined,
    status: product.status ?? undefined,
    createdAt: product.createdAt ?? undefined,
    updatedAt: product.updatedAt ?? undefined,
    image:
      product.image ?? resolveImageSource(product.imageUrl, product.imageKey),
  };
}

function isSameProduct(a: CatalogProductItem, b: CatalogProductItem) {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.description === b.description &&
    a.category === b.category &&
    a.price === b.price &&
    a.oldPrice === b.oldPrice &&
    a.discount === b.discount &&
    a.rating === b.rating &&
    a.reviews === b.reviews &&
    a.imageKey === b.imageKey &&
    a.imageUrl === b.imageUrl &&
    areStringArraysEqual(a.imageUrls, b.imageUrls) &&
    a.audienceSlug === b.audienceSlug &&
    a.section === b.section &&
    areStringArraysEqual(a.placementTags, b.placementTags) &&
    a.subcategory === b.subcategory &&
    areStringArraysEqual(a.categorySlugs, b.categorySlugs) &&
    areStringArraysEqual(a.subcategorySlugs, b.subcategorySlugs) &&
    areStringArraysEqual(a.colorOptions, b.colorOptions) &&
    areStringArraysEqual(a.sizeOptions, b.sizeOptions) &&
    areStringArraysEqual(a.specifications, b.specifications) &&
    a.storeId === b.storeId &&
    a.stock === b.stock &&
    a.status === b.status &&
    a.createdAt === b.createdAt &&
    a.updatedAt === b.updatedAt
  );
}

function areProductsEqual(current: CatalogProductItem[], next: CatalogProductItem[]) {
  return (
    current.length === next.length &&
    current.every((item, index) => isSameProduct(item, next[index]))
  );
}

function parseReviewCount(reviews?: string | number) {
  if (typeof reviews === "number" && Number.isFinite(reviews)) {
    return reviews;
  }

  const parsed = Number(reviews);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCatalogTimestamp(product: CatalogProductItem) {
  const rawValue = product.updatedAt ?? product.createdAt;
  if (!rawValue) {
    return 0;
  }

  const parsed = new Date(rawValue).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function mergeUniqueProducts(...sources: CatalogProductItem[][]) {
  const seen = new Set<string>();
  const merged: CatalogProductItem[] = [];

  sources.forEach((items) => {
    items.forEach((item) => {
      if (!item?.id || seen.has(item.id)) {
        return;
      }

      seen.add(item.id);
      merged.push(item);
    });
  });

  return merged;
}

function getRecommendationScore(
  product: CatalogProductItem,
  highlightedIds: Set<string>,
  popularIds: Set<string>,
  latestTimestamp: number,
) {
  const ratingScore = (product.rating ?? 0) * 16;
  const reviewScore = Math.min(parseReviewCount(product.reviews), 200) * 0.18;
  const hasDiscount =
    Boolean(product.discount?.trim()) ||
    (typeof product.oldPrice === "number" &&
      typeof product.price === "number" &&
      product.oldPrice > product.price);
  const freshnessTimestamp = getCatalogTimestamp(product);
  const freshnessWindow =
    latestTimestamp > 0
      ? Math.max(0, 1 - (latestTimestamp - freshnessTimestamp) / (1000 * 60 * 60 * 24 * 30))
      : 0;

  let score = 0;

  if (highlightedIds.has(product.id)) {
    score += 220;
  }

  if (popularIds.has(product.id)) {
    score += 90;
  }

  if (product.section === "recommendations") {
    score += 140;
  }

  if (product.section === "popular") {
    score += 48;
  }

  if (product.placementTags?.some((tag) => tag.includes("recommend"))) {
    score += 60;
  }

  if (hasDiscount) {
    score += 35;
  }

  if ((product.stock ?? 1) > 0) {
    score += 18;
  }

  score += ratingScore;
  score += reviewScore;
  score += freshnessWindow * 40;

  return score;
}

function curateRecommendedProducts({
  highlighted,
  popular,
  allProducts,
  limit,
}: {
  highlighted: CatalogProductItem[];
  popular: CatalogProductItem[];
  allProducts: CatalogProductItem[];
  limit: number;
}) {
  const pool = mergeUniqueProducts(highlighted, popular, allProducts).filter(
    (product) => Boolean(product?.id && product?.title && product?.image),
  );

  if (pool.length === 0) {
    return [];
  }

  const highlightedIds = new Set(highlighted.map((item) => item.id));
  const popularIds = new Set(popular.map((item) => item.id));
  const latestTimestamp = pool.reduce(
    (current, item) => Math.max(current, getCatalogTimestamp(item)),
    0,
  );

  return [...pool]
    .sort((left, right) => {
      const rightScore = getRecommendationScore(
        right,
        highlightedIds,
        popularIds,
        latestTimestamp,
      );
      const leftScore = getRecommendationScore(
        left,
        highlightedIds,
        popularIds,
        latestTimestamp,
      );

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return getCatalogTimestamp(right) - getCatalogTimestamp(left);
    })
    .slice(0, Math.max(limit, 1));
}

export function useCatalogCategories() {
  const categoriesUrl = `${API_BASE_URL}/catalog/categories`;
  const { subscribe } = useRealtime();
  const [categories, setCategories] = useState<CatalogCategoryItem[]>(() => {
    const cached = peekCachedJson<CategoryApiItem[]>(categoriesUrl);
    return cached ? cached.map(mapCategory) : [];
  });
  const [isLoading, setIsLoading] = useState(() => !hasCachedJson(categoriesUrl));
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadCategories = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background && !hasCachedJson(categoriesUrl)) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const payload = await fetchJsonCached<CategoryApiItem[]>(categoriesUrl, {
          staleTimeMs: CACHE_STALE.categories,
          force: background,
        });
        if (!isMountedRef.current) {
          return;
        }

        const nextCategories = payload.map(mapCategory);
        setCategories((current) =>
          areCategoriesEqual(current, nextCategories) ? current : nextCategories,
        );
        if (isMountedRef.current && !background) {
          setError(null);
        }
      } catch {
        if (isMountedRef.current && !background && !hasCachedJson(categoriesUrl)) {
          setError("We couldn't load categories right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [categoriesUrl],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadCategories();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadCategories]);

  useLiveRefresh(() => loadCategories({ background: true }));

  useEffect(() => {
    return subscribeCacheUpdates((url, data) => {
      if (url !== categoriesUrl) {
        return;
      }

      const nextCategories = (data as CategoryApiItem[]).map(mapCategory);
      setCategories((current) =>
        areCategoriesEqual(current, nextCategories) ? current : nextCategories,
      );
      setIsLoading(false);
      setError(null);
    });
  }, [categoriesUrl]);

  useEffect(() => {
    return subscribe("catalog.category.changed", () => {
      invalidateCachedUrl(categoriesUrl);
      void loadCategories({ background: true });
    });
  }, [categoriesUrl, loadCategories, subscribe]);

  return { categories, isLoading, error, refresh: loadCategories };
}

export function useCatalogProducts({
  audience,
  category,
  section,
  placement,
  flashEvent,
  subcategory,
  storeId,
}: {
  audience?: string;
  category?: string;
  section?: string;
  placement?: string;
  flashEvent?: string;
  subcategory?: string;
  storeId?: string;
}) {
  const productsUrl = useMemo(
    () =>
      buildCatalogProductsUrl({
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
  const staleTimeMs = useMemo(
    () => productsStaleTimeMs({ section, placement }),
    [placement, section],
  );
  const [products, setProducts] = useState<CatalogProductItem[]>(() => {
    const cached = peekCachedJson<ProductApiItem[]>(productsUrl);
    return cached ? cached.map(mapProduct) : [];
  });
  const [isLoading, setIsLoading] = useState(() => !hasCachedJson(productsUrl));
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useRealtime();
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const cached = peekCachedJson<ProductApiItem[]>(productsUrl);
    setProducts(cached ? cached.map(mapProduct) : []);
    setIsLoading(!cached);
    setError(null);
  }, [productsUrl]);

  const loadProducts = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background && !hasCachedJson(productsUrl)) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const payload = await fetchJsonCached<ProductApiItem[]>(productsUrl, {
          staleTimeMs,
          force: background,
        });
        if (!isMountedRef.current) {
          return;
        }

        const nextProducts = payload.map(mapProduct);
        setProducts((current) =>
          areProductsEqual(current, nextProducts) ? current : nextProducts,
        );
        if (isMountedRef.current && !background) {
          setError(null);
        }
      } catch {
        if (isMountedRef.current && !background && !hasCachedJson(productsUrl)) {
          setError("We couldn't load products right now.");
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [productsUrl, staleTimeMs],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadProducts();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadProducts]);

  useEffect(() => {
    return subscribeCacheUpdates((url, data) => {
      if (url !== productsUrl) {
        return;
      }

      const nextProducts = (data as ProductApiItem[]).map(mapProduct);
      setProducts((current) =>
        areProductsEqual(current, nextProducts) ? current : nextProducts,
      );
      setIsLoading(false);
      setError(null);
    });
  }, [productsUrl]);

  useEffect(() => {
    return subscribe("catalog.product.changed", () => {
      invalidateCachedUrl(productsUrl);
      void loadProducts({ background: true });
    });
  }, [loadProducts, productsUrl, subscribe]);

  const sortOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .flatMap((item) =>
            item.subcategorySlugs?.length
              ? item.subcategorySlugs
              : [item.subcategory],
          )
          .filter((value): value is string => Boolean(value?.trim())),
      ),
    );

    return ["All", ...uniqueCategories];
  }, [products]);

  return {
    products,
    isLoading,
    error,
    sortOptions,
    refresh: loadProducts,
  };
}

/** Loads products for a catalog category slug (matches slugs, titles, and department audiences). */
export function useCategoryBrowseProducts(slug?: string) {
  return useCatalogProducts({ category: slug });
}

export function useRecommendedProducts({
  limit = 8,
}: {
  limit?: number;
}) {
  const highlightedCatalog = useCatalogProducts({
    section: "recommendations",
  });
  const popularCatalog = useCatalogProducts({
    section: "popular",
  });
  const allCatalog = useCatalogProducts({
  });

  const products = useMemo(
    () =>
      curateRecommendedProducts({
        highlighted: highlightedCatalog.products,
        popular: popularCatalog.products,
        allProducts: allCatalog.products,
        limit,
      }),
    [
      allCatalog.products,
      highlightedCatalog.products,
      limit,
      popularCatalog.products,
    ],
  );

  const isLoading =
    products.length === 0 &&
    (highlightedCatalog.isLoading ||
      popularCatalog.isLoading ||
      allCatalog.isLoading);

  return {
    products,
    isLoading,
    error:
      highlightedCatalog.error ??
      popularCatalog.error ??
      allCatalog.error,
  };
}

export function useCatalogProduct({
  productId,
  fallback,
}: {
  productId?: string;
  fallback: Partial<CatalogProductItem> & { id: string };
}) {
  const fallbackProduct = useMemo(() => buildFallbackProduct(fallback), [fallback]);
  const productUrl = productId
    ? `${API_BASE_URL}/catalog/products/${encodeURIComponent(productId)}`
    : "";
  const [product, setProduct] = useState<CatalogProductItem>(() => {
    if (!productUrl) {
      return fallbackProduct;
    }

    const cached = peekCachedJson<ProductApiItem>(productUrl);
    return cached ? mapProduct(cached) : fallbackProduct;
  });
  const [isLoading, setIsLoading] = useState(
    () => Boolean(productId) && !hasCachedJson(productUrl),
  );
  const { subscribe } = useRealtime();
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadProduct = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (!productId || !productUrl || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background && !hasCachedJson(productUrl)) {
        setIsLoading(true);
      }

      try {
        const payload = await fetchJsonCached<ProductApiItem>(productUrl, {
          staleTimeMs: CACHE_STALE.detail,
          force: background,
        });
        if (!isMountedRef.current) {
          return;
        }

        const nextProduct = mapProduct(payload);
        setProduct((current) =>
          isSameProduct(current, nextProduct) ? current : nextProduct,
        );
      } catch {
        if (isMountedRef.current && !background && !hasCachedJson(productUrl)) {
          setProduct((current) =>
            isSameProduct(current, fallbackProduct) ? current : fallbackProduct,
          );
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [fallbackProduct, productId, productUrl],
  );

  useEffect(() => {
    setProduct((previous) =>
      isSameProduct(previous, fallbackProduct) ? previous : fallbackProduct,
    );
  }, [fallbackProduct]);

  useEffect(() => {
    return subscribeCacheUpdates((url, data) => {
      if (!productUrl || url !== productUrl) {
        return;
      }

      const nextProduct = mapProduct(data as ProductApiItem);
      setProduct((current) =>
        isSameProduct(current, nextProduct) ? current : nextProduct,
      );
      setIsLoading(false);
    });
  }, [productUrl]);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    isMountedRef.current = true;

    void loadProduct();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadProduct, productId]);

  useEffect(() => {
    if (!productId) {
      return;
    }

    return subscribe("catalog.product.changed", (event) => {
      const payload = event.payload as CatalogProductChangedEvent | undefined;
      if (!payload?.product_id || payload.product_id !== productId) {
        return;
      }

      invalidateCachedUrl(productUrl);
      void loadProduct({ background: true });
    });
  }, [loadProduct, productId, productUrl, subscribe]);

  return { product, isLoading };
}
