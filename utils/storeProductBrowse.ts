import type { CatalogProductItem } from "@/hooks/useCatalog";
import {
  buildDiscoverySearchScore,
  buildDiscoverySearchText,
  normalizeSearchText,
  queryMatchesSearchableText,
} from "@/utils/searchMatching";

export type StoreProductSortMode =
  | "relevance"
  | "newest"
  | "price_low"
  | "price_high"
  | "rating";

export type StoreProductPriceRange =
  | "all"
  | "under_100"
  | "100_250"
  | "250_500"
  | "500_plus";

export type StoreProductBrowseMode = "all" | "flash-sale" | "deals";

export type StoreBrowseFilters = {
  storeId: string;
  query: string;
  mode: StoreProductBrowseMode;
  categorySlug: string;
  subcategorySlug: string;
  priceRange: StoreProductPriceRange;
  sort: StoreProductSortMode;
};

export type StoreBrowseFilterOption = {
  key: string;
  label: string;
  count: number;
};

export function normalizeCategorySlug(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchesStoreProductPriceRange(
  price: number | undefined,
  range: StoreProductPriceRange,
) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return range === "all";
  }

  switch (range) {
    case "under_100":
      return price < 100;
    case "100_250":
      return price >= 100 && price <= 250;
    case "250_500":
      return price > 250 && price <= 500;
    case "500_plus":
      return price > 500;
    default:
      return true;
  }
}

export function isFlashSaleProduct(product: CatalogProductItem) {
  return (
    product.section === "flash-sale" || product.placementTags?.includes("flash-sale") === true
  );
}

export function isDealProduct(product: CatalogProductItem) {
  return (
    isFlashSaleProduct(product) ||
    (typeof product.oldPrice === "number" && product.oldPrice > (product.price ?? 0)) ||
    Boolean(product.discount)
  );
}

export function restrictProductsToStore(products: CatalogProductItem[], storeId: string) {
  if (!storeId.trim()) {
    return [];
  }

  return products.filter((product) => product.storeId === storeId);
}

function productCategorySlugs(product: CatalogProductItem) {
  const slugs = product.categorySlugs?.map((item) => normalizeCategorySlug(item)) ?? [];
  const primary = normalizeCategorySlug(product.category);
  return primary ? [primary, ...slugs.filter((slug) => slug !== primary)] : slugs;
}

function productSubcategorySlugs(product: CatalogProductItem) {
  const slugs = product.subcategorySlugs?.map((item) => normalizeCategorySlug(item)) ?? [];
  const primary = normalizeCategorySlug(product.subcategory);
  return primary ? [primary, ...slugs.filter((slug) => slug !== primary)] : slugs;
}

