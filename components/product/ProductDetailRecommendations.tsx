import ProductCard from "@/components/cards/ProductCard";
import { HorizontalProductRowSkeleton } from "@/components/loaders/CommerceSkeletons";
import type { RecommendationFeed } from "@/hooks/useRecommendations";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import { createProductDetailStyles } from "@/styles/productDetailStyles";
import { rS, rV } from "@/styles/responsive";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

type RecommendationSectionProps = {
  title: string;
  subtitle?: string;
  personalized?: boolean;
  products: CatalogProductItem[];
  isLoading: boolean;
  sourceScreen: string;
};

function RecommendationSection({
  title,
  subtitle,
  personalized = false,
  products,
  isLoading,
  sourceScreen,
}: RecommendationSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createProductDetailStyles(colors), [colors]);
  const cardWidth = rS(156);

  if (isLoading && products.length === 0) {
    return (
      <View>
        <View style={styles.relatedHeader}>
          <Text style={styles.relatedTitle}>{title}</Text>
          {subtitle ? <Text style={styles.relatedSubtitle}>{subtitle}</Text> : null}
        </View>
        <HorizontalProductRowSkeleton />
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View>
      <View style={styles.relatedHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.relatedTitle}>{title}</Text>
          {personalized ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: colors.accentSoft,
              }}
            >
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text
                style={{
                  fontSize: 11,
                  color: colors.primary,
                  fontFamily: Fonts.titleBold,
                }}
              >
                Personalized
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.relatedSubtitle}>{subtitle}</Text> : null}
      </View>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${sourceScreen}-${item.id}`}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            cardWidth={cardWidth}
            horizontalSpacing={rS(12)}
            sourceScreen={sourceScreen}
            storeId={item.storeId}
            reviews={
              item.reviews !== undefined ? Number(item.reviews) : undefined
            }
          />
        )}
        contentContainerStyle={[styles.relatedList, { paddingRight: rS(4) }]}
      />
    </View>
  );
}

type ProductDetailRecommendationsProps = {
  productId: string;
  similarFeed: RecommendationFeed;
  similarProducts: CatalogProductItem[];
  similarLoading: boolean;
  forYouFeed: RecommendationFeed;
  forYouProducts: CatalogProductItem[];
  forYouLoading: boolean;
};

export default function ProductDetailRecommendations({
  productId,
  similarFeed,
  similarProducts,
  similarLoading,
  forYouFeed,
  forYouProducts,
  forYouLoading,
}: ProductDetailRecommendationsProps) {
  const filteredForYou = useMemo(
    () =>
      forYouProducts
        .filter((item) => item.id !== productId)
        .filter((item) => !similarProducts.some((similar) => similar.id === item.id))
        .slice(0, 8),
    [forYouProducts, productId, similarProducts],
  );

  const hasContent =
    similarLoading ||
    forYouLoading ||
    similarProducts.length > 0 ||
    filteredForYou.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <View style={{ gap: rV(8) }}>
      <RecommendationSection
        title={similarFeed.title || "More like this"}
        subtitle={
          similarFeed.subtitle ??
          "Similar picks from this category and seller network."
        }
        personalized={similarFeed.personalized}
        products={similarProducts}
        isLoading={similarLoading}
        sourceScreen="product_detail_similar"
      />
      <RecommendationSection
        title={forYouFeed.title || "Picked for you"}
        subtitle={
          forYouFeed.subtitle ??
          "Based on what you browse, save, and buy on ODOS."
        }
        personalized={forYouFeed.personalized}
        products={filteredForYou}
        isLoading={forYouLoading}
        sourceScreen="product_detail_for_you"
      />
    </View>
  );
}
