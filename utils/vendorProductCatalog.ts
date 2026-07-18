import type { VendorProduct, VendorProductCatalogTab } from "@/types/store";

/** Matches backend inventory_service.LOW_STOCK_THRESHOLD */
export const LOW_STOCK_THRESHOLD = 2;

export function isLowStockProduct(product: VendorProduct) {
  return (
    (product.status === "active" || product.status === "out_of_stock") &&
    product.stock > 0 &&
    product.stock <= LOW_STOCK_THRESHOLD
  );
}

export function isOutOfStockProduct(product: VendorProduct) {
  return product.status === "out_of_stock" || product.stock <= 0;
}

export function filterVendorProductsByCatalogTab(
  products: VendorProduct[],
  tab: VendorProductCatalogTab,
) {
  if (tab === "all") {
    return [...products].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  if (tab === "live") {
    return products
      .filter((product) => product.status === "active")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (tab === "pending") {
    return products
      .filter((product) => product.status === "pending")
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  return products
    .filter(
      (product) =>
        product.status === "hidden" ||
        product.status === "suspended" ||
        product.status === "out_of_stock",
    )
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function countVendorProductsByCatalogTab(products: VendorProduct[]) {
  return {
    all: products.length,
    live: products.filter((product) => product.status === "active").length,
    pending: products.filter((product) => product.status === "pending").length,
    hidden: products.filter(
      (product) =>
        product.status === "hidden" ||
        product.status === "suspended" ||
        product.status === "out_of_stock",
    ).length,
  };
}

export function canHideVendorProduct(product: VendorProduct) {
  return product.status === "active" || product.status === "out_of_stock";
}

export function canUnhideVendorProduct(product: VendorProduct) {
  if (product.status === "hidden") {
    return true;
  }
  return product.status === "out_of_stock" && product.stock > 0;
}

export function canDeleteVendorProduct(product: VendorProduct) {
  return product.status !== "suspended";
}
