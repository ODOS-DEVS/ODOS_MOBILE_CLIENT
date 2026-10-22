import StoreTileShelf, { type StoreTile } from "@/components/store/StoreTileShelf";
import type { StoreSectionWithProducts } from "@/hooks/useStoreSections";
import { resolveApiMediaUrl } from "@/utils/media";
import { router } from "expo-router";
import React, { useMemo } from "react";

type StoreSectionsShowcaseProps = {
  sections: StoreSectionWithProducts[];
  storeId: string;
  horizontalPadding: number;
  storeTitle?: string;
};

/**
 * The shop's own shelves, as places to open rather than rails to scroll.
 *
 * This used to render every section as a horizontal rail of product cards. On
 * a shop with a dozen shelves that produced a dozen near-identical rails, each
 * showing an arbitrary first handful, and the shopper still could not see what
 * the shop was organised into. Worse, the rails loaded products the shopper
 * had not asked for — a page of cards before a single decision was made.
 *
 * A shelf is now one tile. Tapping it opens the browse screen already filtered
 * to that section, where the products page in as you scroll instead of
 * arriving all at once.
 */
export default function StoreSectionsShowcase({
  sections,
  storeId,
  horizontalPadding,
  storeTitle,
}: StoreSectionsShowcaseProps) {
  const tiles = useMemo<StoreTile[]>(
    () =>
      sections.map((section) => {
        // The first product's photo stands in for the shelf: a vendor names a
        // section but never art-directs one, so borrowing its leading item is
        // the only honest picture available.
        const leadImage = section.products[0];
        const imageUrl =
          resolveApiMediaUrl(
            (leadImage as { imageUrl?: string } | undefined)?.imageUrl,
          ) ?? null;

        return {
          key: section.id,
          label: section.title,
          count: section.products.length || undefined,
          imageUrl,
          icon: "albums-outline" as const,
          onPress: () =>
            router.push({
              pathname: "/(root)/screens/stores/[id]/products" as any,
              params: {
                id: storeId,
                title: storeTitle ?? "Store",
                sectionId: section.id,
              },
            }),
        };
      }),
    [sections, storeId, storeTitle],
  );

  return (
    <StoreTileShelf
      title="Shop by shelf"
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
