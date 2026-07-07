import ProductCard from "@/components/cards/ProductCard";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { browseStoreProducts } from "@/utils/storeProductBrowse";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const gridGap = rS(10);
  const cardWidth = gridCardWidth(2, gridGap);

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
          priceRange: "all",
          sort: "rating",
        },
      ).slice(0, 4),
    [products, storeId],
  );

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
        {onBrowseAll ? (
          <TouchableOpacity style={styles.linkButton} onPress={onBrowseAll} activeOpacity={0.86}>
            <Text style={[styles.linkText, { color: colors.text }]}>See all</Text>
            <Ionicons name="arrow-forward" size={rMS(14)} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={[styles.grid, { gap: gridGap }]}>
        {deals.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            cardWidth={cardWidth}
            horizontalSpacing={0}
            sourceScreen="store_deals"
            storeId={storeId}
          />
        ))}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
