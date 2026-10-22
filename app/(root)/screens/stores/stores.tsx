import StoreCard from "@/components/cards/StoreCard";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllListFooter,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import { NetworkErrorState } from "@/components/empty/NetworkErrorState";
import { StoreGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import { useStores } from "@/hooks/useCommerce";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { usePagedList } from "@/hooks/usePagedList";
import { productCardGapX, rS, rV, useResponsive } from "@/styles/responsive";
import { formatDistanceKm, sortStoresByDistance } from "@/utils/location";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

/**
 * Every store, as one scrolling grid.
 *
 * The FlatList is the screen's own scroller rather than a `scrollEnabled=false`
 * list inside a ScrollView. That nesting is what made the screen mount every
 * store card at once — with a few hundred vendors it meant hundreds of images
 * decoding before the first row was usable. As the root list it windows rows,
 * and `onEndReached` reveals the next page when you actually reach the bottom.
 */

const PAGE_SIZE = 10;

const normalizeStoreCategory = (value?: string) => {
  const v = (value ?? "").toLowerCase();
  if (v.includes("lady") || v.includes("women") || v.includes("female")) return "Ladies";
  if (v.includes("gent") || v.includes("men") || v.includes("male")) return "Gents";
  if (v.includes("grocery") || v.includes("grocer")) return "Groceries";
  return "Others";
};

const StoreScreen = () => {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing, gridCardWidth } = useResponsive();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [sortMode, setSortMode] = useState<"default" | "near_me">("default");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { stores: storeItems, isLoading, error, errorKind, refresh } = useStores({});
  const { coords, isLoading: isLoadingLocation, refresh: refreshLocation } =
    useDeviceLocation(sortMode === "near_me");
  const [searchResults, setSearchResults] = useState(storeItems);
  const [searchSessionKey, setSearchSessionKey] = useState(0);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(storeItems.map((store) => normalizeStoreCategory(store.category))),
      ).filter(Boolean),
    ],
    [storeItems],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("All", storeItems.length);
    for (const category of categories) {
      if (category === "All") continue;
      counts.set(
        category,
        storeItems.filter((store) => normalizeStoreCategory(store.category) === category)
          .length,
      );
    }
    return counts;
  }, [categories, storeItems]);

  const filterChips = useMemo(
    () =>
      categories.map((category) => ({
        key: category,
        label: category,
        count: categoryCounts.get(category) ?? 0,
      })),
    [categories, categoryCounts],
  );

  const filteredByCategory = useMemo(() => {
    if (activeCategory === "All") return storeItems;
    return storeItems.filter(
      (store) => normalizeStoreCategory(store.category) === activeCategory,
    );
  }, [activeCategory, storeItems]);

  const displayedStores = useMemo(() => {
    const base = isSearching ? searchResults : filteredByCategory;
    if (sortMode !== "near_me" || !coords) {
      return base.map((store) => ({ store, distanceLabel: null as string | null }));
    }
    return sortStoresByDistance(base, coords).map(({ store, distanceKm }) => ({
      store,
      distanceLabel: formatDistanceKm(distanceKm),
    }));
  }, [coords, filteredByCategory, isSearching, searchResults, sortMode]);

  // Keyed on everything that changes the result set, so switching filter or
  // searching starts again from the first page.
  const paged = usePagedList(displayedStores, {
    pageSize: PAGE_SIZE,
    key: `${activeCategory}-${sortMode}-${isSearching ? `s${searchSessionKey}` : "browse"}`,
  });

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    setIsSearching(false);
    setSearchSessionKey((prev) => prev + 1);
    setSearchResults([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const showSkeleton = isLoading && storeItems.length === 0;
  const showError = Boolean(error) && storeItems.length === 0;

  const listHeader = (
    <View style={{ gap: rV(4) }}>
      <CommerceSeeAllSearch
        key={`${activeCategory}-${searchSessionKey}`}
        data={filteredByCategory}
        onStartSearch={() => setIsSearching(true)}
        onResults={(results) => {
          setIsSearching(true);
          setSearchResults(results);
        }}
        placeholder="Search stores, designers, or categories"
        searchKeys={["title", "category", "subtitle", "name"]}
      />

      <CommerceFilterChips
        chips={filterChips}
        activeKey={activeCategory}
        onChange={handleCategoryPress}
      />

      <View style={{ flexDirection: "row", gap: rS(8), marginBottom: rV(8) }}>
        <DiscoveryFilterChip
          label="All stores"
          active={sortMode === "default"}
          onPress={() => setSortMode("default")}
        />
        <DiscoveryFilterChip
          label={isLoadingLocation ? "Finding you…" : "Near me"}
          active={sortMode === "near_me"}
          onPress={() => {
            setSortMode("near_me");
            void refreshLocation();
          }}
        />
      </View>

      {showSkeleton || showError ? null : (
        <CommerceSeeAllSectionHeader
          title={isSearching ? "Search results" : "Browse stores"}
          subtitle={
            isSearching
              ? `${displayedStores.length} match${displayedStores.length === 1 ? "" : "es"} for your search`
              : activeCategory === "All"
                ? "All stores available right now"
                : `Showing ${activeCategory.toLowerCase()} stores`
          }
          count={displayedStores.length}
        />
      )}

      {showSkeleton ? <StoreGridSkeleton /> : null}
      {showError ? (
        <NetworkErrorState kind={errorKind} onRetry={() => void refresh()} />
      ) : null}
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title="Stores" />

      <FlatList
        data={showSkeleton || showError ? [] : paged.items}
        keyExtractor={(item) => item.store.id}
        numColumns={2}
        columnWrapperStyle={{ columnGap: productCardGapX() }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          screenStyles.scrollContent,
          { paddingHorizontal: horizontalPadding, paddingBottom: sectionSpacing },
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          showSkeleton || showError ? null : (
            <CommerceSeeAllEmptyState
              icon="storefront-outline"
              title="No stores match your filters"
              subtitle="Try another category or clear the search to see more options."
            />
          )
        }
        ListFooterComponent={
          <CommerceSeeAllListFooter
            hasMore={paged.hasMore}
            shownCount={paged.items.length}
            totalCount={paged.total}
            noun="stores"
          />
        }
        onEndReached={() => {
          if (paged.hasMore) {
            paged.showMore();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />
        }
        // The page window already bounds how much is mounted; these just keep
        // each scroll batch small. `removeClippedSubviews` is deliberately not
        // used — it still blanks cells with images on some Android builds.
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
        windowSize={7}
        renderItem={({ item }) => (
          <StoreCard
            {...item.store}
            category={normalizeStoreCategory(item.store.category)}
            city={item.distanceLabel ?? item.store.city}
            cardWidth={gridCardWidth(2, productCardGapX())}
            horizontalSpacing={0}
          />
        )}
      />
    </View>
  );
};

export default StoreScreen;
