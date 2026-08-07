import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import { rMS, rS, rV } from "@/styles/responsive";
import { formatCurrency } from "@/utils/currency";
import { openProductDetail } from "@/utils/productNavigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CommerceImage from "@/components/media/CommerceImage";

type TopDealSpotlightProps = {
  product: CatalogProductItem;
  savingsPercent: number;
};

/** A single-product hero for the Deals screen — replaces the generic "Browse
 * deals" banner (which did nothing useful once you're already on this
 * screen) with the actual best live deal, tappable straight to that product. */
export default function TopDealSpotlight({ product, savingsPercent }: TopDealSpotlightProps) {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() =>
        openProductDetail(
          {
            id: product.id,
            imageUrl: product.imageUrl,
            imageKey: product.imageKey,
            title: product.title,
            category: product.category,
            oldPrice: product.oldPrice,
            price: product.price,
            discount: product.discount,
            rating: product.rating,
            reviews: product.reviews,
          },
          { sourceScreen: "deals_spotlight", eventType: "product_click" },
        )
      }
      style={styles.shell}
    >
      <LinearGradient
        colors={isDark ? ["#1A2234", "#3B2410", "#1F2937"] : ["#FFF7ED", "#FFE4C7", "#F8FAFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.imageWrap}>
          <CommerceImage
            source={{ uri: product.imageUrl }}
            style={styles.image}
            contentFit="cover"
            trackingId={`deals-spotlight-${product.id}`}
            recyclingKey={product.imageUrl ?? product.id}
            placeholderColor={colors.imagePlaceholder}
          />
          <View style={[styles.discountBadge, { backgroundColor: colors.dangerText }]}>
            <Text style={styles.discountText}>{savingsPercent}% OFF</Text>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={[styles.eyebrow, { color: colors.warningText }]}>
            Today{"'"}s best deal
          </Text>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              {formatCurrency(product.price ?? 0)}
            </Text>
            {typeof product.oldPrice === "number" ? (
              <Text style={[styles.oldPrice, { color: colors.textMuted }]}>
                {formatCurrency(product.oldPrice)}
              </Text>
            ) : null}
          </View>

          <View style={[styles.cta, { backgroundColor: colors.text }]}>
            <Text style={[styles.ctaText, { color: isDark ? colors.screen : colors.inverseText }]}>
              Shop this deal
            </Text>
            <Ionicons
              name="arrow-forward"
              size={rMS(14)}
              color={isDark ? colors.screen : colors.inverseText}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: rMS(22),
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    gap: rS(14),
  },
  imageWrap: {
    width: rS(96),
    height: rV(112),
    borderRadius: rMS(16),
    overflow: "hidden",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: rV(6),
    left: rS(6),
    paddingHorizontal: rS(6),
    paddingVertical: rV(3),
    borderRadius: rMS(999),
  },
  discountText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(9.5),
    color: "#FFFFFF",
  },
  copyBlock: {
    flex: 1,
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(19),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    marginTop: rV(2),
  },
  price: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
  },
  oldPrice: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    textDecorationLine: "line-through",
  },
  cta: {
    marginTop: rV(8),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(14),
    paddingVertical: rV(9),
    borderRadius: rMS(999),
  },
  ctaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
  },
});
