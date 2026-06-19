import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import ProductCard from "@/components/cards/ProductCard";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import SearchField from "@/components/search/SearchField";
import SearchFilterSheet, {
  type SearchDiscoveryMode,
  type SearchPriceRange,
  type SearchSortMode,
} from "@/components/search/SearchFilterSheet";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { CatalogProductItem, useCatalogCategories } from "@/hooks/useCatalog";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import {
  BEHAVIOR_EVENT_TYPES,
  trackBehaviorEvent,
} from "@/services/behaviorTracking";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURED_SUGGESTIONS = ["Sneakers", "Flash Sale", "Beauty", "Phones", "Fresh Food"];

function normalizeValue(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchesPriceRange(price: number | undefined, range: SearchPriceRange) {
  if (typeof price !== "number") {
    return range === "all";
  }
  switch (range) {
    case "under_100":
      return price < 100;
    case "100_250":
      return price >= 100 && price <= 250;
    case "250_500":
      return price > 250 && price <= 500;
    case "500_plus":
      return price > 500;
    default:
      return true;
  }
}

function buildSearchScore(
  product: CatalogProductItem,
  query: string,
  storeTitle: string,
  marketTitle: string,
) {
  if (!query) return 0;
  const title = (product.title ?? "").toLowerCase();
  const description = (product.description ?? "").toLowerCase();
  const category = (product.category ?? "").toLowerCase();
  const subcategory = (product.subcategory ?? "").toLowerCase();
  const placementTags = (product.placementTags ?? []).join(" ").toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const terms = normalizedQuery.split(" ").filter(Boolean);

  let score = 0;
  if (title.includes(normalizedQuery)) score += 12;
  if (category.includes(normalizedQuery) || subcategory.includes(normalizedQuery)) score += 8;
  if (storeTitle.includes(normalizedQuery) || marketTitle.includes(normalizedQuery)) score += 6;
  if (description.includes(normalizedQuery)) score += 4;
  if (placementTags.includes(normalizedQuery)) score += 3;

  for (const term of terms) {
    if (title.includes(term)) score += 3;
    if (description.includes(term)) score += 2;
    if (category.includes(term) || subcategory.includes(term)) score += 2;
    if (storeTitle.includes(term) || marketTitle.includes(term)) score += 1;
  }
  if (typeof product.rating === "number") score += product.rating / 10;
  return score;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, responsiveColumns, gridCardWidth } = useResponsive();
  const params = useLocalSearchParams<{
    query?: string;
    category?: string;
    subcategory?: string;
    market?: string;
    store?: string;
    mode?: SearchDiscoveryMode;
  }>();

  const [query, setQuery] = useState(params.query ?? "");
  const [selectedCategory, setSelectedCategory] = useState(normalizeValue(params.category));
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    normalizeValue(params.subcategory),
  );
  const [selectedMarket, setSelectedMarket] = useState(params.market ?? "");
  const [selectedStore, setSelectedStore] = useState(params.store ?? "");
  const [selectedMode, setSelectedMode] = useState<SearchDiscoveryMode>(params.mode ?? "all");
  const [selectedSort, setSelectedSort] = useState<SearchSortMode>("relevance");
  const [selectedPriceRange, setSelectedPriceRange] = useState<SearchPriceRange>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catalogFilters = useMemo(() => {
    const filters: {
      category?: string;
      subcategory?: string;
      storeId?: string;
      section?: string;
      placement?: string;
    } = {};

    if (selectedCategory) {
      filters.category = selectedCategory;
    }
    if (selectedSubcategory) {
      filters.subcategory = selectedSubcategory;
    }
    if (selectedStore) {
      filters.storeId = selectedStore;
    }
    if (selectedMode === "flash-sale") {
      filters.placement = "flash-sale";
    }
    if (selectedMode === "popular") {
      filters.section = "popular";
    }

    return filters;
  }, [
    selectedCategory,
    selectedMode,
    selectedStore,
    selectedSubcategory,
  ]);

  const {
    products,
    isLoading: isLoadingProducts,
    isLoadingMore,
    loadMore,
    refresh,
  } = useInfiniteCatalogProducts(catalogFilters);
  const { categories, isLoading: isLoadingCategories } = useCatalogCategories();
  const { stores, isLoading: isLoadingStores } = useStores({});
  const { markets, isLoading: isLoadingMarkets } = useMarkets();

  const categoryLookup = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  );
  const marketLookup = useMemo(
    () => new Map(markets.map((market) => [market.slug, market])),
    [markets],
  );
  const storeLookup = useMemo(
    () => new Map(stores.map((store) => [store.id, store])),
    [stores],
  );

  const subcategoryOptions = useMemo(() => {
    if (!selectedCategory) return [];
    const items = categoryLookup.get(selectedCategory)?.subcategories ?? [];
    return items.map((label) => ({
      label,
      slug: normalizeValue(label),
    }));
  }, [categoryLookup, selectedCategory]);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (selectedMarket && store.marketSlug !== selectedMarket) return false;
      if (selectedCategory) {
        const related = products.some(
          (product) =>
            product.storeId === store.id &&
            (product.categorySlugs?.includes(selectedCategory) ||
              normalizeValue(product.category) === selectedCategory),
        );
        if (!related) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedMarket, stores]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");

    const base = products.filter((product) => {
      const store = product.storeId ? storeLookup.get(product.storeId) : undefined;
      const market = store?.marketSlug ? marketLookup.get(store.marketSlug) : undefined;
      const normalizedCategorySlugs =
        product.categorySlugs?.map((item) => normalizeValue(item)) ?? [];
      const normalizedSubcategorySlugs =
        product.subcategorySlugs?.map((item) => normalizeValue(item)) ?? [];

      if (selectedMode === "flash-sale") {
        const isFlash =
          product.section === "flash-sale" || product.placementTags?.includes("flash-sale");
        if (!isFlash) return false;
      }
      if (selectedMode === "popular") {
        const isPopular =
          product.section === "popular" || product.placementTags?.includes("popular");
        if (!isPopular) return false;
      }
      if (
        selectedCategory &&
        ![normalizeValue(product.category), ...normalizedCategorySlugs].includes(selectedCategory)
      ) {
        return false;
      }
      if (
        selectedSubcategory &&
        ![normalizeValue(product.subcategory), ...normalizedSubcategorySlugs].includes(
          selectedSubcategory,
        )
      ) {
        return false;
      }
      if (selectedMarket && store?.marketSlug !== selectedMarket) return false;
      if (selectedStore && product.storeId !== selectedStore) return false;
      if (!matchesPriceRange(product.price, selectedPriceRange)) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        product.title,
        product.description,
        product.category,
        product.subcategory,
        ...(product.categorySlugs ?? []),
        ...(product.subcategorySlugs ?? []),
        ...(product.placementTags ?? []),
        store?.title,
        store?.category,
        market?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return normalizedQuery
        .split(" ")
        .filter(Boolean)
        .every((term) => searchable.includes(term));
    });

    return [...base].sort((left, right) => {
      const leftStore = left.storeId ? storeLookup.get(left.storeId) : undefined;
      const rightStore = right.storeId ? storeLookup.get(right.storeId) : undefined;
      const leftMarket = leftStore?.marketSlug
        ? marketLookup.get(leftStore.marketSlug)
        : undefined;
      const rightMarket = rightStore?.marketSlug
        ? marketLookup.get(rightStore.marketSlug)
        : undefined;

      if (selectedSort === "price_low") return (left.price ?? 0) - (right.price ?? 0);
      if (selectedSort === "price_high") return (right.price ?? 0) - (left.price ?? 0);
      if (selectedSort === "rating") return (right.rating ?? 0) - (left.rating ?? 0);
      if (selectedSort === "newest") {
        return (
          new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
          new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
        );
      }

      const leftScore = buildSearchScore(
        left,
        normalizedQuery,
        leftStore?.title?.toLowerCase() ?? "",
        leftMarket?.title?.toLowerCase() ?? "",
      );
      const rightScore = buildSearchScore(
        right,
        normalizedQuery,
        rightStore?.title?.toLowerCase() ?? "",
        rightMarket?.title?.toLowerCase() ?? "",
      );
      if (rightScore !== leftScore) return rightScore - leftScore;
      return (
        new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
        new Date(left.updatedAt ?? left.createdAt ?? 0).getTime()
      );
    });
  }, [
    marketLookup,
    products,
    query,
    selectedCategory,
    selectedMarket,
    selectedMode,
    selectedPriceRange,
    selectedSort,
    selectedStore,
    selectedSubcategory,
    storeLookup,
  ]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      trackBehaviorEvent({
        eventType: BEHAVIOR_EVENT_TYPES.SEARCH_QUERY,
        searchQuery: normalized,
        sourceScreen: "search",
        metadata: {
          result_count: filteredProducts.length,
        },
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [filteredProducts.length, query]);

  const filterCount = useMemo(() => {
    return [
      selectedCategory,
      selectedSubcategory,
      selectedMarket,
      selectedStore,
      selectedMode !== "all" ? selectedMode : "",
      selectedPriceRange !== "all" ? selectedPriceRange : "",
      selectedSort !== "relevance" ? selectedSort : "",
    ].filter(Boolean).length;
  }, [
    selectedCategory,
    selectedMarket,
    selectedMode,
    selectedPriceRange,
    selectedSort,
    selectedStore,
    selectedSubcategory,
  ]);

  const activeFilterPills = useMemo(() => {
    const pills: Array<{ key: string; label: string; onClear: () => void }> = [];

    if (selectedMode !== "all") {
      pills.push({
        key: "mode",
        label: selectedMode === "flash-sale" ? "Flash sale" : "Popular",
        onClear: () => setSelectedMode("all"),
      });
    }
    if (selectedCategory) {
      const title = categoryLookup.get(selectedCategory)?.title ?? selectedCategory;
      pills.push({
        key: "category",
        label: title,
        onClear: () => {
          setSelectedCategory("");
          setSelectedSubcategory("");
        },
      });
    }
    if (selectedSubcategory) {
      const label =
        subcategoryOptions.find((item) => item.slug === selectedSubcategory)?.label ??
        selectedSubcategory;
      pills.push({ key: "sub", label, onClear: () => setSelectedSubcategory("") });
    }
    if (selectedMarket) {
      pills.push({
        key: "market",
        label: marketLookup.get(selectedMarket)?.title ?? selectedMarket,
        onClear: () => {
          setSelectedMarket("");
          setSelectedStore("");
        },
      });
    }
    if (selectedStore) {
      pills.push({
        key: "store",
        label: storeLookup.get(selectedStore)?.title ?? "Store",
        onClear: () => setSelectedStore(""),
      });
    }
    if (selectedPriceRange !== "all") {
      const priceLabels: Record<SearchPriceRange, string> = {
        all: "Any",
        under_100: "Under ₵100",
        "100_250": "₵100–250",
        "250_500": "₵250–500",
        "500_plus": "₵500+",
      };
      pills.push({
        key: "price",
        label: priceLabels[selectedPriceRange],
        onClear: () => setSelectedPriceRange("all"),
      });
    }
    return pills;
  }, [
    categoryLookup,
    marketLookup,
    selectedCategory,
    selectedMarket,
    selectedMode,
    selectedPriceRange,
    selectedStore,
    selectedSubcategory,
    storeLookup,
    subcategoryOptions,
  ]);

  const isLoading =
    isLoadingProducts || isLoadingCategories || isLoadingStores || isLoadingMarkets;
  const showIdleDiscovery = query.trim().length === 0 && filterCount === 0;
  const numColumns = responsiveColumns;
  const gridGap = rS(8);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedMarket("");
    setSelectedStore("");
    setSelectedMode("all");
    setSelectedSort("relevance");
    setSelectedPriceRange("all");
  };

  const clearAll = () => {
    setQuery("");
    clearFilters();
  };

  const sortLabel =
    selectedSort === "relevance"
      ? "Best match"
      : selectedSort === "newest"
        ? "Newest"
        : selectedSort === "price_low"
          ? "Price ↑"
          : selectedSort === "price_high"
            ? "Price ↓"
            : "Top rated";

  const listHeader = showIdleDiscovery ? (
    <View style={{ paddingHorizontal: horizontalPadding, paddingTop: rV(16) }}>
      <Text style={styles.idleLabel}>Trending</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionRow}
      >
        {FEATURED_SUGGESTIONS.map((suggestion) => (
          <DiscoveryFilterChip
            key={suggestion}
            label={suggestion}
            active={false}
            onPress={() => setQuery(suggestion)}
          />
        ))}
      </ScrollView>

      {categories.length > 0 ? (
        <>
          <Text style={[styles.idleLabel, { marginTop: rV(18) }]}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionRow}
          >
            {categories.slice(0, 10).map((category) => (
              <DiscoveryFilterChip
                key={category.id}
                label={category.title}
                active={false}
                onPress={() => {
                  setSelectedCategory(category.slug);
                  setFiltersOpen(true);
                }}
              />
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + rV(8), rV(40)),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => goBackOr(router, { fallback: "/(root)/(tabs)" })}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={rMS(20)} color={AppColors.text} />
          </TouchableOpacity>

          <SearchField
            embedded
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="What are you looking for?"
          />
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.resultCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </Text>

          <View style={styles.toolbarActions}>
            <TouchableOpacity
              style={styles.toolbarChip}
              activeOpacity={0.85}
              onPress={() => setFiltersOpen(true)}
            >
              <Ionicons name="options-outline" size={rMS(14)} color={AppColors.text} />
              <Text style={styles.toolbarChipText}>Filters</Text>
              {filterCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{filterCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarChip}
              activeOpacity={0.85}
              onPress={() => setFiltersOpen(true)}
            >
              <Ionicons name="swap-vertical" size={rMS(14)} color={AppColors.text} />
              <Text style={styles.toolbarChipText} numberOfLines={1}>
                {sortLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeFilterPills.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillScroller}
            contentContainerStyle={styles.pillRow}
          >
            {activeFilterPills.map((pill) => (
              <TouchableOpacity
                key={pill.key}
                style={styles.activePill}
                activeOpacity={0.82}
                onPress={pill.onClear}
              >
                <Text style={styles.activePillText}>{pill.label}</Text>
                <Ionicons name="close" size={rMS(12)} color={AppColors.primary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={clearFilters} activeOpacity={0.82}>
              <Text style={styles.clearPillsText}>Clear</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </View>

      {isLoading && products.length === 0 ? (
        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: rV(20) }}>
          <ProductGridSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          ListHeaderComponent={listHeader}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.45}
          ListFooterComponent={<CatalogScrollFooter isLoadingMore={isLoadingMore} />}
          refreshing={isLoadingProducts && products.length > 0}
          onRefresh={() => void refresh()}
          columnWrapperStyle={numColumns > 1 ? { columnGap: gridGap } : undefined}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: showIdleDiscovery ? 0 : rV(12),
            paddingBottom: insets.bottom + rV(24),
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View style={{ marginTop: rV(32) }}>
              <CommerceEmptyState
                icon="search-outline"
                title="No matches"
                message="Try another keyword or loosen your filters."
                primaryLabel="Reset search"
                onPrimaryPress={clearAll}
              />
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              {...item}
              cardWidth={gridCardWidth(numColumns, gridGap)}
              horizontalSpacing={0}
              sourceScreen="search_results"
              storeId={item.storeId}
              searchQuery={query}
              trackingEvent="search_result_click"
            />
          )}
        />
      )}

      <SearchFilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        selectedPriceRange={selectedPriceRange}
        onPriceRangeChange={setSelectedPriceRange}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={setSelectedSubcategory}
        subcategories={subcategoryOptions}
        categories={categories.map((c) => ({ id: c.id, slug: c.slug, title: c.title }))}
        selectedMarket={selectedMarket}
        onMarketChange={setSelectedMarket}
        markets={markets.map((m) => ({ id: m.id, slug: m.slug, title: m.title }))}
        selectedStore={selectedStore}
        onStoreChange={setSelectedStore}
        stores={filteredStores.map((s) => ({ id: s.id, title: s.title }))}
        onReset={clearFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingBottom: rV(10),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  backButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  toolbar: {
    marginTop: rV(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  resultCount: {
    fontSize: rMS(13),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  toolbarChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(10),
    paddingVertical: rV(7),
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  toolbarChipText: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.text,
    maxWidth: rS(88),
  },
  badge: {
    minWidth: rS(18),
    height: rS(18),
    borderRadius: rS(9),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(4),
  },
  badgeText: {
    fontSize: rMS(10),
    fontFamily: Fonts.titleBold,
    color: "#FFFFFF",
  },
  pillScroller: {
    marginTop: rV(10),
    marginHorizontal: -rS(4),
  },
  pillRow: {
    gap: rS(8),
    paddingRight: rS(8),
    alignItems: "center",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C7D2FE",
  },
  activePillText: {
    fontSize: rMS(11.5),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  clearPillsText: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.primary,
    paddingHorizontal: rS(6),
  },
  idleLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.titleBold,
    color: "#6B7280",
    marginBottom: rV(10),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionRow: {
    gap: rS(8),
    paddingRight: rS(4),
  },
});
