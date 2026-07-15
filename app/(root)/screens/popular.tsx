import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import RecommendationCard from "@/components/cards/RecommendationCard";
import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { rV, useResponsive } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

export default function PopularProductsScreen() {
  const commerceSeeAllScreenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [isSearching, setIsSearching] = useState(false);
  const {
    products: catalogProducts,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = useInfiniteCatalogProducts({ section: "popular" });
  const [searchResults, setSearchResults] = useState(catalogProducts);

  const displayed = useMemo(
    () => (isSearching ? searchResults : catalogProducts),
    [catalogProducts, isSearching, searchResults],
  );

  const dealCount = useMemo(
    () =>
      catalogProducts.filter((item) => {
        const hasDiscount = Boolean(item.discount?.trim());
        const hasLowerLivePrice =
          typeof item.oldPrice === "number" &&
          typeof item.price === "number" &&
          item.oldPrice > item.price;
        return hasDiscount || hasLowerLivePrice;
      }).length,
    [catalogProducts],
  );

  const topRatedCount = useMemo(
    () => catalogProducts.filter((item) => (item.rating ?? 0) >= 4.4).length,
    [catalogProducts],
  );

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      <CommerceSeeAllHero
        badgeIcon="flame-outline"
        badgeLabel="Trending now"
        title="Popular picks shoppers love"
        subtitle="High-engagement products with strong ratings and steady demand across ODOS."
        accent="gold"
        stats={[
          { value: catalogProducts.length, label: "products" },
          { value: topRatedCount, label: "top rated" },
          { value: dealCount, label: "on deal" },
        ]}
      />

      <CommerceSeeAllSearch
        data={catalogProducts}
        onStartSearch={() => setIsSearching(true)}
        onResults={(results) => {
          setIsSearching(true);
          setSearchResults(results);
        }}
        placeholder="Search popular products, brands, or categories"
        searchKeys={["title", "category", "subcategory", "reviews", "discount"]}
      />

      <CommerceSeeAllSectionHeader
        title="All popular products"
        subtitle={
          isSearching
            ? `${displayed.length} result${displayed.length === 1 ? "" : "s"} from your search`
            : "Updated from the live popular feed"
        }
        count={displayed.length}
      />
    </View>
  );

  return (
    <View style={commerceSeeAllScreenStyles.screen}>
      <ProfileHeader title="Popular Products" />

      {isLoading && catalogProducts.length === 0 ? (
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: rV(8),
            paddingBottom: sectionSpacing,
          }}
        >
          {listHeader}
          <ProductListSkeleton count={2} />
        </View>
      ) : displayed.length === 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: sectionSpacing,
          }}
          ListEmptyComponent={
            <CommerceSeeAllEmptyState
              icon="cube-outline"
              title={error ? "We couldn't load popular products" : "No products found"}
              subtitle={
                error
                  ? "The live popular feed is unavailable right now. Try again shortly."
                  : "Adjust your search or check back when new products are added."
              }
            />
          }
        />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={displayed}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.45}
          ListFooterComponent={
            isSearching ? null : <CatalogScrollFooter isLoadingMore={isLoadingMore} />
          }
          ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
          renderItem={({ item }) => (
            <RecommendationCard
              {...item}
              reviews={item.reviews !== undefined ? Number(item.reviews) : undefined}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: rV(8),
            paddingBottom: sectionSpacing,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
