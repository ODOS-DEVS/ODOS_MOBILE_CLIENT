import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import RecommendationCard from "@/components/cards/RecommendationCard";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import ImageReadyScreenGate from "@/components/media/ImageReadyScreenGate";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { useFlashSaleEvents } from "@/hooks/useFlashSaleEvents";
import { computeSavingsPercent, isDealProduct } from "@/utils/deals";
import { formatCountdownLabel } from "@/utils/countdown";
import { productCardGapY, rV, useResponsive } from "@/styles/responsive";
import { buildImageReadyResetKey, prefetchCommerceImages } from "@/utils/imageReady";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";

type FlashFilter = "all" | "deals" | "topRated";

function formatFlashStatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return "Ended";
  }
  return formatCountdownLabel(totalSeconds, { compact: true });
}

export default function FlashSalesScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [activeFilter, setActiveFilter] = useState<FlashFilter>("all");
  const [isSearching, setIsSearching] = useState(false);
  const { primaryEvent: flashSaleEvent } = useFlashSaleEvents();
  const {
    products,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = useInfiniteCatalogProducts({
    placement: "flash-sale",
    flashEvent: flashSaleEvent?.productCount ? flashSaleEvent.slug : undefined,
  });
  const [searchResults, setSearchResults] = useState(products);

  const dealProducts = useMemo(
    () => products.filter((item) => isDealProduct(item)),
    [products],
  );
  const topRatedProducts = useMemo(
    () => products.filter((item) => (item.rating ?? 0) >= 4.4),
    [products],
  );

  const sourceProducts = isSearching ? searchResults : products;
  const displayed = useMemo(() => {
    switch (activeFilter) {
      case "deals":
        return sourceProducts.filter((item) => isDealProduct(item));
      case "topRated":
        return sourceProducts.filter((item) => (item.rating ?? 0) >= 4.4);
      case "all":
      default:
        return sourceProducts;
    }
  }, [activeFilter, sourceProducts]);

  const imageReadyResetKey = useMemo(
    () => buildImageReadyResetKey(displayed, 6),
    [displayed],
  );

  useEffect(() => {
    if (displayed.length > 0) {
      prefetchCommerceImages(displayed, 6);
    }
  }, [displayed]);

  const averageSavings = useMemo(() => {
    const savings = dealProducts
      .map((item) => computeSavingsPercent(item.price, item.oldPrice))
      .filter((value): value is number => value != null);
    if (!savings.length) {
      return 0;
    }
    return Math.round(savings.reduce((sum, value) => sum + value, 0) / savings.length);
  }, [dealProducts]);

  const filterChips = useMemo(
    () => [
      { key: "all" as const, label: "All flash sales", count: products.length },
      { key: "deals" as const, label: "Best savings", count: dealProducts.length },
      { key: "topRated" as const, label: "Top rated", count: topRatedProducts.length },
    ],
    [dealProducts.length, products.length, topRatedProducts.length],
  );

  const activeFilterLabel = useMemo(() => {
    switch (activeFilter) {
      case "deals":
        return "Best savings";
      case "topRated":
        return "Top rated flash sales";
      case "all":
      default:
        return "All flash sales";
    }
  }, [activeFilter]);

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      <CommerceSeeAllHero
        badgeIcon="flash-outline"
        badgeLabel={flashSaleEvent ? "Live event" : "Limited offers"}
        title={flashSaleEvent?.title ?? "Flash sales curated for quick wins"}
        subtitle={
          flashSaleEvent?.subtitle ??
          "Handpicked products with strong savings, updated live from the ODOS catalog."
        }
        accent="gold"
        stats={[
          { value: products.length, label: "live items" },
          { value: dealProducts.length, label: "with savings" },
          {
            value: flashSaleEvent
              ? formatFlashStatCountdown(flashSaleEvent.secondsRemaining)
              : averageSavings > 0
                ? `${averageSavings}%`
                : "—",
            label: flashSaleEvent ? "ends in" : "avg. savings",
          },
        ]}
      />

      {flashSaleEvent ? (
        <FlashSaleCountdown
          endsAt={flashSaleEvent.endsAt}
          serverSecondsRemaining={flashSaleEvent.secondsRemaining}
        />
      ) : null}

      <CommerceSeeAllSearch
        data={products}
        onStartSearch={() => setIsSearching(true)}
        onResults={(results) => {
          setIsSearching(true);
          setSearchResults(results);
        }}
        placeholder="Search flash sale products"
        searchKeys={["title", "category", "subcategory", "discount"]}
      />

      <CommerceFilterChips
        chips={filterChips}
        activeKey={activeFilter}
        onChange={(key) => setActiveFilter(key as FlashFilter)}
      />

      <CommerceSeeAllSectionHeader
        title={activeFilterLabel}
        subtitle={
          displayed.length > 0
            ? `${displayed.length} product${displayed.length === 1 ? "" : "s"} in this view`
            : "New flash sale items appear as vendors publish them"
        }
        count={displayed.length}
      />
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title="Flash Sales" />

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
      ) : displayed.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: sectionSpacing,
          }}
          ListEmptyComponent={
            <CommerceSeeAllEmptyState
              icon="flash-outline"
              title={error ? "We couldn't load flash sales" : "No flash sales yet"}
              subtitle={
                error
                  ? "The live flash sale feed is unavailable right now. Try again shortly."
                  : "Check back soon for limited-time offers from ODOS vendors."
              }
            />
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
            data={displayed}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            onEndReached={() => void loadMore()}
            onEndReachedThreshold={0.45}
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
