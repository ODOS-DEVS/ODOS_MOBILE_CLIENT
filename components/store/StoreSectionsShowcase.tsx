import ProductCard from "@/components/cards/ProductCard";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { StoreSectionWithProducts } from "@/hooks/useStoreSections";
import { productCardGapX, rMS, rS, rV, useResponsive } from "@/styles/responsive";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type StoreSectionsShowcaseProps = {
  sections: StoreSectionWithProducts[];
  storeId: string;
  horizontalPadding: number;
};

/**
 * The shop's own shelves, in the order the vendor arranged them.
 *
 * Rendered as horizontal rails rather than a grid: a shop may have a dozen
 * sections, and stacking every one as a full grid would bury everything below
 * the first two behind a long scroll.
 */
export default function StoreSectionsShowcase({
  sections,
  storeId,
  horizontalPadding,
}: StoreSectionsShowcaseProps) {
  const { colors } = useTheme();
  const { gridCardWidth } = useResponsive();
  const gap = productCardGapX();
  const cardWidth = gridCardWidth(2, gap);

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <View style={[styles.headerRow, { paddingHorizontal: horizontalPadding }]}>
            <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {section.products.length}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.rail,
              { paddingHorizontal: horizontalPadding, gap },
            ]}
          >
            {section.products.map((product) => (
              <ProductCard
                key={`${section.id}-${product.id}`}
                {...product}
                cardWidth={cardWidth}
                horizontalSpacing={0}
                sourceScreen="store_section"
                storeId={storeId}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: rV(16), gap: rV(18) },
  section: { gap: rV(10) },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: rS(12),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
  },
  count: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  rail: { paddingVertical: rV(2) },
});
