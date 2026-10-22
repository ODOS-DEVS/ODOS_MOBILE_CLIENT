import StoreTileShelf, { type StoreTile } from "@/components/store/StoreTileShelf";
import { useCatalogCategories } from "@/hooks/useCatalog";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import { resolveApiMediaUrl } from "@/utils/media";
import {
  buildStoreProductCategoryOptions,
  normalizeCategorySlug,
} from "@/utils/storeProductBrowse";
import { router } from "expo-router";
import React, { useMemo } from "react";

type StoreCategoriesShowcaseProps = {
  products: CatalogProductItem[];
  storeId: string;
  horizontalPadding: number;
  storeTitle?: string;
};

/**
 * What this shop actually sells, grouped.
 *
 * A storefront told a shopper the shop's name, rating and delivery time, then
 * dropped them straight into an undifferentiated product list. For a shop with
 * one line of goods that is fine; for one selling phones, fridges and cookers
 * it hides the only question the shopper arrived with — "do you have the kind
 * of thing I want?".
 *
 * Categories are derived from the products rather than declared by the vendor,
 * because the vendor already answers this once per product when they list it.
 * Asking them to curate a second, parallel taxonomy would guarantee the two
 * drift apart, and a category that disagrees with its own contents is worse
 * than none.
 *
 * The honest limitation: this sees the products currently loaded for the
 * storefront, so a shop with a long tail may surface its main categories
 * rather than all of them. That is the right failure — the common categories
 * are the useful ones, and the browse screen behind each tile holds the
 * complete, server-filtered set.
 */
export default function StoreCategoriesShowcase({
  products,
  storeId,
  horizontalPadding,
  storeTitle,
}: StoreCategoriesShowcaseProps) {
  /**
   * The app's own category artwork, keyed by slug.
   *
   * A store's "Air Conditioners" and the marketplace's "Air Conditioners" are
   * the same idea, and the marketplace already has a designed image for it.
   * Borrowing it makes every shop's shelf look deliberate instead of
   * inheriting whichever product happened to be listed first — and makes the
   * same category recognisable across shops.
   *
   * Falls back to the leading product's photo when a store category has no
   * marketplace counterpart, which is what a vendor-invented category will
   * always be.
   */
  const { categories: appCategories } = useCatalogCategories();
  const appCategoryImageBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of appCategories) {
      const slug = normalizeCategorySlug(category.slug || category.title);
      if (slug && category.imageUrl) {
        map.set(slug, category.imageUrl);
      }
    }
    return map;
  }, [appCategories]);

  const tiles = useMemo<StoreTile[]>(() => {
    const options = buildStoreProductCategoryOptions(products, storeId).filter(
      // "All" is what the See all / explore bar already does.
      (option) => option.key !== "",
    );

    // One category is not a grouping — it is the whole shop, and a shelf
    // saying so costs a screenful to tell the shopper nothing.
    if (options.length < 2) {
      return [];
    }

    return options.map((option) => {
      const lead = products.find(
        (product) => normalizeCategorySlug(product.category) === option.key,
      );
      const imageUrl =
        appCategoryImageBySlug.get(option.key) ??
        resolveApiMediaUrl(
          (lead as { imageUrl?: string } | undefined)?.imageUrl,
        ) ??
        null;

      return {
        key: option.key,
        label: option.label,
        count: option.count,
        imageUrl,
        icon: "pricetags-outline" as const,
        onPress: () =>
          router.push({
            pathname: "/(root)/screens/stores/[id]/products" as any,
            params: {
              id: storeId,
              title: storeTitle ?? "Store",
              categorySlug: option.key,
            },
          }),
      };
    });
  }, [appCategoryImageBySlug, products, storeId, storeTitle]);

  return (
    <StoreTileShelf
      title="Shop by category"
      tiles={tiles}
      horizontalPadding={horizontalPadding}
      onSeeAll={() =>
        router.push({
          pathname: "/(root)/screens/stores/[id]/products" as any,
          params: { id: storeId, title: storeTitle ?? "Store" },
        })
      }
    />
  );
}
