import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import RecommendationCard from "@/components/cards/RecommendationCard";
import ImageReadyScreenGate from "@/components/media/ImageReadyScreenGate";
import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import { NetworkErrorState } from "@/components/empty/NetworkErrorState";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { NEW_PRODUCTS_MAX_AGE_DAYS } from "@/hooks/useNewProducts";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { productCardGapY, rV, useResponsive } from "@/styles/responsive";
import { buildImageReadyResetKey, prefetchCommerceImages } from "@/utils/imageReady";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";

export default function NewProductsScreen() {
  const commerceSeeAllScreenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [isSearching, setIsSearching] = useState(false);
  const {
    products: catalogProducts,
    isLoading,
    isLoadingMore,
    error,
    errorKind,
    loadMore,
    refresh,
  } = useInfiniteCatalogProducts({ maxAgeDays: NEW_PRODUCTS_MAX_AGE_DAYS });
  const [searchResults, setSearchResults] = useState(catalogProducts);

  const displayed = useMemo(
    () => (isSearching ? searchResults : catalogProducts),
    [catalogProducts, isSearching, searchResults],
  );

  const imageReadyResetKey = useMemo(
    () => buildImageReadyResetKey(displayed, 6),
    [displayed],
  );

  useEffect(() => {
    if (displayed.length > 0) {
      prefetchCommerceImages(displayed, 6);
    }
  }, [displayed]);

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      <CommerceSeeAllHero
        badgeIcon="sparkles-outline"
        badgeLabel="Just added"
        title="Freshly added to ODOS"
        subtitle={`New arrivals from the last ${NEW_PRODUCTS_MAX_AGE_DAYS} days, across every store.`}
        accent="gold"
        stats={[{ value: catalogProducts.length, label: "new products" }]}
      />

      <CommerceSeeAllSearch
        data={catalogProducts}
        onStartSearch={() => setIsSearching(true)}
        onResults={(results) => {
          setIsSearching(true);
          setSearchResults(results);
        }}
        placeholder="Search new products, brands, or categories"
        searchKeys={["title", "category", "subcategory", "reviews", "discount"]}
      />

      <CommerceSeeAllSectionHeader
        title="All new products"
        subtitle={
          isSearching
            ? `${displayed.length} result${displayed.length === 1 ? "" : "s"} from your search`
            : "Newest arrivals first"
        }
        count={displayed.length}
      />
    </View>
  );

  return (
    <View style={commerceSeeAllScreenStyles.screen}>
      <ProfileHeader title="New Products" />

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
            error ? (
              <NetworkErrorState
                kind={errorKind}
                title="We couldn't load new products"
                onRetry={() => void refresh()}
              />
            ) : (
              <CommerceSeeAllEmptyState
                icon="cube-outline"
                title="No new products yet"
                subtitle="Check back soon — new arrivals show up here for a week after they're added."
              />
            )
          }
        />
      ) : (
        <ImageReadyScreenGate
          resetKey={imageReadyResetKey}
          enabled
          skeleton={
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
          }
        >
          <FlatList
            style={{ flex: 1 }}
            data={displayed}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            onEndReached={() => void loadMore()}
            onEndReachedThreshold={0.45}
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={7}
            removeClippedSubviews
            ListFooterComponent={
              isSearching ? null : <CatalogScrollFooter isLoadingMore={isLoadingMore} />
            }
            ItemSeparatorComponent={() => <View style={{ height: productCardGapY() }} />}
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
        </ImageReadyScreenGate>
      )}
    </View>
  );
}
