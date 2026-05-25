import { StoreGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import StoreCard from "@/components/cards/StoreCard";
import {
  CommerceFilterChips,
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSearch,
  CommerceSeeAllSectionHeader,
  commerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useStores } from "@/hooks/useCommerce";
import { rS, rV, useResponsive } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";

const normalizeStoreCategory = (value?: string) => {
  const v = (value ?? "").toLowerCase();
  if (v.includes("lady") || v.includes("women") || v.includes("female"))
    return "Ladies";
  if (v.includes("gent") || v.includes("men") || v.includes("male"))
    return "Gents";
  if (v.includes("grocery") || v.includes("grocer")) return "Groceries";
  return "Others";
};

const StoreScreen = () => {
  const { horizontalPadding, sectionSpacing, gridCardWidth } = useResponsive();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const { stores: storeItems, isLoading } = useStores({});
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
        storeItems.filter(
          (store) => normalizeStoreCategory(store.category) === category,
        ).length,
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

  const displayedStores = isSearching ? searchResults : filteredByCategory;

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    setIsSearching(false);
    setSearchSessionKey((prev) => prev + 1);
    setSearchResults([]);
  };

  const ratedCount = useMemo(
    () => storeItems.filter((store) => (store.rating ?? 0) >= 4).length,
    [storeItems],
  );

  return (
    <View style={commerceSeeAllScreenStyles.screen}>
      <ProfileHeader title="Stores" />

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
          badgeIcon="storefront-outline"
          badgeLabel="Shop local"
          title="Every store on ODOS"
          subtitle="Browse verified vendors, compare ratings, and jump straight into a store you trust."
          accent="teal"
          stats={[
            { value: storeItems.length, label: "stores" },
            { value: categories.length - 1, label: "categories" },
            { value: ratedCount, label: "top rated" },
          ]}
        />

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

        <View style={commerceSeeAllScreenStyles.contentBlock}>
          <CommerceSeeAllSectionHeader
            title="Browse stores"
            subtitle={
              isSearching
                ? `${displayedStores.length} match${displayedStores.length === 1 ? "" : "es"} for your search`
                : activeCategory === "All"
                  ? "All stores available right now"
                  : `Showing ${activeCategory.toLowerCase()} stores`
            }
            count={displayedStores.length}
          />

          {isLoading && storeItems.length === 0 ? (
            <StoreGridSkeleton />
          ) : displayedStores.length === 0 ? (
            <CommerceSeeAllEmptyState
              icon="storefront-outline"
              title="No stores match your filters"
              subtitle="Try another category or clear the search to see more options."
            />
          ) : (
            <FlatList
              data={displayedStores}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ columnGap: rS(12) }}
              renderItem={({ item }) => (
                <StoreCard
                  {...item}
                  category={normalizeStoreCategory(item.category)}
                  cardWidth={gridCardWidth(2, rS(12))}
                  horizontalSpacing={0}
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

export default StoreScreen;
