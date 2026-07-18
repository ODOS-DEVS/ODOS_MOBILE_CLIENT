import { StoreGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import StoreCard from "@/components/cards/StoreCard";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useMarketLookup, useMarkets, useStores } from "@/hooks/useCommerce";
import { productCardGapX, rS, rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";

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

  const handleMarketChange = (marketName: string) => {
    setActiveMarket(marketName);
    setIsSearching(false);
    setSearchResults([]);
    setSearchSessionKey((prev) => prev + 1);
  };

  const handleReset = () => {
    handleMarketChange("All");
  };

  const sectionTitle =
    activeMarket === "All" ? "All market stores" : `Stores in ${activeMarket}`;

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title="Markets" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          screenStyles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: sectionSpacing,
          },
        ]}
      >
        <CommerceSeeAllHero
          badgeIcon="location-outline"
          badgeLabel="Markets & hubs"
          title="Find stores by market"
          subtitle="Filter by popular markets across Ghana and discover vendors near the areas you shop most."
          accent="default"
          stats={[
            { value: marketItems.length, label: "markets" },
            { value: filteredStores.length, label: "stores shown" },
            {
              value:
                activeMarket.length > 12
                  ? `${activeMarket.slice(0, 12)}…`
                  : activeMarket,
              label: "selected",
            },
          ]}
        />

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

        <View style={screenStyles.contentBlock}>
          <CommerceSeeAllSectionHeader
            title={sectionTitle}
            subtitle={
              isSearching
                ? `${filteredStores.length} search result${filteredStores.length === 1 ? "" : "s"}`
                : "Tap a market above to narrow the list"
            }
            count={filteredStores.length}
          />

          {isLoadingMarkets || isLoadingStores ? (
            <StoreGridSkeleton />
          ) : filteredStores.length === 0 ? (
            <CommerceSeeAllEmptyState
              icon="location-outline"
              title="No stores here yet"
              subtitle="Try another market or reset to see all stores."
            />
          ) : (
            <FlatList
              data={filteredStores}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ columnGap: productCardGapX() }}
              renderItem={({ item }) => (
                <StoreCard
                  {...item}
                  cardWidth={gridCardWidth(2, productCardGapX())}
                  horizontalSpacing={0}
                  category={(item as { market?: string }).market ?? item.category}
                />
              )}
              contentContainerStyle={{ paddingTop: rV(4) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MarketScreen;
