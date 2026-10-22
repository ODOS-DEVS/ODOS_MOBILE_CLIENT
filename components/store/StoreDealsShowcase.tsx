import ProductCard from "@/components/cards/ProductCard";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import { productCardGapX, rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { browseStoreProducts } from "@/utils/storeProductBrowse";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** Matches STORE_SHELF_TILE_LIMIT, so every rail on the storefront previews alike. */
const DEALS_RAIL_LIMIT = 5;

type StoreDealsShowcaseProps = {
  products: CatalogProductItem[];
  storeId: string;
  horizontalPadding: number;
  onBrowseAll?: () => void;
};

export default function StoreDealsShowcase({
  products,
  storeId,
  horizontalPadding,
  onBrowseAll,
}: StoreDealsShowcaseProps) {
  const { colors } = useTheme();
  const { gridCardWidth } = useResponsive();
  const gridGap = productCardGapX();
  // Slightly narrower than a two-up grid cell, so the next card peeks in and
  // the rail reads as scrollable without a hint or an arrow.
  const cardWidth = gridCardWidth(2, gridGap) * 0.92;

  const deals = useMemo(
    () =>
      browseStoreProducts(
        products,
        {
          storeId,
          query: "",
          mode: "deals",
          categorySlug: "",
          subcategorySlug: "",
          audienceSlug: "",
          priceRange: "all",
          sort: "rating",
        },
      ),
    [products, storeId],
  );

  /**
   * A rail of five, not a wrapped grid of four.
   *
   * The grid was two rows deep and fixed at four, which made the shop's
   * discounts look like a complete set when they were a silent truncation —
   * a shop running thirty deals showed four and said nothing about the rest.
   * A rail carries the same preview in half the vertical space, matches the
   * category and shelf rails above it, and "See all" now only appears when
   * there genuinely is more, so it stops being decoration.
   */
  const visibleDeals = deals.slice(0, DEALS_RAIL_LIMIT);
  const hasMoreDeals = deals.length > visibleDeals.length;

  if (!deals.length) {
    return null;
  }

  return (
    <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Deals</Text>
          <Text style={[styles.title, { color: colors.text }]}>On sale now</Text>
        </View>
        {onBrowseAll && hasMoreDeals ? (
          <TouchableOpacity style={styles.linkButton} onPress={onBrowseAll} activeOpacity={0.86}>
            <Text style={[styles.linkText, { color: colors.text }]}>See all</Text>
            <Ionicons name="arrow-forward" size={rMS(14)} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.rail, { gap: gridGap }]}
      >
        {visibleDeals.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            cardWidth={cardWidth}
            horizontalSpacing={0}
            sourceScreen="store_deals"
            storeId={storeId}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: rV(16),
    gap: rV(12),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: rS(12),
  },
  headerCopy: {
    flex: 1,
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    letterSpacing: -0.3,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(4),
    paddingVertical: rV(4),
  },
  linkText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  rail: {
    flexDirection: "row",
    paddingVertical: rV(2),
  },
});
