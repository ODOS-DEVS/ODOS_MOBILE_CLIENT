import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SearchSortMode = "relevance" | "newest" | "price_low" | "price_high" | "rating";
export type SearchDiscoveryMode = "all" | "flash-sale" | "popular";
export type SearchPriceRange = "all" | "under_100" | "100_250" | "250_500" | "500_plus";

const SORT_OPTIONS: Array<{ value: SearchSortMode; label: string }> = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price ↑" },
  { value: "price_high", label: "Price ↓" },
  { value: "rating", label: "Top rated" },
];

const MODE_OPTIONS: Array<{ value: SearchDiscoveryMode; label: string }> = [
  { value: "all", label: "All" },
  { value: "flash-sale", label: "Flash sale" },
  { value: "popular", label: "Popular" },
];

const PRICE_OPTIONS: Array<{ value: SearchPriceRange; label: string }> = [
  { value: "all", label: "Any" },
  { value: "under_100", label: "Under ₵100" },
  { value: "100_250", label: "₵100–250" },
  { value: "250_500", label: "₵250–500" },
  { value: "500_plus", label: "₵500+" },
];

/** Stores are unbounded; past this the chip wall stops being scannable. */
const STORE_CHIP_LIMIT = 12;

type CategoryOption = { id: string; slug: string; title: string };
type MarketOption = { id: string; slug: string; title: string };
type StoreOption = { id: string; title: string };

type SearchFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedMode: SearchDiscoveryMode;
  onModeChange: (value: SearchDiscoveryMode) => void;
  selectedSort: SearchSortMode;
  onSortChange: (value: SearchSortMode) => void;
  selectedPriceRange: SearchPriceRange;
  onPriceRangeChange: (value: SearchPriceRange) => void;
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  selectedSubcategory: string;
  onSubcategoryChange: (slug: string) => void;
  subcategories: Array<{ label: string; slug: string }>;
  categories: CategoryOption[];
  selectedMarket: string;
  onMarketChange: (slug: string) => void;
  markets: MarketOption[];
  selectedStore: string;
  onStoreChange: (storeId: string) => void;
  stores: StoreOption[];
  onReset: () => void;
  /** Results the current selection yields, shown on the apply button. */
  resultCount?: number;
  /** How many filters are set, for the header and the reset control. */
  activeFilterCount?: number;
};

/**
 * One filter group.
 *
 * The header carries the current selection on the right. Seven groups of
 * near-identical chips previously gave no way to see what was set without
 * reading every chip in every group, so the sheet looked the same whether one
 * filter was applied or none were.
 */
