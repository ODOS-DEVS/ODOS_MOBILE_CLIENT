import type {
  VendorProduct,
  VendorProductCatalogTab,
  VendorProductInput,
} from "@/types/store";

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
  if (tab === "attention") {
    return filterVendorProductsNeedingAttention(products);
  }

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
    attention: countVendorProductsNeedingAttention(products),
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


/**
 * Why a product needs the vendor's attention, worst first.
 *
 * The catalog tabs answer "what state is this product in". They cannot answer
 * the question a vendor with three hundred listings actually has, which is
 * "what needs me today" — finding the four sold-out items in that list means
 * scrolling the whole thing. These are the conditions that cost a sale while
 * nobody is looking.
 */
export type VendorProductIssue =
  | "out_of_stock"
  | "low_stock"
  | "missing_image"
  | "missing_price";

const ISSUE_SEVERITY: Record<VendorProductIssue, number> = {
  out_of_stock: 0,
  missing_price: 1,
  missing_image: 2,
  low_stock: 3,
};

export const VENDOR_PRODUCT_ISSUE_LABELS: Record<VendorProductIssue, string> = {
  out_of_stock: "Sold out",
  low_stock: `Only ${LOW_STOCK_THRESHOLD} left`,
  missing_image: "No photo",
  missing_price: "No price",
};

function hasImage(product: VendorProduct) {
  if (product.imageUrl || product.imageKey || product.image) {
    return true;
  }
  return Boolean(product.imageUrls?.length || product.imageUris?.length);
}

/** Issues on one product, most severe first. Empty means nothing to do. */
export function getVendorProductIssues(product: VendorProduct): VendorProductIssue[] {
  // A hidden or suspended listing is not on sale, so none of this is urgent —
  // flagging it would bury the live products that are actually losing money.
  if (product.status === "hidden" || product.status === "suspended") {
    return [];
  }

  const issues: VendorProductIssue[] = [];

  if (isOutOfStockProduct(product)) {
    issues.push("out_of_stock");
  } else if (isLowStockProduct(product)) {
    issues.push("low_stock");
  }

  if (!hasImage(product)) {
    issues.push("missing_image");
  }

  if (!(product.price > 0)) {
    issues.push("missing_price");
  }

  return issues.sort((a, b) => ISSUE_SEVERITY[a] - ISSUE_SEVERITY[b]);
}

export function needsVendorAttention(product: VendorProduct) {
  return getVendorProductIssues(product).length > 0;
}

/** Products needing attention, worst first, then oldest-touched first. */
export function filterVendorProductsNeedingAttention(products: VendorProduct[]) {
  return products
    .filter(needsVendorAttention)
    .sort((a, b) => {
      const severity =
        ISSUE_SEVERITY[getVendorProductIssues(a)[0]] -
        ISSUE_SEVERITY[getVendorProductIssues(b)[0]];
      if (severity !== 0) {
        return severity;
      }
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });
}

export function countVendorProductsNeedingAttention(products: VendorProduct[]) {
  return products.reduce(
    (total, product) => total + (needsVendorAttention(product) ? 1 : 0),
    0,
  );
}

/** Categories the vendor actually uses, with counts, for the filter row. */
export function buildVendorCategoryOptions(products: VendorProduct[]) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const label = product.category?.trim();
    if (label) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ key: label, label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * A complete, lossless update payload for one product.
 *
 * `updateVendorProduct` is a PATCH in name only: it sends every field as
 * FormData, and the backend reads a present-but-empty `image_urls` as "clear
 * the gallery" (see `patch_vendor_product` — `next_gallery_urls is not None`
 * is enough to rewrite `product.image_urls`).
 *
 * The trap is that the gallery arrives from the server on `imageUrls` and is
 * sent back from `imageUris`. Spreading a `VendorProduct` straight into the
 * updater therefore leaves `imageUris` undefined and deletes every photo but
 * the cover — silently, with a 200 response.
 *
 * Every quick edit that changes a single field must build its payload here.
 * Mirrors the seeding the full edit form does in app/vendor/products/new.tsx.
 */
export function buildVendorProductUpdateInput(
  product: VendorProduct,
  overrides: Partial<VendorProductInput> = {},
): VendorProductInput {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    categorySlug: product.categorySlug,
    subcategory: product.subcategory,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    imageKey: product.imageKey,
    imageUrl: product.imageUrl,
    imageUris: product.imageUrls?.length
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [],
    placementTags: product.placementTags ?? [],
    colorOptions: product.colorOptions ?? [],
    sizeOptions: product.sizeOptions ?? [],
    specifications: product.specifications ?? [],
    isReturnable: product.isReturnable ?? true,
    ...overrides,
  };
}
