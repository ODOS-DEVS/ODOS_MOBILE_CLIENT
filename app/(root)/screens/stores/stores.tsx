import ScreenLoader from "@/components/loaders/ScreenLoader";
import StoreCard from "@/components/cards/StoreCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import { Stores } from "@/constants/Data";
import { useStores } from "@/hooks/useCommerce";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const normalizeStoreCategory = (value?: string) => {
  const v = (value ?? "").toLowerCase();
  if (v.includes("lady") || v.includes("women") || v.includes("female"))
    return "Ladies";
  if (v.includes("gent") || v.includes("men") || v.includes("male"))
    return "Gents";
  if (v.includes("grocery") || v.includes("grocer")) return "Groceries";
  return "Others";
};

const categoryOptions = [
  "All",
  "Ladies",
  "Gents",
  "Groceries",
  "kids",
  "Automobile",
  "Beauty",
  "Others",
] as const;

const StoreScreen = () => {
  const { horizontalPadding, sectionSpacing, gridCardWidth } = useResponsive();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const fallbackStores = useMemo(
    () =>
      Stores.map((item) => ({
        id: item.id,
        slug: item.title.toLowerCase().replace(/\s+/g, "-"),
        title: item.title,
        category: item.category,
        image: item.image,
        rating: item.rating,
        marketSlug: item.market?.toLowerCase(),
      })),
    [],
  );
  const { stores: storeItems, isLoading } = useStores({ fallback: fallbackStores });
  const [searchResults, setSearchResults] = useState(storeItems);
  const [searchSessionKey, setSearchSessionKey] = useState(0);

  const categories = useMemo(() => [...categoryOptions], []);

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

  return (
    <View style={styles.container}>
      <ProfileHeader
        title="Stores"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: sectionSpacing,
          paddingTop: rV(12),
        }}
      >
        <SearchBar
          key={`${activeCategory}-${searchSessionKey}`}
          data={filteredByCategory}
          onStartSearch={() => setIsSearching(true)}
          onResults={(results) => {
            setIsSearching(true);
            setSearchResults(results);
          }}
          placeholder="Search stores, designers, categories"
          containerStyle={{ marginTop: rV(14) }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={{ marginTop: rV(12) }}
        >
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text
                  style={[styles.chipLabel, isActive && styles.chipLabelActive]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ marginTop: sectionSpacing }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse stores</Text>
          </View>

          {isLoading ? (
            <ScreenLoader label="Loading stores..." />
          ) : displayedStores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={rMS(22)}
                color={AppColors.subtext[100]}
              />
              <Text style={styles.emptyTitle}>
                No stores match your filters
              </Text>
              <Text style={styles.emptySubtitle}>
                Try another category or clear the search to see more options.
              </Text>
            </View>
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
              contentContainerStyle={{ paddingTop: rV(12) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  mapButton: {
    width: rMS(36),
    height: rMS(36),
    borderRadius: rMS(12),
    backgroundColor: "#EFF3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroEyebrow: {
    fontSize: rMS(11),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: rV(8),
    fontSize: rMS(17),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroSubtitle: {
    marginTop: rV(6),
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(12),
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primary,
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    borderRadius: rMS(10),
    marginRight: rS(8),
  },
  primaryBtnText: {
    marginLeft: rS(6),
    fontSize: rMS(12),
    fontFamily: Fonts.titleBold,
    color: AppColors.white,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    borderRadius: rMS(10),
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8DEE6",
  },
  secondaryBtnText: {
    marginLeft: rS(6),
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: rS(2),
  },
  chip: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(80),
    backgroundColor: "#EEF2F5",
    marginRight: rS(10),
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  chipLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  chipLabelActive: {
    color: AppColors.white,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    borderRadius: rMS(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E1E6ED",
  },
  statIconWrap: {
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(8),
    backgroundColor: "#EEF2F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(10),
  },
  statTextWrap: {
    flex: 1,
  },
  statValue: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  statLabel: {
    marginTop: rV(2),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  sectionAction: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
  },
  emptyState: {
    marginTop: rV(16),
    backgroundColor: AppColors.white,
    borderRadius: rMS(12),
    paddingVertical: rV(24),
    paddingHorizontal: rS(14),
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  emptyTitle: {
    marginTop: rV(10),
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  emptySubtitle: {
    marginTop: rV(6),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(17),
  },
});
