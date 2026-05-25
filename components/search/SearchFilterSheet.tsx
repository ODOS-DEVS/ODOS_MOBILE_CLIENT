import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

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
}: SearchFilterSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + rV(12) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <TouchableOpacity onPress={onReset} activeOpacity={0.82}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.82}>
            <Ionicons name="close" size={rS(22)} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
          <FilterSection title="Sort by">
            {SORT_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedSort === option.value}
                onPress={() => onSortChange(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Show">
            {MODE_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedMode === option.value}
                onPress={() => onModeChange(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Price">
            {PRICE_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedPriceRange === option.value}
                onPress={() => onPriceRangeChange(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Category">
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
            <FilterSection title="Subcategory">
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
            <FilterSection title="Market">
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
            <FilterSection title="Store">
              <DiscoveryFilterChip
                label="All"
                active={!selectedStore}
                onPress={() => onStoreChange("")}
              />
              {stores.slice(0, 12).map((store) => (
                <DiscoveryFilterChip
                  key={store.id}
                  label={store.title}
                  active={selectedStore === store.id}
                  onPress={() => onStoreChange(store.id)}
                />
              ))}
            </FilterSection>
          ) : null}
        </ScrollView>

        <TouchableOpacity style={styles.applyBtn} onPress={onClose} activeOpacity={0.9}>
          <Text style={styles.applyBtnText}>Show results</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheet: {
    maxHeight: "82%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rMS(24),
    borderTopRightRadius: rMS(24),
    paddingTop: rV(8),
  },
  handle: {
    alignSelf: "center",
    width: rS(40),
    height: rV(4),
    borderRadius: rS(2),
    backgroundColor: "#E5E7EB",
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
    color: AppColors.text,
  },
  resetText: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
    color: AppColors.primary,
  },
  closeBtn: {
    padding: rS(4),
  },
  sheetBody: {
    paddingHorizontal: rS(18),
    paddingBottom: rV(16),
  },
  section: {
    marginBottom: rV(18),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#6B7280",
    marginBottom: rV(10),
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  applyBtn: {
    marginHorizontal: rS(18),
    marginTop: rV(4),
    minHeight: rV(48),
    borderRadius: rMS(14),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});
