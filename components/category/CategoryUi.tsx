import {
  AccountInsightCard,
  AccountListCard,
  useAccountStyles,
} from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import type { CatalogCategoryItem } from "@/hooks/useCatalog";
import { productCardGapY, rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import type { CatalogProductItem } from "@/hooks/useCatalog";
import ProductCard from "@/components/cards/ProductCard";
import CommerceImage from "@/components/media/CommerceImage";
import React, { useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
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
  useAccountStyles,
} from "@/components/account/AccountUi";

function createCategoryStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      backgroundColor: colors.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
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
      backgroundColor: colors.border,
    },
    statValueExpanded: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(24),
      color: colors.text,
    },
    statLabelExpanded: {
      marginTop: rV(6),
      fontFamily: Fonts.title,
      fontSize: rMS(12),
      color: colors.textMuted,
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
      color: colors.text,
    },
    browseSubtitle: {
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: colors.textMuted,
    },
    browseMeta: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: colors.primary,
    },
    imageWrap: {
      width: rS(96),
      height: rS(96),
      borderRadius: rMS(22),
      backgroundColor: colors.imagePlaceholder,
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
      color: colors.placeholder,
      textAlign: "center",
    },
    browseCta: {
      marginTop: rV(4),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
      backgroundColor: colors.inverseSurface,
      paddingHorizontal: rS(14),
      paddingVertical: rV(9),
      borderRadius: rMS(999),
    },
    browseCtaText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11.5),
      color: colors.onInverseSurface,
    },
    detailMetaLine: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
      paddingHorizontal: rS(2),
    },
    detailHero: {
      gap: rV(6),
    },
    detailTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(20),
      color: colors.text,
    },
    detailSubtitle: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: colors.textMuted,
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
      color: colors.primary,
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
      backgroundColor: colors.segmentBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    subcategoryChipActive: {
      backgroundColor: colors.inverseSurface,
      borderColor: colors.inverseSurface,
    },
    subcategoryChipText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12.5),
      color: colors.text,
    },
    subcategoryChipTextActive: {
      color: colors.onInverseSurface,
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
      color: colors.text,
    },
    subcategorySectionCount: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
    subcategorySeeAll: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(4),
    },
    subcategorySeeAllText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: colors.primary,
    },
    subcategoryProductRow: {
      gap: rS(10),
      paddingRight: rS(4),
    },
    subcategoryEmpty: {
      borderRadius: rMS(16),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: rS(14),
      paddingVertical: rV(14),
      gap: rV(4),
    },
    subcategoryEmptyTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },
    subcategoryEmptyText: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(18),
      color: colors.textMuted,
    },
    tabSectionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: colors.text,
    },
    tabSectionHint: {
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: colors.textMuted,
      marginTop: rV(4),
    },
    departmentRow: {
      gap: rS(10),
      paddingVertical: rV(2),
    },
    departmentCard: {
      width: rS(148),
      borderRadius: rMS(20),
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    departmentImage: {
      width: "100%",
      height: rV(92),
      backgroundColor: colors.imagePlaceholder,
    },
    departmentBody: {
      paddingHorizontal: rS(12),
      paddingVertical: rV(12),
      gap: rV(4),
    },
    departmentTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    departmentSubtitle: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      lineHeight: rMS(16),
      color: colors.textMuted,
    },
    collectionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(10),
    },
    collectionTile: {
      flex: 1,
      borderRadius: rMS(20),
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    collectionImage: {
      width: "100%",
      height: rV(108),
      backgroundColor: colors.imagePlaceholder,
    },
    collectionBody: {
      paddingHorizontal: rS(12),
      paddingVertical: rV(12),
      gap: rV(6),
    },
    collectionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: colors.text,
    },
    collectionMeta: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: colors.primary,
    },
    heroCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      borderRadius: rMS(20),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: rS(12),
    },
    heroImage: {
      width: rS(72),
      height: rS(72),
      borderRadius: rMS(16),
      backgroundColor: colors.border,
    },
    heroCopy: {
      flex: 1,
      gap: rV(4),
    },
    heroTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(18),
      color: colors.text,
    },
    heroMeta: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
    sectionProductGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: productCardGapY(),
    },
  });
}

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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  return (
    <View>
      <Text style={styles.tabSectionTitle}>{title}</Text>
      {hint ? <Text style={styles.tabSectionHint}>{hint}</Text> : null}
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={styles.departmentCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <CommerceImage
        source={image}
        style={styles.departmentImage}
        contentFit="cover"
        recyclingKey={title}
      />
      <View style={styles.departmentBody}>
        <Text style={styles.departmentTitle}>{title}</Text>
        <Text style={styles.departmentSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        {typeof productCount === "number" ? (
          <Text style={styles.collectionMeta}>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={styles.collectionTile}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image ? (
        <CommerceImage
          source={image}
          style={styles.collectionImage}
          contentFit="cover"
          recyclingKey={title}
        />
      ) : (
        <View style={[styles.collectionImage, styles.imagePlaceholder]}>
          <Ionicons name="grid-outline" size={rMS(22)} color={colors.iconMuted} />
        </View>
      )}
      <View style={styles.collectionBody}>
        <Text style={styles.collectionTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.collectionMeta} numberOfLines={1}>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  return (
    <View style={styles.heroCard}>
      {image ? (
        <CommerceImage
          source={image}
          style={styles.heroImage}
          contentFit="cover"
          recyclingKey={title}
        />
      ) : (
        <View style={[styles.heroImage, styles.imagePlaceholder]}>
          <Ionicons name="grid-outline" size={rMS(20)} color={colors.iconMuted} />
        </View>
      )}
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.heroMeta} numberOfLines={2}>
          {subtitle}
        </Text>
        <Text style={styles.detailMeta}>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  return (
    <View style={styles.detailIntro}>
      <Text style={styles.detailSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      <Text style={styles.detailMeta}>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);

  if (options.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScroller}
      contentContainerStyle={[
        styles.chipRow,
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
              styles.subcategoryChip,
              active && styles.subcategoryChipActive,
            ]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.86}
          >
            <Text
              style={[
                styles.subcategoryChipText,
                active && styles.subcategoryChipTextActive,
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  const previewProducts = products.slice(0, maxPreview);

  if (!products.length) {
    return null;
  }

  return (
    <View style={styles.subcategorySection}>
      <View style={styles.subcategorySectionHeader}>
        <Text style={styles.subcategorySectionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subcategorySectionCount}>
          {products.length} {products.length === 1 ? "item" : "items"}
        </Text>
        {onViewAll ? (
          <TouchableOpacity
            style={styles.subcategorySeeAll}
            onPress={onViewAll}
            activeOpacity={0.85}
          >
            <Text style={styles.subcategorySeeAllText}>
              {products.length > maxPreview ? "View all" : "Shop"}
            </Text>
            <Ionicons name="chevron-forward" size={rMS(14)} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.sectionProductGrid}>
        {previewProducts.map((item) => (
          <View key={item.id} style={{ width: cardWidth }}>
            <ProductCard {...item} cardWidth={cardWidth} horizontalSpacing={0} />
          </View>
        ))}
      </View>
      {products.length > maxPreview && columns > 1 ? (
        <Text style={styles.subcategorySectionCount}>
          +{products.length - maxPreview} more in this subcategory
        </Text>
      ) : null}
    </View>
  );
}

export function CategoryInsightCard({ title, subtitle, stats }: CategoryInsightCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);
  const accountStyles = useAccountStyles();
  return (
    <View style={[accountStyles.insightCard, styles.insightCardExpanded]}>
      <Text style={[accountStyles.insightTitle, styles.insightTitleExpanded]}>
        {title}
      </Text>
      <Text style={accountStyles.insightSubtitle}>{subtitle}</Text>
      <View style={styles.statsRowExpanded}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 ? <View style={styles.statDivider} /> : null}
            <View style={styles.statBox}>
              <Text style={styles.statValueExpanded}>{stat.value}</Text>
              <Text style={styles.statLabelExpanded}>{stat.label}</Text>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);

  const actionLabel = subcategoryCount
    ? `Browse · ${subcategoryCount} subcategories`
    : "Browse category";

  return (
    <AccountListCard>
      <TouchableOpacity
        style={styles.browseCard}
        onPress={onPress}
        activeOpacity={0.9}
        disabled={!onPress}
      >
        <View style={styles.browseCopy}>
          <Text style={styles.browseTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.browseSubtitle} numberOfLines={3}>
            {subtitle}
          </Text>
          <Text style={styles.browseMeta}>{actionLabel}</Text>
          <View style={styles.browseCta}>
            <Text style={styles.browseCtaText}>
              {subcategoryCount ? "Shop subcategories" : "Shop now"}
            </Text>
            <Ionicons name="arrow-forward" size={rMS(14)} color={colors.onPrimary} />
          </View>
        </View>

        <View style={styles.imageWrap}>
          {image ? (
            <CommerceImage
              source={image}
              style={styles.image}
              contentFit="cover"
              recyclingKey={title}
              placeholderColor={colors.imagePlaceholder}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="grid-outline" size={rMS(24)} color={colors.iconMuted} />
              <Text style={styles.placeholderText}>Image pending</Text>
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
  hasMore = false,
}: {
  productCount: number;
  subcategoryCount: number;
  hasMore?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createCategoryStyles(colors), [colors]);

  if (productCount <= 0 && subcategoryCount <= 0) {
    return null;
  }

  const parts: string[] = [];
  if (productCount > 0) {
    const countLabel = hasMore ? `${productCount}+` : String(productCount);
    parts.push(`${countLabel} ${productCount === 1 && !hasMore ? "product" : "products"}`);
  }
  if (subcategoryCount > 0) {
    parts.push(
      `${subcategoryCount} ${subcategoryCount === 1 ? "subcategory" : "subcategories"}`,
    );
  }

  return <Text style={styles.detailMetaLine}>{parts.join(" · ")}</Text>;
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
