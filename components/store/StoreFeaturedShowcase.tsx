import ProductCard from "@/components/cards/ProductCard";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import { productCardGapX, rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { openProductDetail } from "@/utils/productNavigation";
import {
  formatStoreProductBadge,
  pickStoreLandingProducts,
} from "@/utils/storeProductBrowse";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function formatCurrency(value: number) {
  return `₵${value.toFixed(2)}`;
}

type StoreFeaturedShowcaseProps = {
  products: CatalogProductItem[];
  storeId: string;
  storeTitle?: string;
  horizontalPadding: number;
  productsLoading?: boolean;
  hasMoreProducts?: boolean;
  onBrowseAll?: () => void;
};

function PreviewRow({
  product,
  storeId,
}: {
  product: CatalogProductItem;
  storeId: string;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() =>
        openProductDetail(
          {
            id: product.id,
            image: product.image,
            imageKey: product.imageKey,
            imageUrl: product.imageUrl,
            title: product.title,
            category: product.category,
            price: product.price,
            oldPrice: product.oldPrice,
            discount: product.discount,
            rating: product.rating,
            reviews: product.reviews,
          },
          { sourceScreen: "store_landing", storeId },
        )
      }
    >
      <View style={styles.previewRow}>
        <View style={styles.previewCopy}>
          <Text
            style={[styles.previewTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {product.title}
          </Text>
          {typeof product.price === "number" ? (
            <Text style={[styles.previewPrice, { color: colors.textMuted }]}>
              {formatCurrency(product.price)}
            </Text>
          ) : null}
        </View>
        <Ionicons
          name="chevron-forward"
          size={rMS(16)}
          color={colors.iconMuted}
        />
      </View>
    </TouchableOpacity>
  );
}

function StoreProductsEmptyState({ storeTitle }: { storeTitle?: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.emptyCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.pill }]}>
        <Ionicons name="cube-outline" size={rMS(24)} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No products listed yet
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
        {storeTitle
          ? `${storeTitle} hasn't added products to their storefront yet. Check back soon or message the store directly.`
          : "This store hasn't added products yet. Check back soon or message them directly."}
      </Text>
    </View>
  );
}

export default function StoreFeaturedShowcase({
  products,
  storeId,
  storeTitle,
  horizontalPadding,
  productsLoading = false,
  hasMoreProducts = false,
  onBrowseAll,
}: StoreFeaturedShowcaseProps) {
  const { colors } = useTheme();
  const { gridCardWidth } = useResponsive();
  const gridGap = productCardGapX();
  const cardWidth = gridCardWidth(2, gridGap);

  const { featured, preview } = useMemo(
    () => pickStoreLandingProducts(products, storeId),
    [products, storeId],
  );

  const totalShown = featured.length + preview.length;
  const showBrowseAll =
    Boolean(onBrowseAll) &&
    products.length > 0 &&
    (hasMoreProducts || products.length > totalShown);

  const browseLabel = useMemo(() => {
    const badge = formatStoreProductBadge(products.length, hasMoreProducts);
    return badge ? `View all ${badge}` : "View all products";
  }, [hasMoreProducts, products.length]);

  if (productsLoading && featured.length === 0) {
    return (
      <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.sectionIntro}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
            Featured
          </Text>
          <Text style={[styles.headline, { color: colors.text }]}>
            Loading products…
          </Text>
        </View>
        <ProductGridSkeleton count={2} />
      </View>
    );
  }

  if (featured.length === 0) {
    return (
      <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
        <StoreProductsEmptyState storeTitle={storeTitle} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.sectionIntro}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
          Featured
        </Text>
        <Text style={[styles.headline, { color: colors.text }]}>
          {storeTitle ? `From ${storeTitle}` : "Featured products"}
        </Text>
      </View>

      <View style={[styles.grid, { gap: gridGap }]}>
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            cardWidth={cardWidth}
            horizontalSpacing={0}
            sourceScreen="store_landing"
            storeId={storeId}
          />
        ))}
      </View>

      {preview.length > 0 ? (
        <View style={styles.previewBlock}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewLabel, { color: colors.text }]}>
              More from this store
            </Text>
            <View
              style={[styles.previewRule, { backgroundColor: colors.border }]}
            />
          </View>
          <View
            style={[
              styles.previewList,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {preview.map((product, index) => (
              <View key={product.id}>
                <PreviewRow product={product} storeId={storeId} />
                {index < preview.length - 1 ? (
                  <View
                    style={[
                      styles.previewDivider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {showBrowseAll ? (
        <TouchableOpacity
          style={[
            styles.browseAllButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderStrong,
            },
          ]}
          activeOpacity={0.88}
          onPress={onBrowseAll}
        >
          <Text style={[styles.browseAllText, { color: colors.text }]}>
            {browseLabel}
          </Text>
          <Ionicons name="arrow-forward" size={rMS(16)} color={colors.text} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: rV(8),
    gap: rV(16),
  },
  sectionIntro: {
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  previewBlock: {
    marginTop: rV(4),
    gap: rV(12),
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  previewLabel: {
    fontFamily: Fonts.title,
    fontSize: rMS(13.5),
  },
  previewRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  previewList: {
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingHorizontal: rS(14),
    paddingVertical: rV(13),
  },
  previewCopy: {
    flex: 1,
    gap: rV(2),
  },
  previewTitle: {
    fontFamily: Fonts.title,
    fontSize: rMS(13.5),
  },
  previewPrice: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  previewDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: rS(14),
  },
  browseAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    minHeight: rV(48),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: rV(2),
  },
  browseAllText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
  emptyCard: {
    alignItems: "center",
    paddingHorizontal: rS(20),
    paddingVertical: rV(28),
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    gap: rV(10),
  },
  emptyIcon: {
    width: rS(52),
    height: rS(52),
    borderRadius: rS(18),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    textAlign: "center",
  },
  emptyMessage: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    textAlign: "center",
  },
});
