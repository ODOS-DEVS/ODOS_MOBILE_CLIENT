import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import ProductCard from "@/components/cards/ProductCard";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import SearchField from "@/components/search/SearchField";
import StoreActiveFilterPills from "@/components/store/StoreActiveFilterPills";
import StoreProductFilterSheet from "@/components/store/StoreProductFilterSheet";
import { formatStoreAudienceLabel } from "@/constants/storeAudience";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { useStore } from "@/hooks/useCommerce";
import { useStoreSections } from "@/hooks/useStoreSections";
import { productCardGapX, productCardGapY, rMS, rS, rV, useResponsive } from "@/styles/responsive";
import {
  browseStoreProducts,
  buildStoreAudienceSegmentOptions,
  buildStoreProductCategoryOptions,
  buildStoreProductSubcategoryOptions,
  countActiveStoreBrowseFilters,
  describeActiveStoreFilters,
  formatStoreSortLabel,
  type ActiveStoreFilterKind,
  type StoreProductBrowseMode,
  type StoreProductPriceRange,
  type StoreProductSortMode,
} from "@/utils/storeProductBrowse";
import { resolveApiMediaUrl } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { goBackOr } from "@/utils/navigation";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  /**
   * Pre-applied filters, for arriving from a shelf or a category tile.
   *
   * Seeded as initial state rather than synced in an effect: the browse screen
   * is a filter surface the shopper then edits, so a tile only decides where
   * they *land*. Re-syncing would fight them the moment they cleared it.
   */
  initialSectionId?: string;
  initialCategorySlug?: string;
};

