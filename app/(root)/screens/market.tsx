import StoreCard from "@/components/cards/StoreCard";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllListFooter,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import { StoreGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useMarketLookup, useMarkets, useStores } from "@/hooks/useCommerce";
import { usePagedList } from "@/hooks/usePagedList";
import { productCardGapX, rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";

/**
 * Stores grouped by market, as one scrolling grid.
 *
 * Same shape as the stores screen: the FlatList owns the scroll so rows are
 * windowed instead of every store in a market mounting at once, and reaching
 * the bottom reveals the next page.
 */

const PAGE_SIZE = 10;

const MarketScreen = () => {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { activeMarket: initialMarketParam, activeMarketSlug: initialMarketSlugParam } =
    useLocalSearchParams();
  const { horizontalPadding, sectionSpacing, gridCardWidth } = useResponsive();
  const initialMarket =
    typeof initialMarketParam === "string" && initialMarketParam.length
      ? initialMarketParam
      : "All";
  const [activeMarket, setActiveMarket] = useState<string>(initialMarket);
  const [isSearching, setIsSearching] = useState(false);
  const { markets: marketItems, isLoading: isLoadingMarkets } = useMarkets();
  const marketLookup = useMarketLookup(marketItems);
  const activeMarketSlug =
    typeof initialMarketSlugParam === "string" && initialMarketSlugParam.trim()
      ? initialMarketSlugParam
      : activeMarket === "All"
        ? undefined
        : marketLookup.get(activeMarket.toLowerCase());
  const { stores: fetchedStores, isLoading: isLoadingStores } = useStores({
    marketSlug: activeMarketSlug,
  });
  const [searchResults, setSearchResults] = useState(fetchedStores);
  const [searchSessionKey, setSearchSessionKey] = useState(0);

  const marketNames = useMemo(
    () => ["All", ...Array.from(new Set(marketItems.map((m) => m.title)))],
    [marketItems],
  );

  const filteredStores = useMemo(
    () => (isSearching ? searchResults : fetchedStores),
    [fetchedStores, isSearching, searchResults],
  );

  const filterChips = useMemo(
    () =>
      marketNames.map((name) => ({
        key: name,
        label: name,
        count: name === activeMarket ? filteredStores.length : undefined,
      })),
    [activeMarket, filteredStores.length, marketNames],
  );

  const handleMarketChange = useCallback((marketName: string) => {
    setActiveMarket(marketName);
    setIsSearching(false);
    setSearchResults([]);
    setSearchSessionKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (
      typeof initialMarketParam === "string" &&
      initialMarketParam.length &&
      initialMarketParam !== activeMarket
    ) {
      handleMarketChange(initialMarketParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMarketParam]);

  const paged = usePagedList(filteredStores, {
    pageSize: PAGE_SIZE,
    key: `${activeMarket}-${isSearching ? `s${searchSessionKey}` : "browse"}`,
  });

  const handleReset = () => {
    handleMarketChange("All");
  };

  const showSkeleton = isLoadingMarkets || (isLoadingStores && fetchedStores.length === 0);

  const sectionTitle =
    activeMarket === "All" ? "All market stores" : `Stores in ${activeMarket}`;

  const listHeader = (
    <View style={{ gap: rV(4) }}>
      <CommerceSeeAllSearch
        key={`${activeMarket}-${searchSessionKey}`}
        data={fetchedStores}
        onStartSearch={() => setIsSearching(true)}
        onResults={(results) => {
          setIsSearching(true);
          setSearchResults(results);
        }}
        placeholder="Search stores by name, category, or market"
        searchKeys={["title", "category", "subtitle", "name", "store"]}
      />

      <CommerceFilterChips
        chips={filterChips}
        activeKey={activeMarket}
        onChange={handleMarketChange}
        trailingAction={{ label: "Reset", onPress: handleReset }}
      />

      {showSkeleton ? null : (
        <CommerceSeeAllSectionHeader
          title={isSearching ? "Search results" : sectionTitle}
          subtitle={
            isSearching
              ? `${filteredStores.length} result${filteredStores.length === 1 ? "" : "s"}`
              : "Tap a market above to narrow the list"
          }
          count={filteredStores.length}
        />
      )}

      {showSkeleton ? <StoreGridSkeleton /> : null}
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title="Markets" />

      <FlatList
        data={showSkeleton ? [] : paged.items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ columnGap: productCardGapX() }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          screenStyles.scrollContent,
          { paddingHorizontal: horizontalPadding, paddingBottom: sectionSpacing },
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          showSkeleton ? null : (
            <CommerceSeeAllEmptyState
              icon="location-outline"
              title="No stores here yet"
              subtitle="Try another market or reset to see all stores."
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
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
        windowSize={7}
        renderItem={({ item }) => (
          <StoreCard
            {...item}
            cardWidth={gridCardWidth(2, productCardGapX())}
            horizontalSpacing={0}
            category={(item as { market?: string }).market ?? item.category}
          />
        )}
      />
    </View>
  );
};

export default MarketScreen;