function FilterSection({
  title,
  value,
  children,
  titleColor,
  valueColor,
}: {
  title: string;
  /** Current selection, or undefined while the group is untouched. */
  value?: string;
  children: React.ReactNode;
  titleColor: string;
  valueColor: string;
}) {
  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={[sectionStyles.sectionTitle, { color: titleColor }]}>{title}</Text>
        {value ? (
          <Text
            style={[sectionStyles.sectionValue, { color: valueColor }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : null}
      </View>
      <View style={sectionStyles.chipWrap}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  section: {
    marginBottom: rV(18),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
    marginBottom: rV(10),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionValue: {
    flexShrink: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    textAlign: "right",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
});

export default function SearchFilterSheet({
  visible,
  onClose,
  selectedMode,
  onModeChange,
  selectedSort,
  onSortChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  subcategories,
  categories,
  selectedMarket,
  onMarketChange,
  markets,
  selectedStore,
  onStoreChange,
  stores,
  onReset,
  resultCount,
  activeFilterCount = 0,
}: SearchFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const labelFor = <T,>(options: { value: T; label: string }[], value: T) =>
    options.find((option) => option.value === value)?.label;

  const categoryLabel = categories.find((item) => item.slug === selectedCategory)?.title;
  const subcategoryLabel = subcategories.find(
    (item) => item.slug === selectedSubcategory,
  )?.label;
  const marketLabel = markets.find((item) => item.slug === selectedMarket)?.title;
  const storeLabel = stores.find((item) => item.id === selectedStore)?.title;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: colors.backdrop,
        },
        sheet: {
          maxHeight: "82%",
          backgroundColor: colors.card,
          borderTopLeftRadius: rMS(24),
          borderTopRightRadius: rMS(24),
          paddingTop: rV(8),
        },
        handle: {
          alignSelf: "center",
          width: rS(40),
          height: rV(4),
          borderRadius: rS(2),
          backgroundColor: colors.border,
          marginBottom: rV(10),
        },
        sheetHeader: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: rS(18),
          paddingBottom: rV(10),
          gap: rS(10),
        },
        sheetTitle: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(17),
          color: colors.text,
        },
        resetText: {
          fontFamily: Fonts.title,
          fontSize: rMS(13),
          color: colors.primary,
        },
        resetTextDisabled: {
          color: colors.textMuted,
          opacity: 0.6,
        },
        headerCount: {
          minWidth: rMS(20),
          paddingHorizontal: rS(6),
          paddingVertical: rV(2),
          borderRadius: 999,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        headerCountText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: colors.onPrimary,
        },
        moreNote: {
          alignSelf: "center",
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          color: colors.textMuted,
          paddingVertical: rV(7),
        },
        closeBtn: {
          padding: rS(4),
          minWidth: rS(44),
          minHeight: rS(44),
          alignItems: "center",
          justifyContent: "center",
        },
        sheetBody: {
          paddingHorizontal: rS(18),
          paddingBottom: rV(16),
        },
        applyBtn: {
          marginHorizontal: rS(18),
          marginTop: rV(4),
          minHeight: rV(48),
          borderRadius: rMS(14),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        applyBtnText: {
          color: colors.onPrimary,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
        },
      }),
    [colors],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss filters" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + rV(12) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters</Text>
          {activeFilterCount > 0 ? (
            <View style={styles.headerCount}>
              <Text style={styles.headerCountText}>{activeFilterCount}</Text>
            </View>
          ) : null}
          {/* Reset is dimmed with nothing set: an always-live control gives no
              signal about whether the sheet is carrying any state. */}
          <TouchableOpacity
            onPress={onReset}
            disabled={activeFilterCount === 0}
            activeOpacity={0.82}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
          >
            <Text
              style={[
                styles.resetText,
                activeFilterCount === 0 && styles.resetTextDisabled,
              ]}
            >
              Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Close filters"
          >
            <Ionicons name="close" size={rS(22)} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
          <FilterSection
            title="Sort by"
            value={labelFor(SORT_OPTIONS, selectedSort)}
            titleColor={colors.textMuted}
            valueColor={colors.text}
          >
            {SORT_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedSort === option.value}
                onPress={() => onSortChange(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection
            title="Show"
            value={selectedMode === "all" ? undefined : labelFor(MODE_OPTIONS, selectedMode)}
            titleColor={colors.textMuted}
            valueColor={colors.primary}
          >
            {MODE_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedMode === option.value}
                onPress={() => onModeChange(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection
            title="Price"
            value={
              selectedPriceRange === "all"
                ? undefined
                : labelFor(PRICE_OPTIONS, selectedPriceRange)
            }
            titleColor={colors.textMuted}
            valueColor={colors.primary}
          >
            {PRICE_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedPriceRange === option.value}
                onPress={() => onPriceRangeChange(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection
            title="Category"
            value={categoryLabel}
            titleColor={colors.textMuted}
            valueColor={colors.primary}
          >
            <DiscoveryFilterChip
              label="All"
              active={!selectedCategory}
              onPress={() => {
                onCategoryChange("");
                onSubcategoryChange("");
              }}
            />
            {categories.map((category) => (
              <DiscoveryFilterChip
                key={category.id}
                label={category.title}
                active={selectedCategory === category.slug}
                onPress={() => {
                  onCategoryChange(category.slug);
                  onSubcategoryChange("");
                }}
              />
            ))}
          </FilterSection>

          {subcategories.length > 0 ? (
            <FilterSection
              title="Subcategory"
              value={subcategoryLabel}
              titleColor={colors.textMuted}
              valueColor={colors.primary}
            >
              <DiscoveryFilterChip
                label="All"
                active={!selectedSubcategory}
                onPress={() => onSubcategoryChange("")}
              />
              {subcategories.map((subcategory) => (
                <DiscoveryFilterChip
                  key={subcategory.slug}
                  label={subcategory.label}
                  active={selectedSubcategory === subcategory.slug}
                  onPress={() => onSubcategoryChange(subcategory.slug)}
                />
              ))}
            </FilterSection>
          ) : null}

          {markets.length > 0 ? (
            <FilterSection
              title="Market"
              value={marketLabel}
              titleColor={colors.textMuted}
              valueColor={colors.primary}
            >
              <DiscoveryFilterChip
                label="All"
                active={!selectedMarket}
                onPress={() => {
                  onMarketChange("");
                  onStoreChange("");
                }}
              />
              {markets.map((market) => (
                <DiscoveryFilterChip
                  key={market.id}
                  label={market.title}
                  active={selectedMarket === market.slug}
                  onPress={() => {
                    onMarketChange(market.slug);
                    onStoreChange("");
                  }}
                />
              ))}
            </FilterSection>
          ) : null}

          {stores.length > 0 ? (
            <FilterSection
              title="Store"
              value={storeLabel}
              titleColor={colors.textMuted}
              valueColor={colors.primary}
            >
              <DiscoveryFilterChip
                label="All"
                active={!selectedStore}
                onPress={() => onStoreChange("")}
              />
              {stores.slice(0, STORE_CHIP_LIMIT).map((store) => (
                <DiscoveryFilterChip
                  key={store.id}
                  label={store.title}
                  active={selectedStore === store.id}
                  onPress={() => onStoreChange(store.id)}
                />
              ))}
              {/* The list was capped silently, so a shopper whose store sat at
                  position 13 had no way to know it existed. */}
              {stores.length > STORE_CHIP_LIMIT ? (
                <Text style={styles.moreNote}>
                  +{stores.length - STORE_CHIP_LIMIT} more — narrow by market
                </Text>
              ) : null}
            </FilterSection>
          ) : null}
        </ScrollView>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={onClose}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Show filtered results"
        >
          <Text style={styles.applyBtnText}>
            {typeof resultCount === "number"
              ? resultCount === 0
                ? "No matching items"
                : `Show ${resultCount} ${resultCount === 1 ? "item" : "items"}`
              : "Show results"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