export default function StoreProductsBrowseScreen({
  storeId,
  fallbackTitle = "Store",
  fallbackImage,
  fallbackImageBanner,
  initialSectionId = "",
  initialCategorySlug = "",
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
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug);
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [audienceSlug, setAudienceSlug] = useState("");
  const [sectionId, setSectionId] = useState(initialSectionId);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetFocusSort, setSheetFocusSort] = useState(false);

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

  /**
   * Clear filters when the shopper moves to a *different* shop.
   *
   * The guard matters: effects also run on mount, so without it this fired
   * once on arrival and wiped the filters the screen had just been opened
   * with. Landing from a shelf or category tile would have dropped the shopper
   * into the shop's full catalogue instead — a bug that typechecks cleanly and
   * only shows on device, because the seeded state is correct for exactly one
   * render before being erased.
   */
  const filtersScopedToStoreRef = useRef(storeId);
  useEffect(() => {
    if (filtersScopedToStoreRef.current === storeId) {
      return;
    }
    filtersScopedToStoreRef.current = storeId;
    setQuery("");
    setMode("all");
    setSort("relevance");
    setPriceRange("all");
    setCategorySlug("");
    setSubcategorySlug("");
    setAudienceSlug("");
    setSectionId("");
  }, [storeId]);

  const categoryOptions = useMemo(
    () => buildStoreProductCategoryOptions(products, storeId),
    [products, storeId],
  );

  // The shop's own shelves. Empty for a store that has not made any, in which
  // case the chip row below renders nothing at all.
  const { sections: storeSections } = useStoreSections(storeId);

  const activeSection = useMemo(
    () => storeSections.find((section) => section.id === sectionId) ?? null,
    [sectionId, storeSections],
  );

  const sectionProductIds = useMemo(
    () => (activeSection ? activeSection.products.map((product) => product.id) : null),
    [activeSection],
  );

  /**
   * What the grid filters over.
   *
   * The sections endpoint returns each shelf with its *complete* product list,
   * while `products` is the infinitely-paginated store feed. Selecting a shelf
   * used to filter the paginated feed by the shelf's ids, so you only ever saw
   * the overlap with whatever had loaded so far — a shelf of 30 items showed 6
   * until you had scrolled the whole store. With a shelf selected the shelf is
   * the source, which is both complete and already scoped to this store.
   */
  const browseSource = activeSection ? activeSection.products : products;

  // Nothing left to page in: the shelf arrived whole.
  const canPaginate = !activeSection;

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
        browseSource,
        {
          storeId,
          query,
          mode,
          categorySlug,
          subcategorySlug,
          audienceSlug,
          priceRange,
          sectionProductIds,
          sort,
        },
        store?.title,
      ),
    [
      audienceSlug,
      browseSource,
      categorySlug,
      mode,
      priceRange,
      sectionProductIds,
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
    sectionProductIds,
  });

  const sortLabel = formatStoreSortLabel(sort);

  const activeSegmentLabel = audienceSlug ? formatStoreAudienceLabel(audienceSlug) : null;
  const activeSectionTitle =
    storeSections.find((section) => section.id === sectionId)?.title ?? null;

  const activeFilters = useMemo(
    () =>
      describeActiveStoreFilters({
        mode,
        sort,
        priceRange,
        categorySlug,
        subcategorySlug,
        audienceSlug,
        sectionTitle: activeSectionTitle,
        audienceLabel: activeSegmentLabel,
        categories: categoryOptions,
        subcategories: subcategoryOptions,
      }),
    [
      activeSectionTitle,
      activeSegmentLabel,
      audienceSlug,
      categoryOptions,
      categorySlug,
      mode,
      priceRange,
      sort,
      subcategoryOptions,
      subcategorySlug,
    ],
  );

  const removeFilter = (kind: ActiveStoreFilterKind) => {
    if (kind === "mode") setMode("all");
    if (kind === "sort") setSort("relevance");
    if (kind === "price") setPriceRange("all");
    if (kind === "audience") setAudienceSlug("");
    if (kind === "section") setSectionId("");
    if (kind === "subcategory") setSubcategorySlug("");
    if (kind === "category") {
      setCategorySlug("");
      // A subcategory only means something under its parent.
      setSubcategorySlug("");
    }
  };

  const openSheet = (focusSort: boolean) => {
    setSheetFocusSort(focusSort);
    setFiltersOpen(true);
  };

  /**
   * One visible rail, not three.
   *
   * The screen used to stack a mode rail, a shelves rail and a segments rail,
   * each with its own "All …" chip — three near-identical pill rows before the
   * first product, and the mode rail duplicated what the filter sheet already
   * offered. The shop's own shelves win the one slot because that is how
   * someone standing in a shop thinks ("trousers", not "gents"); segments take
   * it only when the shop has defined no shelves. Everything else lives in the
   * sheet and shows up as a removable pill once applied.
   */
  const primaryRail: {
    kind: "sections" | "segments";
    /** Names what the rail is, so a row of pills is not left unexplained. */
    caption: string;
    allLabel: string;
    items: { key: string; label: string; active: boolean; onPress: () => void }[];
  } | null = useMemo(() => {
    if (storeSections.length > 0) {
      return {
        kind: "sections",
        caption: "Shelves in this shop",
        allLabel: "All products",
        items: storeSections.map((section) => ({
          key: section.id,
          // The count comes from the shelf itself, so it is the real total
          // rather than however much of the store has paginated in.
          label: `${section.title} ${section.products.length}`,
          active: sectionId === section.id,
          onPress: () => setSectionId((current) => (current === section.id ? "" : section.id)),
        })),
      };
    }

    if (audienceSegmentOptions.length > 0) {
      return {
        kind: "segments",
        caption: "Shop for",
        allLabel: "Everyone",
        items: audienceSegmentOptions.map((segment) => ({
          key: segment.key,
          label: formatStoreAudienceLabel(segment.key),
          active: audienceSlug === segment.key,
          onPress: () =>
            setAudienceSlug((current) => (current === segment.key ? "" : segment.key)),
        })),
      };
    }

    return null;
  }, [audienceSegmentOptions, audienceSlug, sectionId, storeSections]);

  const clearPrimaryRail = () => {
    if (primaryRail?.kind === "sections") {
      setSectionId("");
      return;
    }
    setAudienceSlug("");
  };

  const isPrimaryRailAllActive =
    primaryRail?.kind === "sections" ? !sectionId : !audienceSlug;

  const clearFilters = () => {
    setMode("all");
    setSort("relevance");
    setPriceRange("all");
    setCategorySlug("");
    setSubcategorySlug("");
    setAudienceSlug("");
    // Included, or "clear filters" leaves the shelf chip active and the result
    // count unexplained.
    setSectionId("");
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
        },
        listHeader: {
          // Matches the grid's own padding so the search field, rail and
          // toolbar line up with the first column instead of sitting a few
          // points off it.
          paddingHorizontal: horizontalPadding,
          paddingTop: rV(14),
          paddingBottom: rV(10),
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
        railBlock: {
          gap: rV(7),
        },
        railCaption: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10.5),
          textTransform: "uppercase",
          letterSpacing: 0.6,
        },
        railRow: {
          gap: rS(8),
          paddingRight: rS(4),
        },
      }),
    [colors.onPrimary, colors.primary, horizontalPadding],
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

      {primaryRail ? (
        <View style={styles.railBlock}>
          <Text style={[styles.railCaption, { color: colors.textMuted }]}>
            {primaryRail.caption}
          </Text>
          <ScrollView
            horizontal
          showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railRow}
            keyboardShouldPersistTaps="handled"
          >
            <DiscoveryFilterChip
              label={primaryRail.allLabel}
              active={isPrimaryRailAllActive}
              onPress={clearPrimaryRail}
            />
            {primaryRail.items.map((item) => (
              <DiscoveryFilterChip
                key={item.key}
                label={item.label}
                active={item.active}
                onPress={item.onPress}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <Text style={[styles.resultCount, { color: colors.textMuted }]}>
          {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          {canPaginate && hasMore ? "+" : ""}
        </Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={[
              styles.toolbarChip,
              {
                backgroundColor: filterCount > 0 ? colors.accentSoft : colors.pill,
                borderColor: filterCount > 0 ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => openSheet(false)}
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
            onPress={() => openSheet(true)}
          >
            <Ionicons name="swap-vertical" size={rMS(14)} color={colors.text} />
            <Text style={[styles.toolbarChipText, { color: colors.text }]} numberOfLines={1}>
              {sortLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <StoreActiveFilterPills
        filters={activeFilters}
        onRemove={removeFilter}
        onClearAll={clearFilters}
      />
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

  // Gated on the browse source, not the paginated feed: a shelf tapped while
  // the store feed is still loading already has everything it needs, so
  // showing a skeleton over it would be hiding content we hold.
  if (isLoading && browseSource.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.screen }]}>
        <StatusBar barStyle="dark-content" />
        <ProfileHeader title={store?.title ?? fallbackTitle} onBack={handleBack} />
        {listHeader}
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <ProductGridSkeleton count={numColumns * 2} />
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
        onEndReached={() => {
          if (canPaginate) {
            void loadMore();
          }
        }}
        onEndReachedThreshold={0.42}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && products.length > 0}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={<CatalogScrollFooter isLoadingMore={canPaginate && isLoadingMore} />}
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
        sections={storeSections.map((section) => ({ id: section.id, title: section.title }))}
        selectedSectionId={sectionId}
        onSectionChange={setSectionId}
        segments={audienceSegmentOptions.map((segment) => ({
          key: segment.key,
          label: formatStoreAudienceLabel(segment.key),
        }))}
        selectedSegmentKey={audienceSlug}
        onSegmentChange={setAudienceSlug}
        focusSort={sheetFocusSort}
        onReset={clearFilters}
      />
    </View>
  );
}
