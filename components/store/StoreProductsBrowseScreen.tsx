import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import ProductCard from "@/components/cards/ProductCard";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import SearchField from "@/components/search/SearchField";
import StoreProductFilterSheet from "@/components/store/StoreProductFilterSheet";
import { formatStoreAudienceLabel } from "@/constants/storeAudience";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { useStore } from "@/hooks/useCommerce";
import { productCardGapX, productCardGapY, rMS, rS, rV, useResponsive } from "@/styles/responsive";
import {
  browseStoreProducts,
  buildStoreAudienceSegmentOptions,
  buildStoreProductCategoryOptions,
  buildStoreProductSubcategoryOptions,
  countActiveStoreBrowseFilters,
  type StoreProductBrowseMode,
  type StoreProductPriceRange,
  type StoreProductSortMode,
} from "@/utils/storeProductBrowse";
import { resolveApiMediaUrl } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { goBackOr } from "@/utils/navigation";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StoreProductsBrowseScreenProps = {
  storeId: string;
  fallbackTitle?: string;
  fallbackImage?: string;
  fallbackImageBanner?: string;
};

export default function StoreProductsBrowseScreen({
  storeId,
  fallbackTitle = "Store",
  fallbackImage,
  fallbackImageBanner,
}: StoreProductsBrowseScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { horizontalPadding, responsiveColumns, gridCardWidth } = useResponsive();
  const numColumns = responsiveColumns;
  const gridGap = productCardGapX();
  const cardWidth = gridCardWidth(numColumns, gridGap);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<StoreProductBrowseMode>("all");
  const [sort, setSort] = useState<StoreProductSortMode>("relevance");
  const [priceRange, setPriceRange] = useState<StoreProductPriceRange>("all");
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [audienceSlug, setAudienceSlug] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fallbackStore = useMemo(
    () => ({
      id: storeId,
      slug: fallbackTitle.toLowerCase().replace(/\s+/g, "-"),
      title: fallbackTitle,
      status: "active",
      image: resolveApiMediaUrl(fallbackImage) ? { uri: resolveApiMediaUrl(fallbackImage)! } : null,
      imageBanner: resolveApiMediaUrl(fallbackImageBanner ?? fallbackImage)
        ? { uri: resolveApiMediaUrl(fallbackImageBanner ?? fallbackImage)! }
        : null,
    }),
    [fallbackImage, fallbackImageBanner, fallbackTitle, storeId],
  );

  const { store } = useStore({ storeId, fallback: fallbackStore });
  const {
    products,
    isLoading,
    isLoadingMore,
    loadMore,
    refresh,
    hasMore,
  } = useInfiniteCatalogProducts({
    storeId,
    enabled: Boolean(storeId),
  });

  useEffect(() => {
    setQuery("");
    setMode("all");
    setSort("relevance");
    setPriceRange("all");
    setCategorySlug("");
    setSubcategorySlug("");
    setAudienceSlug("");
  }, [storeId]);

  const categoryOptions = useMemo(
    () => buildStoreProductCategoryOptions(products, storeId),
    [products, storeId],
  );

  const subcategoryOptions = useMemo(
    () => buildStoreProductSubcategoryOptions(products, storeId, categorySlug),
    [categorySlug, products, storeId],
  );

  const audienceSegmentOptions = useMemo(
    () => buildStoreAudienceSegmentOptions(store?.audienceSlugs, products, storeId),
    [products, store?.audienceSlugs, storeId],
  );

  const filteredProducts = useMemo(
    () =>
      browseStoreProducts(
        products,
        {
          storeId,
          query,
          mode,
          categorySlug,
          subcategorySlug,
          audienceSlug,
          priceRange,
          sort,
        },
        store?.title,
      ),
    [
      audienceSlug,
      categorySlug,
      mode,
      priceRange,
      products,
      query,
      sort,
      store?.title,
      storeId,
      subcategorySlug,
    ],
  );

  const filterCount = countActiveStoreBrowseFilters({
    mode,
    categorySlug,
    subcategorySlug,
    audienceSlug,
    priceRange,
    sort,
  });

  const sortLabel =
    sort === "relevance"
      ? "Best match"
      : sort === "newest"
        ? "Newest"
        : sort === "price_low"
          ? "Price ↑"
          : sort === "price_high"
            ? "Price ↓"
            : "Top rated";

  const quickModes: Array<{ value: StoreProductBrowseMode; label: string }> = [
    { value: "all", label: "All" },
    { value: "flash-sale", label: "Flash" },
    { value: "deals", label: "Deals" },
  ];

  const clearFilters = () => {
    setMode("all");
    setSort("relevance");
    setPriceRange("all");
    setCategorySlug("");
    setSubcategorySlug("");
    setAudienceSlug("");
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
        },
        listHeader: {
          paddingHorizontal: rS(16),
          paddingTop: rV(12),
          paddingBottom: rV(8),
          gap: rV(12),
        },
        toolbar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(10),
        },
        resultCount: {
          fontFamily: Fonts.title,
          fontSize: rMS(12.5),
        },
        toolbarActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
        },
        toolbarChip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          borderRadius: 999,
          borderWidth: StyleSheet.hairlineWidth,
          paddingHorizontal: rS(12),
          paddingVertical: rV(7),
        },
        toolbarChipText: {
          fontFamily: Fonts.title,
          fontSize: rMS(11.5),
          maxWidth: rS(92),
        },
        badge: {
          minWidth: rS(18),
          height: rS(18),
          borderRadius: rS(9),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(4),
        },
        badgeText: {
          fontFamily: Fonts.textBold,
          fontSize: rMS(10),
          color: colors.onPrimary,
        },
        quickModeRow: {
          gap: rS(8),
          paddingBottom: rV(4),
        },
      }),
    [colors.onPrimary, colors.primary],
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <SearchField
        embedded
        value={query}
        onChangeText={setQuery}
        placeholder={`Search in ${store?.title ?? "this store"}`}
        containerStyle={{ marginHorizontal: 0 }}
      />

      <View style={styles.toolbar}>
        <Text style={[styles.resultCount, { color: colors.textMuted }]}>
          {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          {hasMore ? "+" : ""}
        </Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={[styles.toolbarChip, { backgroundColor: colors.pill, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => setFiltersOpen(true)}
          >
            <Ionicons name="options-outline" size={rMS(14)} color={colors.text} />
            <Text style={[styles.toolbarChipText, { color: colors.text }]}>Filters</Text>
            {filterCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filterCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolbarChip, { backgroundColor: colors.pill, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => setFiltersOpen(true)}
          >
            <Ionicons name="swap-vertical" size={rMS(14)} color={colors.text} />
            <Text style={[styles.toolbarChipText, { color: colors.text }]} numberOfLines={1}>
              {sortLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickModeRow}
      >
        {quickModes.map((option) => (
          <DiscoveryFilterChip
            key={option.value}
            label={option.label}
            active={mode === option.value}
            onPress={() => setMode(option.value)}
          />
        ))}
      </ScrollView>

      {audienceSegmentOptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickModeRow}
        >
          <DiscoveryFilterChip
            label="All segments"
            active={!audienceSlug}
            onPress={() => setAudienceSlug("")}
          />
          {audienceSegmentOptions.map((segment) => (
            <DiscoveryFilterChip
              key={segment.key}
              label={formatStoreAudienceLabel(segment.key)}
              active={audienceSlug === segment.key}
              onPress={() =>
                setAudienceSlug((current) => (current === segment.key ? "" : segment.key))
              }
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  const handleBack = () => {
    goBackOr(router, {
      fallback: {
        pathname: "/(root)/screens/stores/[id]" as any,
        params: {
          id: storeId,
          title: store?.title ?? fallbackTitle,
          image: fallbackImage ?? "",
          imageBanner: fallbackImageBanner ?? fallbackImage ?? "",
        },
      },
    });
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.screen }]}>
        <StatusBar barStyle="dark-content" />
        <ProfileHeader title={store?.title ?? fallbackTitle} onBack={handleBack} />
        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: rV(16) }}>
          {listHeader}
          <ProductGridSkeleton count={4} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <StatusBar barStyle="dark-content" />
      <ProfileHeader title={store?.title ?? fallbackTitle} onBack={handleBack} />

      <FlatList
        style={{ flex: 1 }}
        data={filteredProducts}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.42}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && products.length > 0}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={<CatalogScrollFooter isLoadingMore={isLoadingMore} />}
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: "space-between",
                columnGap: gridGap,
                paddingHorizontal: horizontalPadding,
              }
            : undefined
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + rV(24),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <View
            style={{
              width: cardWidth,
              marginBottom: productCardGapY(),
              paddingHorizontal: numColumns === 1 ? horizontalPadding : 0,
            }}
          >
            <ProductCard
              {...item}
              cardWidth={cardWidth}
              horizontalSpacing={0}
              sourceScreen="store_products"
              storeId={storeId}
              searchQuery={query}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: horizontalPadding, marginTop: rV(28) }}>
            <CommerceEmptyState
              icon="search-outline"
              title="No products found"
              message="Try another search term or adjust your filters for this store."
              primaryLabel={query || filterCount > 0 ? "Reset" : undefined}
              onPrimaryPress={
                query || filterCount > 0
                  ? () => {
                      setQuery("");
                      clearFilters();
                    }
                  : undefined
              }
            />
          </View>
        }
      />

      <StoreProductFilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        selectedMode={mode}
        onModeChange={setMode}
        selectedSort={sort}
        onSortChange={setSort}
        selectedPriceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        selectedCategorySlug={categorySlug}
        onCategoryChange={setCategorySlug}
        selectedSubcategorySlug={subcategorySlug}
        onSubcategoryChange={setSubcategorySlug}
        categories={categoryOptions}
        subcategories={subcategoryOptions}
        onReset={clearFilters}
      />
    </View>
  );
}
