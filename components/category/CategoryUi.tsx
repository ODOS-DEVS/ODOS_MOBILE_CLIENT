import {
  AccountInsightCard,
  AccountListCard,
  accountStyles,
} from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import type { CatalogCategoryItem } from "@/hooks/useCatalog";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import ProductCard from "@/components/cards/ProductCard";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";

export {
  AccountEmptyState,
  AccountFilterChips,
  AccountInsightCard,
  accountStyles,
} from "@/components/account/AccountUi";

/** @deprecated Use SearchLauncher without containerStyle (same as home). Kept for cached bundles. */
export const categorySearchBarStyle = {
  marginTop: 0,
  marginHorizontal: 0,
};

export const categoryStyles = StyleSheet.create({
  headerBlock: {
    gap: rV(14),
    paddingTop: rV(10),
    width: "100%",
  },
  insightCardExpanded: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: rS(20),
    paddingVertical: rV(22),
    borderRadius: rMS(24),
  },
  insightTitleExpanded: {
    fontSize: rMS(18),
  },
  statsRowExpanded: {
    marginTop: rV(18),
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(16),
    paddingHorizontal: rS(8),
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  statValueExpanded: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
    color: AppColors.text,
  },
  statLabelExpanded: {
    marginTop: rV(6),
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: "#6B7280",
    textAlign: "center",
  },
  browseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  browseCopy: {
    flex: 1,
    gap: rV(6),
  },
  browseTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  browseSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  browseMeta: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: AppColors.primary,
  },
  imageWrap: {
    width: rS(96),
    height: rS(96),
    borderRadius: rMS(22),
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: rV(4),
    paddingHorizontal: rS(8),
  },
  placeholderText: {
    fontFamily: Fonts.title,
    fontSize: rMS(10),
    color: "#9CA3AF",
    textAlign: "center",
  },
  browseCta: {
    marginTop: rV(4),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: AppColors.text,
    paddingHorizontal: rS(14),
    paddingVertical: rV(9),
    borderRadius: rMS(999),
  },
  browseCtaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11.5),
    color: "#FFFFFF",
  },
  detailMetaLine: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
    paddingHorizontal: rS(2),
  },
  detailHero: {
    gap: rV(6),
  },
  detailTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    color: AppColors.text,
  },
  detailSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    color: "#6B7280",
  },
  searchSection: {
    paddingTop: rV(8),
  },
  gridSection: {
    paddingTop: rV(12),
  },
  detailIntro: {
    gap: rV(4),
  },
  detailMeta: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: AppColors.primary,
  },
  chipScroller: {
    marginHorizontal: -rS(4),
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    paddingVertical: rV(2),
  },
  subcategoryChip: {
    paddingHorizontal: rS(16),
    paddingVertical: rV(9),
    borderRadius: 999,
    backgroundColor: "#EEF2F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  subcategoryChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  subcategoryChipText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
    color: AppColors.text,
  },
  subcategoryChipTextActive: {
    color: "#FFFFFF",
  },
  subcategorySection: {
    gap: rV(10),
    paddingTop: rV(4),
  },
  subcategorySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  subcategorySectionTitle: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
  },
  subcategorySectionCount: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  subcategorySeeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(4),
  },
  subcategorySeeAllText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: AppColors.primary,
  },
  subcategoryProductRow: {
    gap: rS(10),
    paddingRight: rS(4),
  },
  subcategoryEmpty: {
    borderRadius: rMS(16),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    gap: rV(4),
  },
  subcategoryEmptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  subcategoryEmptyText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  tabSectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
  },
  tabSectionHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
    marginTop: rV(4),
  },
  departmentRow: {
    gap: rS(10),
    paddingVertical: rV(2),
  },
  departmentCard: {
    width: rS(148),
    borderRadius: rMS(20),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  departmentImage: {
    width: "100%",
    height: rV(92),
    backgroundColor: "#F3F4F6",
  },
  departmentBody: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    gap: rV(4),
  },
  departmentTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  departmentSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    lineHeight: rMS(16),
    color: "#6B7280",
  },
  collectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  collectionTile: {
    flex: 1,
    borderRadius: rMS(20),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  collectionImage: {
    width: "100%",
    height: rV(108),
    backgroundColor: "#F3F4F6",
  },
  collectionBody: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    gap: rV(6),
  },
  collectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  collectionMeta: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: AppColors.primary,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    borderRadius: rMS(20),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    padding: rS(12),
  },
  heroImage: {
    width: rS(72),
    height: rS(72),
    borderRadius: rMS(16),
    backgroundColor: "#E5E7EB",
  },
  heroCopy: {
    flex: 1,
    gap: rV(4),
  },
  heroTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
  },
  heroMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  sectionProductGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: rV(10),
  },
});

