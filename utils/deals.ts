import type { CatalogProductItem } from "@/hooks/useCatalog";

export function isDealProduct(product: Pick<
  CatalogProductItem,
  "discount" | "oldPrice" | "price"
>) {
  const hasDiscount = Boolean(product.discount?.trim());
  const hasLowerLivePrice =
    typeof product.oldPrice === "number" &&
    typeof product.price === "number" &&
    product.oldPrice > product.price;
  return hasDiscount || hasLowerLivePrice;
}

export function computeSavingsPercent(
  price?: number,
  oldPrice?: number,
): number | null {
  if (
    typeof price !== "number" ||
    typeof oldPrice !== "number" ||
    oldPrice <= price ||
    oldPrice <= 0
  ) {
    return null;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatDealBadge(product: Pick<
  CatalogProductItem,
  "discount" | "oldPrice" | "price"
>) {
  const trimmed = product.discount?.trim();
  if (trimmed) {
    return trimmed;
  }

  const savings = computeSavingsPercent(product.price, product.oldPrice);
  if (savings != null && savings > 0) {
    return `${savings}% off`;
  }

  return null;
}

export function formatCurrency(value: number) {
  return `₵${value.toFixed(2)}`;
}

export function formatSavingsAmount(price?: number, oldPrice?: number) {
  if (
    typeof price !== "number" ||
    typeof oldPrice !== "number" ||
    oldPrice <= price
  ) {
    return null;
  }

  return formatCurrency(oldPrice - price);
}

export function dedupeProductsById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export function sortDealsBySavings<T extends Pick<
  CatalogProductItem,
  "discount" | "oldPrice" | "price" | "rating"
>>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftSavings = computeSavingsPercent(left.price, left.oldPrice) ?? 0;
    const rightSavings = computeSavingsPercent(right.price, right.oldPrice) ?? 0;

    if (rightSavings !== leftSavings) {
      return rightSavings - leftSavings;
    }

    return (right.rating ?? 0) - (left.rating ?? 0);
  });
}
