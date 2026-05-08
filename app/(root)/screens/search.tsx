import ProductCard from "@/components/cards/ProductCard";
import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { CatalogProductItem, useCatalogCategories, useCatalogProducts } from "@/hooks/useCatalog";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SortMode = "relevance" | "newest" | "price_low" | "price_high" | "rating";
type DiscoveryMode = "all" | "flash-sale" | "popular";
type PriceRange = "all" | "under_100" | "100_250" | "250_500" | "500_plus";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "relevance", label: "Best Match" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Lowest Price" },
  { value: "price_high", label: "Highest Price" },
  { value: "rating", label: "Top Rated" },
];

const DISCOVERY_OPTIONS: Array<{ value: DiscoveryMode; label: string }> = [
  { value: "all", label: "All Products" },
  { value: "flash-sale", label: "Flash Sale" },
  { value: "popular", label: "Popular" },
];

const PRICE_OPTIONS: Array<{ value: PriceRange; label: string }> = [
  { value: "all", label: "Any Price" },
  { value: "under_100", label: "Under ₵100" },
  { value: "100_250", label: "₵100 - ₵250" },
  { value: "250_500", label: "₵250 - ₵500" },
  { value: "500_plus", label: "₵500+" },
];

const FEATURED_SUGGESTIONS = [
  "Sneakers",
  "Flash Sale",
  "Fresh Food",
  "Smartphones",
  "Beauty",
];