type CategoryInsightCardProps = {
  title: string;
  subtitle: string;
  stats: Array<{ value: string | number; label: string }>;
};

export function CategoryTabSectionHeader({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <View>
      <Text style={categoryStyles.tabSectionTitle}>{title}</Text>
      {hint ? <Text style={categoryStyles.tabSectionHint}>{hint}</Text> : null}
    </View>
  );
}

export function CategoryDepartmentCard({
  title,
  subtitle,
  image,
  productCount,
  onPress,
}: {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  productCount?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={categoryStyles.departmentCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={image} style={categoryStyles.departmentImage} resizeMode="cover" />
      <View style={categoryStyles.departmentBody}>
        <Text style={categoryStyles.departmentTitle}>{title}</Text>
        <Text style={categoryStyles.departmentSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        {typeof productCount === "number" ? (
          <Text style={categoryStyles.collectionMeta}>
            {productCount} {productCount === 1 ? "item" : "items"}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export function CategoryCollectionTile({
  title,
  subtitle,
  image,
  subcategoryCount,
  onPress,
}: {
  title: string;
  subtitle: string;
  image: ImageSourcePropType | null;
  subcategoryCount?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={categoryStyles.collectionTile}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image ? (
        <Image source={image} style={categoryStyles.collectionImage} resizeMode="cover" />
      ) : (
        <View style={[categoryStyles.collectionImage, categoryStyles.imagePlaceholder]}>
          <Ionicons name="grid-outline" size={rMS(22)} color="#94A3B8" />
        </View>
      )}
      <View style={categoryStyles.collectionBody}>
        <Text style={categoryStyles.collectionTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={categoryStyles.collectionMeta} numberOfLines={1}>
          {subcategoryCount
            ? `${subcategoryCount} subcategories`
            : subtitle || "Browse collection"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function CategoryHeroBanner({
  title,
  subtitle,
  image,
  productCount,
  subcategoryCount,
}: {
  title: string;
  subtitle: string;
  image: ImageSourcePropType | null;
  productCount: number;
  subcategoryCount: number;
}) {
  return (
    <View style={categoryStyles.heroCard}>
      {image ? (
        <Image source={image} style={categoryStyles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[categoryStyles.heroImage, categoryStyles.imagePlaceholder]}>
          <Ionicons name="grid-outline" size={rMS(20)} color="#94A3B8" />
        </View>
      )}
      <View style={categoryStyles.heroCopy}>
        <Text style={categoryStyles.heroTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={categoryStyles.heroMeta} numberOfLines={2}>
          {subtitle}
        </Text>
        <Text style={categoryStyles.detailMeta}>
          {productCount} products
          {subcategoryCount > 0 ? ` · ${subcategoryCount} subcategories` : ""}
        </Text>
      </View>
    </View>
  );
}

export function CategoryDetailIntro({
  subtitle,
  productCount,
  subcategoryCount,
}: {
  subtitle: string;
  productCount: number;
  subcategoryCount: number;
}) {
  return (
    <View style={categoryStyles.detailIntro}>
      <Text style={categoryStyles.detailSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      <Text style={categoryStyles.detailMeta}>
        {productCount} {productCount === 1 ? "product" : "products"}
        {subcategoryCount > 0
          ? ` · ${subcategoryCount} ${subcategoryCount === 1 ? "subcategory" : "subcategories"}`
          : ""}
      </Text>
    </View>
  );
}

type CategoryChipOption<T extends string> = {
  key: T;
  label: string;
  count?: number;
};

export function CategorySubcategoryChips<T extends string>({
  options,
  activeKey,
  onChange,
  contentPaddingHorizontal = 0,
}: {
  options: CategoryChipOption<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  contentPaddingHorizontal?: number;
}) {
  if (options.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={categoryStyles.chipScroller}
      contentContainerStyle={[
        categoryStyles.chipRow,
        contentPaddingHorizontal
          ? { paddingHorizontal: contentPaddingHorizontal }
          : null,
      ]}
    >
      {options.map((option) => {
        const active = option.key === activeKey;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              categoryStyles.subcategoryChip,
              active && categoryStyles.subcategoryChipActive,
            ]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.86}
          >
            <Text
              style={[
                categoryStyles.subcategoryChipText,
                active && categoryStyles.subcategoryChipTextActive,
              ]}
              numberOfLines={1}
            >
              {option.label}
              {typeof option.count === "number" ? ` (${option.count})` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function CategorySubcategorySection({
  title,
  products,
  cardWidth,
  onViewAll,
  maxPreview = 4,
  columns = 2,
}: {
  title: string;
  products: CatalogProductItem[];
  cardWidth: number;
  onViewAll?: () => void;
  maxPreview?: number;
  columns?: number;
}) {
  const previewProducts = products.slice(0, maxPreview);

  if (!products.length) {
    return null;
  }

  return (
    <View style={categoryStyles.subcategorySection}>
      <View style={categoryStyles.subcategorySectionHeader}>
        <Text style={categoryStyles.subcategorySectionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={categoryStyles.subcategorySectionCount}>
          {products.length} {products.length === 1 ? "item" : "items"}
        </Text>
        {onViewAll ? (
          <TouchableOpacity
            style={categoryStyles.subcategorySeeAll}
            onPress={onViewAll}
            activeOpacity={0.85}
          >
            <Text style={categoryStyles.subcategorySeeAllText}>
              {products.length > maxPreview ? "View all" : "Shop"}
            </Text>
            <Ionicons name="chevron-forward" size={rMS(14)} color={AppColors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={categoryStyles.sectionProductGrid}>
        {previewProducts.map((item) => (
          <View key={item.id} style={{ width: cardWidth }}>
            <ProductCard {...item} cardWidth={cardWidth} horizontalSpacing={0} />
          </View>
        ))}
      </View>
      {products.length > maxPreview && columns > 1 ? (
        <Text style={categoryStyles.subcategorySectionCount}>
          +{products.length - maxPreview} more in this subcategory
        </Text>
      ) : null}
    </View>
  );
}

export function CategoryInsightCard({ title, subtitle, stats }: CategoryInsightCardProps) {
  return (
    <View style={[accountStyles.insightCard, categoryStyles.insightCardExpanded]}>
      <Text style={[accountStyles.insightTitle, categoryStyles.insightTitleExpanded]}>
        {title}
      </Text>
      <Text style={accountStyles.insightSubtitle}>{subtitle}</Text>
      <View style={categoryStyles.statsRowExpanded}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 ? <View style={categoryStyles.statDivider} /> : null}
            <View style={categoryStyles.statBox}>
              <Text style={categoryStyles.statValueExpanded}>{stat.value}</Text>
              <Text style={categoryStyles.statLabelExpanded}>{stat.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

type CategoryBrowseCardProps = {
  title: string;
  subtitle: string;
  image: ImageSourcePropType | null;
  subcategoryCount?: number;
  onPress?: () => void;
};

export function CategoryBrowseCard({
  title,
  subtitle,
  image,
  subcategoryCount,
  onPress,
}: CategoryBrowseCardProps) {
  const actionLabel = subcategoryCount
    ? `Browse · ${subcategoryCount} subcategories`
    : "Browse category";

  return (
    <AccountListCard>
      <TouchableOpacity
        style={categoryStyles.browseCard}
        onPress={onPress}
        activeOpacity={0.9}
        disabled={!onPress}
      >
        <View style={categoryStyles.browseCopy}>
          <Text style={categoryStyles.browseTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={categoryStyles.browseSubtitle} numberOfLines={3}>
            {subtitle}
          </Text>
          <Text style={categoryStyles.browseMeta}>{actionLabel}</Text>
          <View style={categoryStyles.browseCta}>
            <Text style={categoryStyles.browseCtaText}>
              {subcategoryCount ? "Shop subcategories" : "Shop now"}
            </Text>
            <Ionicons name="arrow-forward" size={rMS(14)} color="#FFFFFF" />
          </View>
        </View>

        <View style={categoryStyles.imageWrap}>
          {image ? (
            <Image source={image} style={categoryStyles.image} resizeMode="cover" />
          ) : (
            <View style={categoryStyles.imagePlaceholder}>
              <Ionicons name="grid-outline" size={rMS(24)} color="#94A3B8" />
              <Text style={categoryStyles.placeholderText}>Image pending</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </AccountListCard>
  );
}

export function CategoryDetailMetaLine({
  productCount,
  subcategoryCount,
}: {
  productCount: number;
  subcategoryCount: number;
}) {
  if (productCount <= 0 && subcategoryCount <= 0) {
    return null;
  }

  const parts: string[] = [];
  if (productCount > 0) {
    parts.push(`${productCount} ${productCount === 1 ? "product" : "products"}`);
  }
  if (subcategoryCount > 0) {
    parts.push(
      `${subcategoryCount} ${subcategoryCount === 1 ? "subcategory" : "subcategories"}`,
    );
  }

  return <Text style={categoryStyles.detailMetaLine}>{parts.join(" · ")}</Text>;
}

export function CategoryBrowseCardFromItem({
  item,
  onPress,
}: {
  item: CatalogCategoryItem;
  onPress: () => void;
}) {
  return (
    <CategoryBrowseCard
      title={item.title}
      subtitle={item.subtitle}
      image={item.image ?? null}
      subcategoryCount={item.subcategories?.length}
      onPress={onPress}
    />
  );
}
