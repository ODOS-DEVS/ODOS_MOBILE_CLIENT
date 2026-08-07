import DiscoveryFilterChip from "@/components/search/DiscoveryFilterChip";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type {
  StoreProductBrowseMode,
  StoreProductPriceRange,
  StoreProductSortMode,
} from "@/utils/storeProductBrowse";
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

const SORT_OPTIONS: Array<{ value: StoreProductSortMode; label: string }> = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price ↑" },
  { value: "price_high", label: "Price ↓" },
  { value: "rating", label: "Top rated" },
];

const MODE_OPTIONS: Array<{ value: StoreProductBrowseMode; label: string }> = [
  { value: "all", label: "All items" },
  { value: "flash-sale", label: "Flash deals" },
  { value: "deals", label: "On sale" },
];

const PRICE_OPTIONS: Array<{ value: StoreProductPriceRange; label: string }> = [
  { value: "all", label: "Any price" },
  { value: "under_100", label: "Under ₵100" },
  { value: "100_250", label: "₵100–250" },
  { value: "250_500", label: "₵250–500" },
  { value: "500_plus", label: "₵500+" },
];

type CategoryOption = { key: string; label: string; count: number };
type SubcategoryOption = { key: string; label: string; count: number };

type StoreProductFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedMode: StoreProductBrowseMode;
  onModeChange: (value: StoreProductBrowseMode) => void;
  selectedSort: StoreProductSortMode;
  onSortChange: (value: StoreProductSortMode) => void;
  selectedPriceRange: StoreProductPriceRange;
  onPriceRangeChange: (value: StoreProductPriceRange) => void;
  selectedCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  selectedSubcategorySlug: string;
  onSubcategoryChange: (slug: string) => void;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  onReset: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

export default function StoreProductFilterSheet({
  visible,
  onClose,
  selectedMode,
  onModeChange,
  selectedSort,
  onSortChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedCategorySlug,
  onCategoryChange,
  selectedSubcategorySlug,
  onSubcategoryChange,
  categories,
  subcategories,
  onReset,
}: StoreProductFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, rV(16)) }]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filter products</Text>
          <TouchableOpacity onPress={onReset} activeOpacity={0.82}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Section title="Show">
            {MODE_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedMode === option.value}
                onPress={() => onModeChange(option.value)}
              />
            ))}
          </Section>

          <Section title="Sort by">
            {SORT_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedSort === option.value}
                onPress={() => onSortChange(option.value)}
              />
            ))}
          </Section>

          <Section title="Price">
            {PRICE_OPTIONS.map((option) => (
              <DiscoveryFilterChip
                key={option.value}
                label={option.label}
                active={selectedPriceRange === option.value}
                onPress={() => onPriceRangeChange(option.value)}
              />
            ))}
          </Section>

          {categories.length > 1 ? (
            <Section title="Category">
              {categories.map((option) => (
                <DiscoveryFilterChip
                  key={option.key || "all"}
                  label={`${option.label} (${option.count})`}
                  active={selectedCategorySlug === option.key}
                  onPress={() => {
                    onCategoryChange(option.key);
                    onSubcategoryChange("");
                  }}
                />
              ))}
            </Section>
          ) : null}

          {subcategories.length > 1 ? (
            <Section title="Subcategory">
              {subcategories.map((option) => (
                <DiscoveryFilterChip
                  key={option.key || "all"}
                  label={`${option.label} (${option.count})`}
                  active={selectedSubcategorySlug === option.key}
                  onPress={() => onSubcategoryChange(option.key)}
                />
              ))}
            </Section>
          ) : null}
        </ScrollView>

        <TouchableOpacity style={styles.applyButton} activeOpacity={0.9} onPress={onClose}>
          <Text style={styles.applyText}>Show results</Text>
          <Ionicons name="arrow-forward" size={rMS(16)} color={colors.onInverseSurface} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
    },
    sheet: {
      maxHeight: "82%",
      borderTopLeftRadius: rMS(28),
      borderTopRightRadius: rMS(28),
      backgroundColor: colors.card,
      paddingHorizontal: rS(18),
      paddingTop: rV(10),
    },
    handle: {
      alignSelf: "center",
      width: rS(44),
      height: rV(4),
      borderRadius: 999,
      backgroundColor: colors.cardBorder,
      marginBottom: rV(14),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: rV(8),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(18),
      color: colors.text,
    },
    resetText: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.primary,
    },
    section: {
      marginTop: rV(16),
    },
    sectionTitle: {
      fontFamily: Fonts.title,
      fontSize: rMS(12.5),
      color: colors.placeholder,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: rV(10),
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(8),
    },
    applyButton: {
      marginTop: rV(18),
      minHeight: rV(52),
      borderRadius: rMS(16),
      backgroundColor: colors.inverseSurface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(8),
    },
    applyText: {
      color: colors.onInverseSurface,
      fontFamily: Fonts.textBold,
      fontSize: rMS(14),
    },
  });
}
