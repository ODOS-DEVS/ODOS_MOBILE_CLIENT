import RecommendationCard from "@/components/cards/RecommendationCard";
import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import type { FeedProduct } from "@/hooks/useHomeFeed";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import { productCardGapY, rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";

const PAGE_SIZE = 30;

function parseParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * "View all" destination for a home-feed section.
 *
 * `useHomeFeed().fetchSection` paginates a single section server-side
 * (GET /api/home-feed/section/{key}); this is the screen it feeds.
 */
export default function BrowseFeedSectionScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const params = useLocalSearchParams<{ section?: string; title?: string }>();
  const sectionKey = parseParam(params.section);
  const title = parseParam(params.title) || "Browse";

  const { fetchSection } = useHomeFeed();
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (offset: number) => {
      const page = await fetchSection(sectionKey, PAGE_SIZE, offset);
      if (!page) return;
      setProducts((prev) =>
        offset === 0 ? page.products : [...prev, ...page.products],
      );
      setHasMore(page.has_more);
    },
    [fetchSection, sectionKey],
  );

  useEffect(() => {
    if (!sectionKey) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void load(0).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load, sectionKey]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    void load(products.length).finally(() => setIsLoadingMore(false));
  }, [hasMore, isLoading, isLoadingMore, load, products.length]);

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      <CommerceSeeAllSectionHeader
        title={title}
        subtitle="Everything in this section"
        count={products.length}
      />
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title={title} />

      {isLoading && products.length === 0 ? (
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
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: rV(12) }}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: productCardGapY() }}>
              <RecommendationCard
                id={item.id}
                title={item.title}
                price={item.price}
                oldPrice={item.old_price}
                imageUrl={item.image_url}
                image={item.image_url ? { uri: item.image_url } : undefined}
                rating={item.rating}
                reviews={item.reviews}
                sourceScreen="home-feed-browse"
              />
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: rV(8),
            paddingBottom: sectionSpacing,
          }}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            <CatalogScrollFooter isLoadingMore={isLoadingMore} />
          }
          ListEmptyComponent={
            <CommerceSeeAllEmptyState
              icon="cube-outline"
              title="Nothing here yet"
              subtitle="This section has no products right now — check back soon."
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