export function filterStoreProducts(
  products: CatalogProductItem[],
  filters: StoreBrowseFilters,
  storeTitle?: string,
) {
  const scoped = restrictProductsToStore(products, filters.storeId);
  const normalizedQuery = normalizeSearchText(filters.query);

  return scoped.filter((product) => {
    if (filters.mode === "flash-sale" && !isFlashSaleProduct(product)) {
      return false;
    }
    if (filters.mode === "deals" && !isDealProduct(product)) {
      return false;
    }

    const categorySlugs = productCategorySlugs(product);
    if (filters.categorySlug && !categorySlugs.includes(filters.categorySlug)) {
      return false;
    }

    const subcategorySlugs = productSubcategorySlugs(product);
    if (filters.subcategorySlug && !subcategorySlugs.includes(filters.subcategorySlug)) {
      return false;
    }

    if (!matchesStoreProductPriceRange(product.price, filters.priceRange)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return queryMatchesSearchableText(
      normalizedQuery,
      buildDiscoverySearchText({
        title: product.title,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        categorySlugs: product.categorySlugs,
        subcategorySlugs: product.subcategorySlugs,
        placementTags: product.placementTags,
        storeTitle,
      }),
    );
  });
}

export function sortStoreProducts(
  products: CatalogProductItem[],
  sort: StoreProductSortMode,
  query = "",
  storeTitle?: string,
) {
  const normalizedQuery = normalizeSearchText(query);
  const sorted = [...products];

  sorted.sort((left, right) => {
    if (sort === "price_low") {
      return (left.price ?? 0) - (right.price ?? 0);
    }
    if (sort === "price_high") {
      return (right.price ?? 0) - (left.price ?? 0);
    }
    if (sort === "rating") {
      return (right.rating ?? 0) - (left.rating ?? 0);
    }
    if (sort === "newest") {
      return (
        new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
        new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
      );
    }

    const leftScore = buildDiscoverySearchScore(normalizedQuery, {
      title: left.title,
      description: left.description,
      category: left.category,
      subcategory: left.subcategory,
      categorySlugs: left.categorySlugs,
      subcategorySlugs: left.subcategorySlugs,
      placementTags: left.placementTags,
      storeTitle,
      rating: left.rating,
    });
    const rightScore = buildDiscoverySearchScore(normalizedQuery, {
      title: right.title,
      description: right.description,
      category: right.category,
      subcategory: right.subcategory,
      categorySlugs: right.categorySlugs,
      subcategorySlugs: right.subcategorySlugs,
      placementTags: right.placementTags,
      storeTitle,
      rating: right.rating,
    });

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return (
      new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
      new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
    );
  });

  return sorted;
}

export function browseStoreProducts(
  products: CatalogProductItem[],
  filters: StoreBrowseFilters,
  storeTitle?: string,
) {
  const filtered = filterStoreProducts(products, filters, storeTitle);
  return sortStoreProducts(filtered, filters.sort, filters.query, storeTitle);
}

export function buildStoreProductCategoryOptions(
  products: CatalogProductItem[],
  storeId: string,
): StoreBrowseFilterOption[] {
  const scoped = restrictProductsToStore(products, storeId);
  const counts = new Map<string, { label: string; count: number }>();

  scoped.forEach((product) => {
    const slug = normalizeCategorySlug(product.category);
    if (!slug) {
      return;
    }
    const current = counts.get(slug);
    counts.set(slug, {
      label: product.category?.trim() || slug,
      count: (current?.count ?? 0) + 1,
    });
  });

  return [{ key: "", label: "All", count: scoped.length }].concat(
    [...counts.entries()]
      .sort((left, right) => left[1].label.localeCompare(right[1].label))
      .map(([key, value]) => ({
        key,
        label: value.label,
        count: value.count,
      })),
  );
}

export function buildStoreProductSubcategoryOptions(
  products: CatalogProductItem[],
  storeId: string,
  categorySlug: string,
): StoreBrowseFilterOption[] {
  const scoped = restrictProductsToStore(products, storeId).filter((product) => {
    if (!categorySlug) {
      return true;
    }
    return productCategorySlugs(product).includes(categorySlug);
  });

  const counts = new Map<string, { label: string; count: number }>();
  scoped.forEach((product) => {
    const slug = normalizeCategorySlug(product.subcategory);
    if (!slug) {
      return;
    }
    const current = counts.get(slug);
    counts.set(slug, {
      label: product.subcategory?.trim() || slug,
      count: (current?.count ?? 0) + 1,
    });
  });

  return [{ key: "", label: "All", count: scoped.length }].concat(
    [...counts.entries()]
      .sort((left, right) => left[1].label.localeCompare(right[1].label))
      .map(([key, value]) => ({
        key,
        label: value.label,
        count: value.count,
      })),
  );
}

export function countActiveStoreBrowseFilters(
  filters: Pick<
    StoreBrowseFilters,
    "mode" | "categorySlug" | "subcategorySlug" | "priceRange" | "sort"
  >,
) {
  return [
    filters.mode !== "all" ? filters.mode : "",
    filters.categorySlug,
    filters.subcategorySlug,
    filters.priceRange !== "all" ? filters.priceRange : "",
    filters.sort !== "relevance" ? filters.sort : "",
  ].filter(Boolean).length;
}

export function formatStoreProductCount(count: number, hasMore: boolean) {
  if (count <= 0) {
    return "Explore products";
  }
  if (hasMore) {
    return `Explore products (${count}+)`;
  }
  return `Explore products (${count})`;
}

const LANDING_FEATURED_COUNT = 3;
const LANDING_PREVIEW_COUNT = 3;

function rankStoreLandingProducts(products: CatalogProductItem[]) {
  return [...products].sort((left, right) => {
    const ratingDiff = (right.rating ?? 0) - (left.rating ?? 0);
    if (ratingDiff !== 0) {
      return ratingDiff;
    }
    return (
      new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
      new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
    );
  });
}

export function pickStoreLandingProducts(products: CatalogProductItem[], storeId?: string) {
  const scoped = storeId ? restrictProductsToStore(products, storeId) : products;
  const ranked = rankStoreLandingProducts(scoped);
  return {
    featured: ranked.slice(0, LANDING_FEATURED_COUNT),
    preview: ranked.slice(LANDING_FEATURED_COUNT, LANDING_FEATURED_COUNT + LANDING_PREVIEW_COUNT),
  };
}
