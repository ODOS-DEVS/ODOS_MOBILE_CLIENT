import type { ProductCardProps } from "@/components/cards/ProductCard";
import { API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import { useEffect, useMemo, useState } from "react";

export type CatalogCategoryItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: any;
  imageKey?: string;
};

export type CatalogProductItem = ProductCardProps & {
  imageKey?: string;
  audienceSlug?: string;
  section?: string;
};

type CategoryApiItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image_key: string;
};

type ProductApiItem = {
  id: string;
  audience_slug: string | null;
  section: string | null;
  title: string;
  category: string | null;
  price: number;
  old_price: number | null;
  discount: string | null;
  rating: number | null;
  reviews: string | null;
  image_key: string;
};

function mapCategory(item: CategoryApiItem): CatalogCategoryItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    imageKey: item.image_key,
    image: resolveCatalogImage(item.image_key),
  };
}

function mapProduct(item: ProductApiItem): CatalogProductItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category ?? undefined,
    price: item.price,
    oldPrice: item.old_price ?? undefined,
    discount: item.discount ?? undefined,
    rating: item.rating ?? undefined,
    reviews: item.reviews ?? undefined,
    imageKey: item.image_key,
    audienceSlug: item.audience_slug ?? undefined,
    section: item.section ?? undefined,
    image: resolveCatalogImage(item.image_key),
  };
}

function buildFallbackProduct(product: Partial<CatalogProductItem> & { id: string }): CatalogProductItem {
  return {
    id: product.id,
    title: product.title ?? "Product",
    category: product.category ?? undefined,
    price: product.price ?? 0,
    oldPrice: product.oldPrice ?? undefined,
    discount: product.discount ?? undefined,
    rating: product.rating ?? undefined,
    reviews: product.reviews ?? undefined,
    imageKey: product.imageKey ?? undefined,
    audienceSlug: product.audienceSlug ?? undefined,
    section: product.section ?? undefined,
    image: product.image ?? resolveCatalogImage(product.imageKey),
  };
}

function isSameProduct(a: CatalogProductItem, b: CatalogProductItem) {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.category === b.category &&
    a.price === b.price &&
    a.oldPrice === b.oldPrice &&
    a.discount === b.discount &&
    a.rating === b.rating &&
    a.reviews === b.reviews &&
    a.imageKey === b.imageKey &&
    a.audienceSlug === b.audienceSlug &&
    a.section === b.section &&
    a.image === b.image
  );
}

export function useCatalogCategories(fallback: CatalogCategoryItem[] = []) {
  const [categories, setCategories] = useState<CatalogCategoryItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/catalog/categories`);
        if (!response.ok) {
          throw new Error("Failed to load categories.");
        }

        const payload = (await response.json()) as CategoryApiItem[];
        if (!isMounted || payload.length === 0) {
          return;
        }

        setCategories(payload.map(mapCategory));
      } catch {
        if (isMounted) {
          setCategories(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [fallback]);

  return { categories, isLoading };
}

export function useCatalogProducts({
  audience,
  section,
  fallback = [],
}: {
  audience?: string;
  section?: string;
  fallback?: CatalogProductItem[];
}) {
  const [products, setProducts] = useState<CatalogProductItem[]>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);

      try {
        const query = new URLSearchParams();
        if (audience) {
          query.set("audience", audience);
        }
        if (section) {
          query.set("section", section);
        }

        const response = await fetch(
          `${API_BASE_URL}/catalog/products${query.toString() ? `?${query.toString()}` : ""}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load products.");
        }

        const payload = (await response.json()) as ProductApiItem[];
        if (!isMounted || payload.length === 0) {
          return;
        }

        setProducts(payload.map(mapProduct));
      } catch {
        if (isMounted) {
          setProducts(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [audience, fallback, section]);

  const sortOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((item) => item.category)
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
  const fallbackProduct = useMemo(
    () => buildFallbackProduct(fallback),
    [
      fallback.id,
      fallback.title,
      fallback.category,
      fallback.price,
      fallback.oldPrice,
      fallback.discount,
      fallback.rating,
      fallback.reviews,
      fallback.imageKey,
      fallback.audienceSlug,
      fallback.section,
      fallback.image,
    ],
  );
  const [product, setProduct] = useState<CatalogProductItem>(fallbackProduct);
  const [isLoading, setIsLoading] = useState(Boolean(productId));

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

    let isMounted = true;

    const loadProduct = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/catalog/products/${encodeURIComponent(productId)}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load product.");
        }

        const payload = (await response.json()) as ProductApiItem;
        if (!isMounted) {
          return;
        }

        setProduct(mapProduct(payload));
      } catch {
        if (isMounted) {
          setProduct(fallbackProduct);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [fallbackProduct, productId]);

  return { product, isLoading };
}
