import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import ProductCard from "@/components/cards/ProductCard";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ImageReadyScreenGate from "@/components/media/ImageReadyScreenGate";
import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import SearchField from "@/components/search/SearchField";
import SearchFilterSheet, {
  type SearchDiscoveryMode,
  type SearchPriceRange,
  type SearchSortMode,
} from "@/components/search/SearchFilterSheet";
import { useTheme } from "@/context/ThemeContext";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { CatalogProductItem, useCatalogCategories } from "@/hooks/useCatalog";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { useSearchScreenStyles } from "@/styles/themedSearchStyles";
import { productCardGapX, rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { buildImageReadyResetKey, prefetchCommerceImages } from "@/utils/imageReady";
import { goBackOr } from "@/utils/navigation";
import {
  buildDiscoverySearchScore,
  buildDiscoverySearchText,
  normalizeSearchText,
  queryMatchesSearchableText,
} from "@/utils/searchMatching";
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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const styles = useSearchScreenStyles();
  const { colors } = useTheme();
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
    hasMore,
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
    const normalizedQuery = normalizeSearchText(query);

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

      return queryMatchesSearchableText(
        normalizedQuery,
        buildDiscoverySearchText({
          title: product.title,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          categorySlugs: product.categorySlugs,
          subcategorySlugs: product.subcategorySlugs,
          placementTags: product.placementTags,
          storeTitle: store?.title,
          storeCategory: store?.category,
          marketTitle: market?.title,
        }),
      );
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

      const leftScore = buildDiscoverySearchScore(normalizedQuery, {
        title: left.title,
        description: left.description,
        category: left.category,
        subcategory: left.subcategory,
        categorySlugs: left.categorySlugs,
        subcategorySlugs: left.subcategorySlugs,
        placementTags: left.placementTags,
        storeTitle: leftStore?.title,
        storeCategory: leftStore?.category,
        marketTitle: leftMarket?.title,
        rating: left.rating,
      });
      const rightScore = buildDiscoverySearchScore(normalizedQuery, {
        title: right.title,
        description: right.description,
        category: right.category,
        subcategory: right.subcategory,
        categorySlugs: right.categorySlugs,
        subcategorySlugs: right.subcategorySlugs,
        placementTags: right.placementTags,
        storeTitle: rightStore?.title,
        storeCategory: rightStore?.category,
        marketTitle: rightMarket?.title,
        rating: right.rating,
      });
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
    const trimmedQuery = query.trim();
    if (!trimmedQuery || filteredProducts.length > 0) {
      return;
    }
    if (!hasMore || isLoadingProducts || isLoadingMore) {
      return;
    }
    void loadMore();
  }, [
    filteredProducts.length,
    hasMore,
    isLoadingMore,
    isLoadingProducts,
    loadMore,
    query,
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
  const gridGap = productCardGapX();
  const imageReadyResetKey = useMemo(
    () => buildImageReadyResetKey(filteredProducts, numColumns * 2),
    [filteredProducts, numColumns],
  );
  const gateImages = !showIdleDiscovery && filteredProducts.length > 0;

  useEffect(() => {
    if (gateImages) {
      prefetchCommerceImages(filteredProducts, numColumns * 2);
    }
  }, [filteredProducts, gateImages, numColumns]);

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
            <Ionicons name="arrow-back" size={rMS(20)} color={colors.text} />
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
              <Ionicons name="options-outline" size={rMS(14)} color={colors.text} />
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
              <Ionicons name="swap-vertical" size={rMS(14)} color={colors.text} />
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
                <Ionicons name="close" size={rMS(12)} color={colors.link} />
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
        <ImageReadyScreenGate
          resetKey={imageReadyResetKey}
          enabled={gateImages}
          skeleton={
            <View style={{ paddingHorizontal: horizontalPadding, paddingTop: rV(20) }}>
              <ProductGridSkeleton count={4} />
            </View>
          }
        >
          <FlatList
            style={{ flex: 1 }}
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
              showIdleDiscovery ||
              isLoadingProducts ||
              isLoadingMore ||
              (Boolean(query.trim()) && hasMore) ? null : (
                <View style={{ marginTop: rV(32) }}>
                  <CommerceEmptyState
                    icon="search-outline"
                    title="No matches"
                    message="Try another keyword or loosen your filters."
                    primaryLabel="Reset search"
                    onPrimaryPress={clearAll}
                  />
                </View>
              )
            }
            removeClippedSubviews={false}
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
        </ImageReadyScreenGate>
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