function normalizeValue(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function humanizeResultCount(total: number) {
  if (total === 1) {
    return "1 result";
  }
  return `${total} results`;
}

function FilterPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.filterPanel}>
      <View style={styles.filterPanelHeader}>
        <Text style={styles.filterPanelTitle}>{title}</Text>
        {subtitle ? <Text style={styles.filterPanelSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function matchesPriceRange(price: number | undefined, range: PriceRange) {
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
  if (!query) {
    return 0;
  }

  const title = (product.title ?? "").toLowerCase();
  const description = (product.description ?? "").toLowerCase();
  const category = (product.category ?? "").toLowerCase();
  const subcategory = (product.subcategory ?? "").toLowerCase();
  const placementTags = (product.placementTags ?? []).join(" ").toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const terms = normalizedQuery.split(" ").filter(Boolean);

  let score = 0;
  if (title.includes(normalizedQuery)) {
    score += 12;
  }
  if (category.includes(normalizedQuery) || subcategory.includes(normalizedQuery)) {
    score += 8;
  }
  if (storeTitle.includes(normalizedQuery) || marketTitle.includes(normalizedQuery)) {
    score += 6;
  }
  if (description.includes(normalizedQuery)) {
    score += 4;
  }
  if (placementTags.includes(normalizedQuery)) {
    score += 3;
  }

  for (const term of terms) {
    if (title.includes(term)) {
      score += 3;
    }
    if (description.includes(term)) {
      score += 2;
    }
    if (category.includes(term) || subcategory.includes(term)) {
      score += 2;
    }
    if (storeTitle.includes(term) || marketTitle.includes(term)) {
      score += 1;
    }
  }

  if (typeof product.rating === "number") {
    score += product.rating / 10;
  }

  return score;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const {
    horizontalPadding,
    responsiveColumns,
    gridCardWidth,
    sectionSpacing,
  } = useResponsive();
  const params = useLocalSearchParams<{
    query?: string;
    category?: string;
    subcategory?: string;
    market?: string;
    store?: string;
    mode?: DiscoveryMode;
  }>();

  const [query, setQuery] = useState(params.query ?? "");
  const [selectedCategory, setSelectedCategory] = useState(normalizeValue(params.category));
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    normalizeValue(params.subcategory),
  );
  const [selectedMarket, setSelectedMarket] = useState(params.market ?? "");
  const [selectedStore, setSelectedStore] = useState(params.store ?? "");
  const [selectedMode, setSelectedMode] = useState<DiscoveryMode>(params.mode ?? "all");
  const [selectedSort, setSelectedSort] = useState<SortMode>("relevance");
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>("all");

  const { products, isLoading: isLoadingProducts } = useCatalogProducts({ fallback: [] });
  const { categories, isLoading: isLoadingCategories } = useCatalogCategories([]);
  const { stores, isLoading: isLoadingStores } = useStores({ fallback: [] });
  const { markets, isLoading: isLoadingMarkets } = useMarkets([]);

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

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return categoryLookup.get(selectedCategory)?.subcategories ?? [];
  }, [categoryLookup, selectedCategory]);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (selectedMarket && store.marketSlug !== selectedMarket) {
        return false;
      }

      if (selectedCategory) {
        const relatedProducts = products.filter((product) => {
          const sameStore = product.storeId === store.id;
          const sameCategory =
            product.categorySlugs?.includes(selectedCategory) ||
            normalizeValue(product.category) === selectedCategory;
          return sameStore && sameCategory;
        });
        if (relatedProducts.length === 0) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, selectedMarket, stores]);

  const suggestedCategories = useMemo(
    () => categories.slice(0, 8),
    [categories],
  );
  const selectedCategoryTitle = selectedCategory
    ? categoryLookup.get(selectedCategory)?.title ?? titleFromSlug(selectedCategory) ?? "Category"
    : null;
  const selectedSubcategoryTitle = selectedSubcategory
    ? availableSubcategories.find(
        (item) => normalizeValue(item) === selectedSubcategory,
      ) ??
      titleFromSlug(selectedSubcategory) ??
      "Subcategory"
    : null;
  const selectedMarketTitle = selectedMarket
    ? marketLookup.get(selectedMarket)?.title ?? titleFromSlug(selectedMarket) ?? "Market"
    : null;
  const selectedStoreTitle = selectedStore
    ? storeLookup.get(selectedStore)?.title ?? "Store"
    : null;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");

    const base = products.filter((product) => {
      const store = product.storeId ? storeLookup.get(product.storeId) : undefined;
      const market = store?.marketSlug ? marketLookup.get(store.marketSlug) : undefined;
      const normalizedCategorySlugs = product.categorySlugs?.map((item) => normalizeValue(item)) ?? [];
      const normalizedSubcategorySlugs = product.subcategorySlugs?.map((item) => normalizeValue(item)) ?? [];

      if (selectedMode === "flash-sale") {
        const isFlashSale =
          product.section === "flash-sale" ||
          product.placementTags?.includes("flash-sale");
        if (!isFlashSale) {
          return false;
        }
      }

      if (selectedMode === "popular") {
        const isPopular =
          product.section === "popular" ||
          product.placementTags?.includes("popular");
        if (!isPopular) {
          return false;
        }
      }

      if (
        selectedCategory &&
        ![normalizeValue(product.category), ...normalizedCategorySlugs].includes(selectedCategory)
      ) {
        return false;
      }

      if (
        selectedSubcategory &&
        ![
          normalizeValue(product.subcategory),
          ...normalizedSubcategorySlugs,
        ].includes(selectedSubcategory)
      ) {
        return false;
      }

      if (selectedMarket && store?.marketSlug !== selectedMarket) {
        return false;
      }

      if (selectedStore && product.storeId !== selectedStore) {
        return false;
      }

      if (!matchesPriceRange(product.price, selectedPriceRange)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

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
      const leftMarket = leftStore?.marketSlug ? marketLookup.get(leftStore.marketSlug) : undefined;
      const rightMarket = rightStore?.marketSlug ? marketLookup.get(rightStore.marketSlug) : undefined;

      if (selectedSort === "price_low") {
        return (left.price ?? 0) - (right.price ?? 0);
      }
      if (selectedSort === "price_high") {
        return (right.price ?? 0) - (left.price ?? 0);
      }
      if (selectedSort === "rating") {
        return (right.rating ?? 0) - (left.rating ?? 0);
      }
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

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

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

  const activeFilterCount = useMemo(() => {
    return [
      selectedCategory,
      selectedSubcategory,
      selectedMarket,
      selectedStore,
      selectedMode !== "all" ? selectedMode : "",
      selectedPriceRange !== "all" ? selectedPriceRange : "",
      selectedSort !== "relevance" ? selectedSort : "",
      query.trim(),
    ].filter(Boolean).length;
  }, [
    query,
    selectedCategory,
    selectedMarket,
    selectedMode,
    selectedPriceRange,
    selectedSort,
    selectedStore,
    selectedSubcategory,
  ]);
  const activeFilterPills = useMemo(
    () =>
      [
        selectedMode !== "all"
          ? {
              key: "mode",
              label: DISCOVERY_OPTIONS.find((item) => item.value === selectedMode)?.label ?? "Mode",
              onClear: () => setSelectedMode("all"),
            }
          : null,
        selectedCategoryTitle
          ? {
              key: "category",
              label: selectedCategoryTitle,
              onClear: () => {
                setSelectedCategory("");
                setSelectedSubcategory("");
              },
            }
          : null,
        selectedSubcategoryTitle
          ? {
              key: "subcategory",
              label: selectedSubcategoryTitle,
              onClear: () => setSelectedSubcategory(""),
            }
          : null,
        selectedMarketTitle
          ? {
              key: "market",
              label: selectedMarketTitle,
              onClear: () => {
                setSelectedMarket("");
                setSelectedStore("");
              },
            }
          : null,
        selectedStoreTitle
          ? {
              key: "store",
              label: selectedStoreTitle,
              onClear: () => setSelectedStore(""),
            }
          : null,
        selectedPriceRange !== "all"
          ? {
              key: "price",
              label: PRICE_OPTIONS.find((item) => item.value === selectedPriceRange)?.label ?? "Price",
              onClear: () => setSelectedPriceRange("all"),
            }
          : null,
        selectedSort !== "relevance"
          ? {
              key: "sort",
              label: SORT_OPTIONS.find((item) => item.value === selectedSort)?.label ?? "Sort",
              onClear: () => setSelectedSort("relevance"),
            }
          : null,
      ].filter(Boolean) as Array<{ key: string; label: string; onClear: () => void }>,
    [
      selectedCategoryTitle,
      selectedMarketTitle,
      selectedMode,
      selectedPriceRange,
      selectedSort,
      selectedStoreTitle,
      selectedSubcategoryTitle,
    ],
  );

  const isLoading =
    isLoadingProducts ||
    isLoadingCategories ||
    isLoadingStores ||
    isLoadingMarkets;

  const gridGap = rS(8);
  const numColumns = responsiveColumns;

  const clearAll = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedMarket("");
    setSelectedStore("");
    setSelectedMode("all");
    setSelectedSort("relevance");
    setSelectedPriceRange("all");
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + rV(10), rV(44)),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={rMS(20)} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search ODOS</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={clearAll}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonLabel}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchInputWrap}>
          <Ionicons
            name="search-outline"
            size={rMS(18)}
            color={AppColors.secondary}
            style={styles.searchInputIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, categories, stores, markets..."
            placeholderTextColor={AppColors.subtext[100]}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
          {query.trim().length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setQuery("")}
            >
              <Ionicons
                name="close-circle"
                size={rMS(18)}
                color={AppColors.subtext[100]}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>Discover faster across ODOS</Text>
          <Text style={styles.summaryMeta}>
            {humanizeResultCount(filteredProducts.length)}
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}` : ""}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + rV(92),
        }}
      >
        <View style={{ paddingTop: rV(16) }}>
          <View style={{ paddingHorizontal: horizontalPadding }}>
            {activeFilterPills.length > 0 ? (
              <View style={styles.activeFiltersCard}>
                <View style={styles.activeFiltersHeader}>
                  <Text style={styles.activeFiltersTitle}>Active filters</Text>
                  <TouchableOpacity activeOpacity={0.82} onPress={clearAll}>
                    <Text style={styles.activeFiltersClear}>Reset all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.activeFiltersWrap}>
                  {activeFilterPills.map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      activeOpacity={0.82}
                      onPress={item.onClear}
                      style={styles.activeFilterPill}
                    >
                      <Text style={styles.activeFilterPillText}>{item.label}</Text>
                      <Ionicons
                        name="close"
                        size={rMS(12)}
                        color={AppColors.secondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            <FilterPanel
              title="Quick picks"
              subtitle="Fast ways to jump into what people usually want."
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.panelScroller}
              >
                {FEATURED_SUGGESTIONS.map((suggestion) => (
                  <DiscoveryFilterChip
                    key={suggestion}
                    label={suggestion}
                    active={query.trim().toLowerCase() === suggestion.toLowerCase()}
                    onPress={() => setQuery(suggestion)}
                  />
                ))}
              </ScrollView>
            </FilterPanel>

            <View style={{ marginTop: sectionSpacing * 0.4 }}>
              <FilterPanel
                title="Browse"
                subtitle="Control what kind of products show up first."
              >
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Mode</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.panelScroller}
                  >
                    {DISCOVERY_OPTIONS.map((option) => (
                      <DiscoveryFilterChip
                        key={option.value}
                        label={option.label}
                        active={selectedMode === option.value}
                        onPress={() => setSelectedMode(option.value)}
                      />
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.panelScroller}
                  >
                    <DiscoveryFilterChip
                      label="All categories"
                      active={!selectedCategory}
                      onPress={() => {
                        setSelectedCategory("");
                        setSelectedSubcategory("");
                      }}
                    />
                    {suggestedCategories.map((category) => (
                      <DiscoveryFilterChip
                        key={category.id}
                        label={category.title}
                        active={selectedCategory === category.slug}
                        onPress={() => {
                          setSelectedCategory(category.slug);
                          setSelectedSubcategory("");
                        }}
                      />
                    ))}
                  </ScrollView>
                </View>

                {availableSubcategories.length > 0 ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Subcategory</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.panelScroller}
                    >
                      <DiscoveryFilterChip
                        label="All"
                        active={!selectedSubcategory}
                        onPress={() => setSelectedSubcategory("")}
                      />
                      {availableSubcategories.map((subcategory) => {
                        const subcategorySlug = normalizeValue(subcategory);
                        return (
                          <DiscoveryFilterChip
                            key={subcategorySlug}
                            label={subcategory}
                            active={selectedSubcategory === subcategorySlug}
                            onPress={() => setSelectedSubcategory(subcategorySlug)}
                          />
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}
              </FilterPanel>
            </View>

            <View style={{ marginTop: sectionSpacing * 0.4 }}>
              <FilterPanel
                title="Refine"
                subtitle="Narrow by location, seller, price, and sort order."
              >
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Market</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.panelScroller}
                  >
                    <DiscoveryFilterChip
                      label="All markets"
                      active={!selectedMarket}
                      onPress={() => {
                        setSelectedMarket("");
                        setSelectedStore("");
                      }}
                    />
                    {markets.map((market) => (
                      <DiscoveryFilterChip
                        key={market.id}
                        label={market.title}
                        active={selectedMarket === market.slug}
                        onPress={() => {
                          setSelectedMarket(market.slug);
                          setSelectedStore("");
                        }}
                      />
                    ))}
                  </ScrollView>
                </View>

                {filteredStores.length > 0 ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Store</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.panelScroller}
                    >
                      <DiscoveryFilterChip
                        label="All stores"
                        active={!selectedStore}
                        onPress={() => setSelectedStore("")}
                      />
                      {filteredStores.slice(0, 10).map((store) => (
                        <DiscoveryFilterChip
                          key={store.id}
                          label={store.title}
                          active={selectedStore === store.id}
                          onPress={() => setSelectedStore(store.id)}
                        />
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Price</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.panelScroller}
                  >
                    {PRICE_OPTIONS.map((option) => (
                      <DiscoveryFilterChip
                        key={option.value}
                        label={option.label}
                        active={selectedPriceRange === option.value}
                        onPress={() => setSelectedPriceRange(option.value)}
                      />
                    ))}
                  </ScrollView>
                </View>

                <View style={[styles.filterGroup, styles.filterGroupLast]}>
                  <Text style={styles.filterLabel}>Sort</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.panelScroller}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <DiscoveryFilterChip
                        key={option.value}
                        label={option.label}
                        active={selectedSort === option.value}
                        onPress={() => setSelectedSort(option.value)}
                      />
                    ))}
                  </ScrollView>
                </View>
              </FilterPanel>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: sectionSpacing * 0.7,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Results</Text>
            <Text style={styles.resultsMeta}>{humanizeResultCount(filteredProducts.length)}</Text>
          </View>

          {isLoading && products.length === 0 ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={AppColors.primary} />
              <Text style={styles.loadingText}>Loading ODOS products...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptySubtitle}>
                Try another keyword, switch the category, or clear the filters to see more products.
              </Text>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={clearAll}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Reset discovery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              scrollEnabled={false}
              columnWrapperStyle={numColumns > 1 ? { columnGap: gridGap } : undefined}
              renderItem={({ item }) => (
                <ProductCard
                  {...item}
                  cardWidth={gridCardWidth(numColumns, gridGap)}
                  horizontalSpacing={0}
                />
              )}
              contentContainerStyle={{ paddingTop: rV(14) }}
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
  header: {
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingBottom: rV(14),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(19),
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: rS(12),
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  clearButton: {
    minWidth: rS(44),
    alignItems: "flex-end",
  },
  clearButtonLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.title,
    color: AppColors.primary,
  },
  searchInputWrap: {
    marginTop: rV(14),
    minHeight: rMS(48),
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputIcon: {
    marginRight: rS(10),
  },
  searchInput: {
    flex: 1,
    paddingVertical: rV(10),
    fontSize: rMS(13),
    color: AppColors.text,
    fontFamily: Fonts.text,
  },
  summaryRow: {
    marginTop: rV(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(12),
  },
  summaryTitle: {
    flex: 1,
    fontSize: rMS(13),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  summaryMeta: {
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  activeFiltersCard: {
    borderRadius: rMS(18),
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: rV(14),
  },
  activeFiltersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rV(10),
  },
  activeFiltersTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  activeFiltersClear: {
    fontSize: rMS(11),
    color: AppColors.primary,
    fontFamily: Fonts.title,
  },
  activeFiltersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    borderRadius: 999,
    backgroundColor: "#EEF2F5",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterPillText: {
    fontSize: rMS(11),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  filterPanel: {
    borderRadius: rMS(20),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  filterPanelHeader: {
    marginBottom: rV(12),
  },
  filterPanelTitle: {
    fontSize: rMS(15),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  filterPanelSubtitle: {
    marginTop: rV(4),
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  filterGroup: {
    marginBottom: rV(14),
  },
  filterGroupLast: {
    marginBottom: 0,
  },
  filterLabel: {
    marginBottom: rV(9),
    fontSize: rMS(12),
    color: AppColors.subtext[100],
    fontFamily: Fonts.title,
  },
  panelScroller: {
    paddingRight: rS(6),
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsTitle: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  resultsMeta: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(32),
  },
  loadingText: {
    marginTop: rV(10),
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  emptyState: {
    marginTop: rV(18),
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    paddingHorizontal: rS(18),
    paddingVertical: rV(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  emptySubtitle: {
    marginTop: rV(8),
    textAlign: "center",
    fontSize: rMS(12),
    lineHeight: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  emptyButton: {
    marginTop: rV(16),
    borderRadius: 999,
    backgroundColor: AppColors.primary,
    paddingHorizontal: rS(18),
    paddingVertical: rV(10),
  },
  emptyButtonText: {
    color: AppColors.white,
    fontSize: rMS(12),
    fontFamily: Fonts.title,
  },
});
