import type { CatalogCategoryItem, CatalogProductItem } from "@/hooks/useCatalog";
import type { VendorProduct } from "@/types/store";

export function normalizeCatalogSlug(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCatalogCategoryForProduct(
  categories: CatalogCategoryItem[],
  product: Pick<VendorProduct, "category" | "categorySlug">,
) {
  const normalizedCategory = normalizeCatalogSlug(product.category);
  const normalizedSlug = normalizeCatalogSlug(product.categorySlug);

  return (
    categories.find((entry) => entry.slug === product.categorySlug) ??
    categories.find((entry) => normalizeCatalogSlug(entry.slug) === normalizedSlug) ??
    categories.find(
      (entry) => normalizeCatalogSlug(entry.title) === normalizedCategory,
    ) ??
    categories.find(
      (entry) => normalizeCatalogSlug(entry.slug) === normalizedCategory,
    )
  );
}

export function productMatchesCatalogCategory(
  product: Pick<CatalogProductItem, "category" | "categorySlugs" | "audienceSlug">,
  categorySlug: string,
  categoryTitle?: string,
) {
  const normalizedSlug = normalizeCatalogSlug(categorySlug);
  const slugMatches = (product.categorySlugs ?? [])
    .map((value) => normalizeCatalogSlug(value))
    .filter(Boolean);

  if (slugMatches.includes(normalizedSlug)) {
    return true;
  }

  const normalizedCategory = normalizeCatalogSlug(product.category);
  if (normalizedCategory === normalizedSlug) {
    return true;
  }

  if (categoryTitle && normalizedCategory === normalizeCatalogSlug(categoryTitle)) {
    return true;
  }

  if (product.audienceSlug && normalizeCatalogSlug(product.audienceSlug) === normalizedSlug) {
    return true;
  }

  return false;
}

export function productMatchesCatalogSubcategory(
  product: Pick<CatalogProductItem, "subcategory" | "subcategorySlugs">,
  subcategoryLabel: string,
) {
  const normalizedTarget = normalizeCatalogSlug(subcategoryLabel);
  const candidates = [product.subcategory, ...(product.subcategorySlugs ?? [])]
    .map((value) => normalizeCatalogSlug(value))
    .filter(Boolean);
  return candidates.includes(normalizedTarget);
}

export function findCatalogSubcategoryLabel(
  category: CatalogCategoryItem | undefined,
  subcategory?: string | null,
) {
  if (!category?.subcategories?.length || !subcategory?.trim()) {
    return subcategory ?? "";
  }

  const normalizedTarget = normalizeCatalogSlug(subcategory);
  return (
    category.subcategories.find(
      (label) => normalizeCatalogSlug(label) === normalizedTarget,
    ) ??
    category.subcategories.find(
      (label) => label.trim().toLowerCase() === subcategory.trim().toLowerCase(),
    ) ??
    subcategory
  );
}
