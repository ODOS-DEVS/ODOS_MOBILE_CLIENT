import RecommendationCard from "@/components/cards/RecommendationCard";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  commerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  type CatalogProductItem,
  useRecommendedProducts,
} from "@/hooks/useCatalog";
import { rV, useResponsive } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";

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
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [activeFilter, setActiveFilter] =
    useState<RecommendationFilter>("all");
  const [isSearching, setIsSearching] = useState(false);
  const { products: catalogProducts, isLoading, error } = useRecommendedProducts({
    limit: 24,
  });
  const [searchResults, setSearchResults] = useState<CatalogProductItem[]>([]);

  const allProducts = catalogProducts;
  const freshProducts = useMemo(
    () => filterProducts(allProducts, "fresh"),
    [allProducts],
  );
  const topRatedProducts = useMemo(
    () => filterProducts(allProducts, "topRated"),
    [allProducts],
  );
  const dealProducts = useMemo(
    () => filterProducts(allProducts, "deals"),
    [allProducts],
  );
  const budgetProducts = useMemo(
    () => filterProducts(allProducts, "budget"),
    [allProducts],
  );

  const sourceProducts = isSearching ? searchResults : allProducts;
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
      { key: "all" as const, label: "All", count: allProducts.length },
      { key: "fresh" as const, label: "Fresh picks", count: freshProducts.length },
      {
        key: "topRated" as const,
        label: "Top rated",
        count: topRatedProducts.length,
      },
      { key: "deals" as const, label: "Deals", count: dealProducts.length },
      { key: "budget" as const, label: "Under ₵100", count: budgetProducts.length },
    ],
    [
      allProducts.length,
      budgetProducts.length,
      dealProducts.length,
      freshProducts.length,
      topRatedProducts.length,
    ],
  );

  return (
    <View style={commerceSeeAllScreenStyles.screen}>
      <ProfileHeader title="Recommendations" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          commerceSeeAllScreenStyles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: sectionSpacing,
          },
        ]}
      >
        <CommerceSeeAllHero
          badgeIcon="sparkles-outline"
          badgeLabel="Curated for you"
          title="Smarter picks from across ODOS"
          subtitle="Explore strong-rated items, live deals, and fresh products in one calmer shopping flow."
          accent="gold"
          stats={[
            { value: allProducts.length, label: "live picks" },
            { value: topRatedProducts.length, label: "top rated" },
            { value: dealProducts.length, label: "deals now" },
          ]}
        />

        <CommerceSeeAllSearch
          data={allProducts}
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
          placeholder="Search recommendations, deals, or categories"
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

        <View style={commerceSeeAllScreenStyles.contentBlock}>
          <CommerceSeeAllSectionHeader
            title={activeFilterLabel}
            subtitle={
              displayed.length > 0
                ? `${displayed.length} item${displayed.length === 1 ? "" : "s"} ready to explore`
                : isSearching
                  ? "Try a broader search or switch filters"
                  : "New picks appear as more products are curated"
            }
            count={displayed.length}
          />

          {isLoading && allProducts.length === 0 ? (
            <ProductListSkeleton count={5} />
          ) : displayed.length === 0 ? (
            <CommerceSeeAllEmptyState
              icon="sparkles-outline"
              title={
                error ? "We couldn't load recommendations" : "Nothing here yet"
              }
              subtitle={
                error
                  ? "The live catalog is unavailable right now. Try again in a moment."
                  : isSearching
                    ? "Try a broader search or switch to another recommendation view."
                    : "New recommendation matches will appear here as more products are curated."
              }
            />
          ) : (
            <FlatList
              data={displayed}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
              renderItem={({ item }) => <RecommendationCard {...item} />}
              contentContainerStyle={{ paddingTop: rV(4), paddingBottom: rV(8) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
