import RecommendationCard from "@/components/cards/RecommendationCard";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { SearchBar } from "@/components/SearchBar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import {
  type CatalogProductItem,
  useRecommendedProducts,
} from "@/hooks/useCatalog";
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
    <View style={styles.container}>
      <ProfileHeader title="Recommendations" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: sectionSpacing,
          paddingTop: rV(8),
        }}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons
              name="sparkles-outline"
              size={rMS(14)}
              color="#8A6A2E"
            />
            <Text style={styles.heroBadgeText}>Curated for you</Text>
          </View>

          <Text style={styles.heroTitle}>Smarter picks from across ODOS</Text>
          <Text style={styles.heroSubtitle}>
            Explore strong-rated items, live deals, and fresh products pulled
            together into one calmer shopping flow.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{allProducts.length}</Text>
              <Text style={styles.heroStatLabel}>live picks</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{topRatedProducts.length}</Text>
              <Text style={styles.heroStatLabel}>top rated</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{dealProducts.length}</Text>
              <Text style={styles.heroStatLabel}>deals now</Text>
            </View>
          </View>
        </View>

        <SearchBar
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
          placeholder="Search recommended products, deals, categories..."
          searchKeys={[
            "title",
            "category",
            "subcategory",
            "reviews",
            "discount",
          ]}
          containerStyle={{ marginTop: rV(14) }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterChips.map((chip) => {
            const selected = chip.key === activeFilter;
            return (
              <TouchableOpacity
                key={chip.key}
                activeOpacity={0.9}
                style={[
                  styles.filterChip,
                  selected ? styles.filterChipActive : null,
                ]}
                onPress={() => setActiveFilter(chip.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selected ? styles.filterChipTextActive : null,
                  ]}
                >
                  {chip.label}
                </Text>
                <View
                  style={[
                    styles.filterCountPill,
                    selected ? styles.filterCountPillActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selected ? styles.filterCountTextActive : null,
                    ]}
                  >
                    {chip.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ marginTop: sectionSpacing }}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{activeFilterLabel}</Text>
              <Text style={styles.sectionSubtitle}>
                {displayed.length} item{displayed.length === 1 ? "" : "s"} ready
                to explore
              </Text>
            </View>
          </View>

          {isLoading && allProducts.length === 0 ? (
            <ProductListSkeleton count={5} />
          ) : displayed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {error ? "We couldn't load recommendations" : "Nothing here yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {error
                  ? "The live catalog is unavailable right now. Try again in a moment."
                  : isSearching
                  ? "Try a broader search or switch to another recommendation view."
                  : "New recommendation matches will appear here as more products are curated."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayed}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
              renderItem={({ item }) => <RecommendationCard {...item} />}
              contentContainerStyle={{ paddingTop: rV(12), paddingBottom: rV(8) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: rS(999),
    backgroundColor: "#F6EFE1",
  },
  heroBadgeText: {
    fontSize: rMS(11),
    fontFamily: Fonts.title,
    color: "#8A6A2E",
    letterSpacing: 0.25,
  },
  heroTitle: {
    marginTop: rV(12),
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroSubtitle: {
    marginTop: rV(8),
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(19),
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: rV(16),
    gap: rS(10),
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  heroStatLabel: {
    marginTop: rV(4),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  heroDivider: {
    width: 1,
    height: rV(28),
    backgroundColor: "#E2E8F0",
  },
  filterRow: {
    paddingTop: rV(16),
    paddingBottom: rV(2),
    gap: rS(10),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    borderRadius: rS(999),
    backgroundColor: AppColors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9E0E8",
  },
  filterChipActive: {
    backgroundColor: "#EEF2F6",
    borderColor: "#B9C5D3",
  },
  filterChipText: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.secondary,
  },
  filterChipTextActive: {
    color: AppColors.text,
  },
  filterCountPill: {
    minWidth: rS(24),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rS(999),
    paddingHorizontal: rS(8),
    paddingVertical: rV(2),
    backgroundColor: "#F3F5F8",
  },
  filterCountPillActive: {
    backgroundColor: "#DCE4ED",
  },
  filterCountText: {
    fontSize: rMS(11),
    fontFamily: Fonts.titleBold,
    color: AppColors.secondary,
  },
  filterCountTextActive: {
    color: AppColors.text,
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
  sectionSubtitle: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  emptyState: {
    marginTop: rV(16),
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    paddingVertical: rV(22),
    paddingHorizontal: rS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  emptySubtitle: {
    marginTop: rV(7),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(18),
  },
});
