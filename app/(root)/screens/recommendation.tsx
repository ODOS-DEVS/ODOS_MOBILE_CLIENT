import RecommendationCard from "@/components/cards/RecommendationCard";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { type CatalogProductItem } from "@/hooks/useCatalog";
import { useForYouRecommendations } from "@/hooks/useRecommendations";
import { rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

type RecommendationFilter = "all" | "fresh" | "topRated" | "deals" | "budget";

function getProductTimestamp(product: CatalogProductItem) {
  const rawValue = product.updatedAt ?? product.createdAt;
  if (!rawValue) {
    return 0;
  }

  const parsed = new Date(rawValue).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortByFreshness(items: CatalogProductItem[]) {
  return [...items].sort((left, right) => {
    const rightTime = getProductTimestamp(right);
    const leftTime = getProductTimestamp(left);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return (right.rating ?? 0) - (left.rating ?? 0);
  });
}

function filterProducts(
  items: CatalogProductItem[],
  filter: RecommendationFilter,
) {
  switch (filter) {
    case "fresh": {
      const freshItems = sortByFreshness(items);
      return freshItems.slice(0, Math.min(freshItems.length, 10));
    }
    case "topRated":
      return items.filter((item) => (item.rating ?? 0) >= 4.4);
    case "deals":
      return items.filter((item) => {
        const hasDiscount = Boolean(item.discount?.trim());
        const hasLowerLivePrice =
          typeof item.oldPrice === "number" &&
          typeof item.price === "number" &&
          item.oldPrice > item.price;
        return hasDiscount || hasLowerLivePrice;
      });
    case "budget":
      return items.filter(
        (item) => typeof item.price === "number" && item.price <= 100,
      );
    case "all":
    default:
      return items;
  }
}

export default function RecommendationScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [activeFilter, setActiveFilter] =
    useState<RecommendationFilter>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogProductItem[]>([]);
  const {
    feed,
    products: recommendationProducts,
    isLoading,
    error,
    refresh,
  } = useForYouRecommendations({ limit: 48 });

  const freshProducts = useMemo(
    () => filterProducts(recommendationProducts, "fresh"),
    [recommendationProducts],
  );
  const topRatedProducts = useMemo(
    () => filterProducts(recommendationProducts, "topRated"),
    [recommendationProducts],
  );
  const dealProducts = useMemo(
    () => filterProducts(recommendationProducts, "deals"),
    [recommendationProducts],
  );
  const budgetProducts = useMemo(
    () => filterProducts(recommendationProducts, "budget"),
    [recommendationProducts],
  );

  const sourceProducts = isSearching ? searchResults : recommendationProducts;
  const displayed = useMemo(
    () => filterProducts(sourceProducts, activeFilter),
    [activeFilter, sourceProducts],
  );

  const activeFilterLabel = useMemo(() => {
    switch (activeFilter) {
      case "fresh":
        return "Fresh picks";
      case "topRated":
        return "Top rated";
      case "deals":
        return "Deals";
      case "budget":
        return "Budget finds";
      case "all":
      default:
        return "All recommendations";
    }
  }, [activeFilter]);

  const filterChips = useMemo(
    () => [
      {
        key: "all" as const,
        label: "All",
        count: recommendationProducts.length,
      },
      {
        key: "fresh" as const,
        label: "Fresh picks",
        count: freshProducts.length,
      },
      {
        key: "topRated" as const,
        label: "Top rated",
        count: topRatedProducts.length,
      },
      { key: "deals" as const, label: "Deals", count: dealProducts.length },
      {
        key: "budget" as const,
        label: "Under ₵100",
        count: budgetProducts.length,
      },
    ],
    [
      budgetProducts.length,
      dealProducts.length,
      freshProducts.length,
      recommendationProducts.length,
      topRatedProducts.length,
    ],
  );

  useEffect(() => {
    const requestedFilter = params.filter;
    if (
      requestedFilter === "all" ||
      requestedFilter === "fresh" ||
      requestedFilter === "topRated" ||
      requestedFilter === "deals" ||
      requestedFilter === "budget"
    ) {
      setActiveFilter(requestedFilter);
    }
  }, [params.filter]);

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      <CommerceSeeAllHero
        badgeIcon="sparkles-outline"
        badgeLabel={feed.personalized ? "Personalized" : "Curated for you"}
        title={feed.title}
        subtitle={
          feed.subtitle ??
          (feed.personalized
            ? "Picks shaped by what you browse, save, and buy on ODOS."
            : "Explore strong-rated items, live deals, and fresh products in one calmer shopping flow.")
        }
        accent="gold"
        stats={[
          { value: recommendationProducts.length, label: "live picks" },
          { value: topRatedProducts.length, label: "top rated" },
          { value: dealProducts.length, label: "deals now" },
        ]}
      />

      <CommerceSeeAllSearch
        data={recommendationProducts}
        onQueryChange={(query) => {
          const hasQuery = query.length > 0;
          setIsSearching(hasQuery);
          if (!hasQuery) {
            setSearchResults([]);
          }
        }}
        onResults={(results) => {
          setSearchResults(results as CatalogProductItem[]);
        }}
        placeholder="Search your recommendations"
        searchKeys={[
          "title",
          "category",
          "subcategory",
          "reviews",
          "discount",
        ]}
      />

      <CommerceFilterChips
        chips={filterChips}
        activeKey={activeFilter}
        onChange={(key) => setActiveFilter(key as RecommendationFilter)}
      />

      <CommerceSeeAllSectionHeader
        title={activeFilterLabel}
        subtitle={
          displayed.length > 0
            ? `${displayed.length} item${displayed.length === 1 ? "" : "s"} ready to explore`
            : isSearching
              ? "Try a broader search or switch filters"
              : "Browse more products to unlock richer personalized picks"
        }
        count={displayed.length}
      />
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title="Recommendations" />

      {isLoading && recommendationProducts.length === 0 ? (
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
          data={displayed}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />
          }
          ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
          renderItem={({ item }) => (
            <RecommendationCard
              {...item}
              badgeLabel={feed.personalized ? "For you" : "ODOS Pick"}
              sourceScreen="recommendations_hub"
              storeId={item.storeId}
              reviews={
                item.reviews !== undefined ? Number(item.reviews) : undefined
              }
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: rV(8),
            paddingBottom: sectionSpacing,
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          ListEmptyComponent={
            <CommerceSeeAllEmptyState
              icon="sparkles-outline"
              title={error ? "We couldn't load recommendations" : "Nothing here yet"}
              subtitle={
                error
                  ? "Pull to refresh, or open search to browse the full catalog."
                  : isSearching
                    ? "Try a broader search or switch to another recommendation view."
                    : "Shop, save, and buy more on ODOS to sharpen these picks."
              }
            />
          }
        />
      )}
    </View>
  );
}
