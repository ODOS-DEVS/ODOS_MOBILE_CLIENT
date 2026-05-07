import type { ProductCardProps } from "@/components/cards/ProductCard";
import { API_BASE_URL } from "@/constants/auth";
import { resolveApiMediaUrl, resolveImageSource } from "@/utils/media";
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
};

function mapCategory(item: CategoryApiItem): CatalogCategoryItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    imageKey: item.image_key,
    imageUrl: resolveApiMediaUrl(item.image_url),
    subcategories: item.subcategories ?? undefined,
    image: resolveImageSource(item.image_url, item.image_key),
  };
}

function mapProduct(item: ProductApiItem): CatalogProductItem {
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
    imageUrl: resolveApiMediaUrl(item.image_url),
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
    image: product.image ?? resolveImageSource(product.imageUrl, product.imageKey),
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
    areStringArraysEqual(a.specifications, b.specifications)
  );
}

function areProductsEqual(current: CatalogProductItem[], next: CatalogProductItem[]) {
  return (
    current.length === next.length &&
    current.every((item, index) => isSameProduct(item, next[index]))
  );
}

export function useCatalogCategories(fallback: CatalogCategoryItem[] = []) {
  const [categories, setCategories] = useState<CatalogCategoryItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const loadCategories = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/catalog/categories`);
        if (!response.ok) {
          throw new Error("Failed to load categories.");
        }

        const payload = (await response.json()) as CategoryApiItem[];
        if (!isMountedRef.current) {
          return;
        }

        const nextCategories = payload.map(mapCategory);
        setCategories((current) =>
          areCategoriesEqual(current, nextCategories) ? current : nextCategories,
        );
      } catch {
        if (isMountedRef.current && !background) {
          setCategories((current) =>
            areCategoriesEqual(current, fallbackRef.current) ? current : fallbackRef.current,
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
    void loadCategories();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadCategories]);

  return { categories, isLoading };
}

export function useCatalogProducts({
  audience,
  category,
  section,
  placement,
  subcategory,
  storeId,
  fallback = [],
}: {
  audience?: string;
  category?: string;
  section?: string;
  placement?: string;
  subcategory?: string;
  storeId?: string;
  fallback?: CatalogProductItem[];
}) {
  const [products, setProducts] = useState<CatalogProductItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const loadProducts = useCallback(
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

        const response = await fetch(
          `${API_BASE_URL}/catalog/products${query.toString() ? `?${query.toString()}` : ""}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load products.");
        }

        const payload = (await response.json()) as ProductApiItem[];
        if (!isMountedRef.current) {
          return;
        }

        const nextProducts = payload.map(mapProduct);
        setProducts((current) =>
          areProductsEqual(current, nextProducts) ? current : nextProducts,
        );
      } catch {
        if (isMountedRef.current && !background) {
          setProducts((current) =>
            areProductsEqual(current, fallbackRef.current) ? current : fallbackRef.current,
          );
        }
      } finally {
        if (isMountedRef.current && !background) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [audience, category, placement, section, storeId, subcategory],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadProducts();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadProducts]);

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
    sortOptions,
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
  const [product, setProduct] = useState<CatalogProductItem>(fallbackProduct);
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadProduct = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (!productId || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!background) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/catalog/products/${encodeURIComponent(productId)}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load product.");
        }

        const payload = (await response.json()) as ProductApiItem;
        if (!isMountedRef.current) {
          return;
        }

        const nextProduct = mapProduct(payload);
        setProduct((current) =>
          isSameProduct(current, nextProduct) ? current : nextProduct,
        );
      } catch {
        if (isMountedRef.current && !background) {
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
    [fallbackProduct, productId],
  );

  useEffect(() => {
    setProduct((previous) =>
      isSameProduct(previous, fallbackProduct) ? previous : fallbackProduct,
    );
  }, [fallbackProduct]);

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

  return { product, isLoading };
}
