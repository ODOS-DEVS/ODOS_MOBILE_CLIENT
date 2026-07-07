import assert from "node:assert/strict";

import type { CatalogProductItem } from "../hooks/useCatalog";
import {
  browseStoreProducts,
  buildStoreProductCategoryOptions,
  countActiveStoreBrowseFilters,
  formatStoreProductCount,
  isDealProduct,
  isFlashSaleProduct,
  matchesStoreProductPriceRange,
  pickStoreLandingProducts,
  restrictProductsToStore,
  sortStoreProducts,
} from "../utils/storeProductBrowse";

function product(partial: Partial<CatalogProductItem> & Pick<CatalogProductItem, "id" | "title">) {
  return {
    price: 120,
    image: null,
    imageKey: partial.id,
    ...partial,
  } satisfies CatalogProductItem;
}

const storeA = "store-a";
const storeB = "store-b";

const catalog: CatalogProductItem[] = [
  product({
    id: "1",
    title: "Blue Sneakers",
    storeId: storeA,
    category: "Fashion",
    price: 80,
    rating: 4.8,
    section: "flash-sale",
    placementTags: ["flash-sale"],
  }),
  product({
    id: "2",
    title: "Leather Belt",
    storeId: storeA,
    category: "Fashion",
    subcategory: "Accessories",
    price: 45,
    oldPrice: 70,
  }),
  product({
    id: "3",
    title: "Other Store Mug",
    storeId: storeB,
    category: "Home",
    price: 25,
  }),
  product({
    id: "4",
    title: "Premium Watch",
    storeId: storeA,
    category: "Electronics",
    price: 620,
    rating: 4.2,
  }),
];

assert.deepEqual(
  restrictProductsToStore(catalog, storeA).map((item) => item.id),
  ["1", "2", "4"],
);

assert.equal(isFlashSaleProduct(catalog[0]), true);
assert.equal(isDealProduct(catalog[1]), true);
assert.equal(matchesStoreProductPriceRange(80, "under_100"), true);
assert.equal(matchesStoreProductPriceRange(620, "500_plus"), true);

const categoryOptions = buildStoreProductCategoryOptions(catalog, storeA);
assert.equal(categoryOptions[0]?.label, "All");
assert.ok(categoryOptions.some((option) => option.label === "Fashion"));

const filtered = browseStoreProducts(catalog, {
  storeId: storeA,
  query: "sneaker",
  mode: "all",
  categorySlug: "",
  subcategorySlug: "",
  priceRange: "all",
  sort: "relevance",
});
assert.deepEqual(filtered.map((item) => item.id), ["1"]);

const flashOnly = browseStoreProducts(catalog, {
  storeId: storeA,
  query: "",
  mode: "flash-sale",
  categorySlug: "",
  subcategorySlug: "",
  priceRange: "all",
  sort: "relevance",
});
assert.deepEqual(flashOnly.map((item) => item.id), ["1"]);

const sortedByPrice = sortStoreProducts(restrictProductsToStore(catalog, storeA), "price_high");
assert.equal(sortedByPrice[0]?.id, "4");

assert.equal(
  countActiveStoreBrowseFilters({
    mode: "deals",
    categorySlug: "fashion",
    subcategorySlug: "",
    priceRange: "100_250",
    sort: "rating",
  }),
  4,
);

assert.equal(formatStoreProductCount(12, false), "Browse all products (12)");
assert.equal(formatStoreProductCount(20, true), "Browse all products (20+)");

const landing = pickStoreLandingProducts(catalog, storeA);
assert.equal(landing.featured.length, 3);
assert.equal(landing.preview.length, 0);
assert.deepEqual(landing.featured.map((item) => item.id), ["1", "4", "2"]);

console.log("storeProductBrowse tests passed");
