import { AccountFilterChips } from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import type { CatalogCategoryItem } from "@/hooks/useCatalog";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type CatalogTaxonomyPickerProps = {
  categories: CatalogCategoryItem[];
  isLoading?: boolean;
  error?: string | null;
  categorySlug: string;
  subcategory: string;
  onSelectCategory: (category: CatalogCategoryItem) => void;
  onSelectSubcategory: (label: string) => void;
  categoryError?: string;
};

export function CatalogTaxonomyPicker({
  categories,
  isLoading = false,
  error,
  categorySlug,
  subcategory,
  onSelectCategory,
  onSelectSubcategory,
  categoryError,
}: CatalogTaxonomyPickerProps) {
  const selectedCategory =
    categories.find((entry) => entry.slug === categorySlug) ?? null;
  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  if (isLoading && !categories.length) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading ODOS categories...</Text>
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="grid-outline" size={rMS(22)} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No categories available yet</Text>
        <Text style={styles.emptyText}>
          Categories are managed by the ODOS admin team. Once they are published,
          they will appear here for product listings and the shopper category tab.
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Category *</Text>
      <Text style={styles.helperText}>
        Choose the same category shoppers see on the Explore tab. This keeps your
        product discoverable in the right place.
      </Text>
      <AccountFilterChips
        options={categories.map((entry) => ({
          key: entry.slug,
          label: entry.title,
        }))}
        activeKey={categorySlug || null}
        onChange={(slug) => {
          const nextCategory = categories.find((entry) => entry.slug === slug);
          if (nextCategory) {
            onSelectCategory(nextCategory);
          }
        }}
      />
      {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}

      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Subcategory</Text>
      <Text style={styles.helperText}>
        {selectedCategory
          ? `Optional. Pick a subcategory under ${selectedCategory.title}.`
          : "Select a category first to unlock subcategories."}
      </Text>

      {selectedCategory && subcategoryOptions.length > 0 ? (
        <AccountFilterChips
          options={[
            { key: "", label: "None" },
            ...subcategoryOptions.map((label) => ({
              key: label,
              label,
            })),
          ]}
          activeKey={subcategory || ""}
          onChange={(value) => onSelectSubcategory(value)}
        />
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            {selectedCategory
              ? "This category has no subcategories yet. You can still publish the product."
              : "Subcategories appear after you choose a category."}
          </Text>
        </View>
      )}

      {selectedCategory ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Listing placement</Text>
          <Text style={styles.summaryValue}>
            {selectedCategory.title}
            {subcategory ? ` · ${subcategory}` : ""}
          </Text>
          {selectedCategory.subtitle ? (
            <Text style={styles.summaryHint}>{selectedCategory.subtitle}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(10),
  },
  sectionLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  sectionLabelSpaced: {
    marginTop: rV(8),
  },
  helperText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: rV(10),
    paddingVertical: rV(24),
  },
  loadingText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  emptyWrap: {
    alignItems: "center",
    gap: rV(8),
    paddingVertical: rV(20),
    paddingHorizontal: rS(12),
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    color: "#6B7280",
    textAlign: "center",
  },
  placeholderCard: {
    borderRadius: rMS(16),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  placeholderText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  summaryCard: {
    marginTop: rV(4),
    borderRadius: rMS(16),
    backgroundColor: "#EEF4FF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8E4FF",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    gap: rV(4),
  },
  summaryLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#1D4ED8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  summaryHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    color: "#4B5563",
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#DC2626",
  },
});
