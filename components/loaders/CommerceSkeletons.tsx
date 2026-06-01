import { AppColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { gridCardWidth, rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SkeletonBlock } from "@/components/loaders/Skeleton";

const SHEET_PEEK = rV(196);

export function HomeHeaderSkeleton() {
  return (
    <View style={styles.homeHeader}>
      <View style={styles.homeHeaderLeft}>
        <SkeletonBlock width={rS(44)} height={rS(44)} radius={22} />
        <View style={styles.homeHeaderText}>
          <SkeletonBlock width={rS(108)} height={rV(12)} radius={8} />
          <SkeletonBlock width={rS(140)} height={rV(18)} radius={10} style={styles.mt8} />
        </View>
      </View>
      <SkeletonBlock width={rS(40)} height={rS(40)} radius={20} />
    </View>
  );
}

export function SearchLauncherSkeleton() {
  return (
    <SkeletonBlock
      height={rV(46)}
      radius={999}
      style={{ marginHorizontal: rS(16), marginTop: rV(12) }}
    />
  );
}

export function SectionTitleSkeleton() {
  return (
    <View style={styles.sectionHeader}>
      <SkeletonBlock width="42%" height={rV(22)} radius={10} />
      <SkeletonBlock width="18%" height={rV(16)} radius={8} />
    </View>
  );
}

export function FlashSalesRowSkeleton() {
  return (
    <View style={styles.horizontalRow}>
      <SkeletonBlock width={rS(220)} height={rV(168)} radius={26} />
      <SkeletonBlock width={rS(220)} height={rV(168)} radius={26} />
    </View>
  );
}

export function PromoBannerSkeleton() {
  return (
    <SkeletonBlock
      height={rV(166)}
      radius={28}
      style={{ marginHorizontal: rS(16), marginTop: rV(18) }}
    />
  );
}

export function HorizontalStoreRowSkeleton() {
  return (
    <View style={styles.horizontalRow}>
      <StoreCardSkeleton compact />
      <StoreCardSkeleton compact />
    </View>
  );
}

export function HorizontalProductRowSkeleton() {
  return (
    <View style={styles.horizontalRow}>
      <SkeletonBlock width={rS(148)} height={rV(188)} radius={22} />
      <SkeletonBlock width={rS(148)} height={rV(188)} radius={22} />
      <SkeletonBlock width={rS(148)} height={rV(188)} radius={22} />
    </View>
  );
}

export function MarketsRowSkeleton() {
  return (
    <View style={styles.horizontalRow}>
      <SkeletonBlock width={rS(120)} height={rV(132)} radius={22} />
      <SkeletonBlock width={rS(120)} height={rV(132)} radius={22} />
      <SkeletonBlock width={rS(120)} height={rV(132)} radius={22} />
    </View>
  );
}

export function HomeFeedSkeleton() {
  const { colors } = useTheme();
  const homeContainer = useMemo(
    () => ({ ...styles.homeContainer, backgroundColor: colors.screen }),
    [colors],
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={homeContainer}
    >
      <HomeHeaderSkeleton />
      <SearchLauncherSkeleton />
      <View style={[styles.sectionBlock, styles.sectionGap]}>
        <SectionTitleSkeleton />
        <FlashSalesRowSkeleton />
      </View>
      <PromoBannerSkeleton />
      <View style={[styles.sectionBlock, styles.sectionGap]}>
        <SectionTitleSkeleton />
        <RecommendationSkeleton />
        <RecommendationSkeleton />
      </View>
      <View style={[styles.sectionBlock, styles.sectionGap]}>
        <SectionTitleSkeleton />
        <HorizontalStoreRowSkeleton />
      </View>
      <View style={[styles.sectionBlock, styles.sectionGap]}>
        <SectionTitleSkeleton />
        <HorizontalProductRowSkeleton />
      </View>
      <View style={[styles.sectionBlock, styles.sectionGap]}>
        <SectionTitleSkeleton />
        <MarketsRowSkeleton />
      </View>
    </ScrollView>
  );
}

export function CategoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.stackGap}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`category-skeleton-${index}`} style={styles.categoryCard}>
          <SkeletonBlock width={rS(76)} height={rS(76)} radius={24} />
          <View style={styles.flexOne}>
            <SkeletonBlock width="44%" height={rV(16)} radius={10} />
            <SkeletonBlock width="68%" height={rV(12)} radius={8} style={styles.mt8} />
            <SkeletonBlock width="30%" height={rV(12)} radius={8} style={styles.mt10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.gridWrap}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`product-grid-${index}`} style={styles.gridCard}>
          <SkeletonBlock height={rV(176)} radius={22} />
          <SkeletonBlock width="72%" height={rV(14)} radius={8} style={styles.mt12} />
          <SkeletonBlock width="48%" height={rV(12)} radius={8} style={styles.mt8} />
          <SkeletonBlock width="38%" height={rV(16)} radius={10} style={styles.mt12} />
        </View>
      ))}
    </View>
  );
}

export function ProductListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.stackGap}>
      {Array.from({ length: count }).map((_, index) => (
        <RecommendationSkeleton key={`product-list-${index}`} />
      ))}
    </View>
  );
}

export function StoreGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.gridWrap}>
      {Array.from({ length: count }).map((_, index) => (
        <StoreCardSkeleton key={`store-grid-${index}`} />
      ))}
    </View>
  );
}

export function StoreProfileSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
      <SkeletonBlock height={rV(220)} radius={0} />
      <View style={styles.storeProfileShell}>
        <SkeletonBlock width={rS(94)} height={rS(94)} radius={28} style={styles.pullUpLogo} />
        <SkeletonBlock width="58%" height={rV(24)} radius={12} />
        <SkeletonBlock width="38%" height={rV(14)} radius={8} style={styles.mt10} />
        <SkeletonBlock width="70%" height={rV(14)} radius={8} style={styles.mt8} />
        <View style={styles.rowGapWrap}>
          <SkeletonBlock width={rS(82)} height={rV(30)} radius={999} />
          <SkeletonBlock width={rS(110)} height={rV(30)} radius={999} />
          <SkeletonBlock width={rS(104)} height={rV(30)} radius={999} />
        </View>
        <View style={styles.sectionGap}>
          <SkeletonBlock width="36%" height={rV(20)} radius={10} />
          <ProductGridSkeleton count={4} />
        </View>
      </View>
    </ScrollView>
  );
}

/** Matches StoreLocationExperience: full map canvas + bottom sheet peek. */
export function StoreMapSkeleton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const mapStyles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        mapCanvas: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.imagePlaceholder,
        },
        mapGrid: {
          ...StyleSheet.absoluteFillObject,
          opacity: 0.35,
          justifyContent: "space-evenly",
          paddingHorizontal: rS(12),
        },
        mapGridRow: {
          flexDirection: "row",
          justifyContent: "space-evenly",
        },
        topChrome: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: rS(16),
          gap: rS(12),
        },
        topText: {
          flex: 1,
          gap: rV(6),
        },
        mapControl: {
          position: "absolute",
          right: rS(16),
          bottom: SHEET_PEEK + insets.bottom + rV(36),
        },
        sheet: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: SHEET_PEEK + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.card,
          borderTopLeftRadius: rMS(28),
          borderTopRightRadius: rMS(28),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          paddingHorizontal: rS(18),
          paddingTop: rV(10),
        },
        sheetHandle: {
          alignSelf: "center",
          marginBottom: rV(14),
        },
        peekRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        peekCopy: {
          flex: 1,
          gap: rV(6),
        },
        quickActions: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
          marginTop: rV(14),
        },
      }),
    [colors, insets.bottom],
  );

  return (
    <View style={mapStyles.screen}>
      <View style={mapStyles.mapCanvas}>
        <View style={mapStyles.mapGrid}>
          {Array.from({ length: 6 }).map((_, row) => (
            <View key={`map-row-${row}`} style={mapStyles.mapGridRow}>
              {Array.from({ length: 5 }).map((__, col) => (
                <SkeletonBlock
                  key={`map-cell-${row}-${col}`}
                  width={rS(48)}
                  height={rV(48)}
                  radius={rS(6)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={[mapStyles.topChrome, { paddingTop: insets.top + rV(10) }]}>
        <SkeletonBlock width={rS(44)} height={rS(44)} radius={22} />
        <View style={mapStyles.topText}>
          <SkeletonBlock width={rS(96)} height={rV(10)} radius={6} />
          <SkeletonBlock width={rS(148)} height={rV(18)} radius={10} />
        </View>
      </View>

      <View style={mapStyles.mapControl}>
        <SkeletonBlock width={rS(48)} height={rS(48)} radius={16} />
      </View>

      <View style={mapStyles.sheet}>
        <SkeletonBlock
          width={rS(46)}
          height={rV(5)}
          radius={999}
          style={mapStyles.sheetHandle}
        />
        <View style={mapStyles.peekRow}>
          <SkeletonBlock width={rS(54)} height={rS(54)} radius={18} />
          <View style={mapStyles.peekCopy}>
            <SkeletonBlock width="72%" height={rV(17)} radius={10} />
            <SkeletonBlock width="48%" height={rV(12)} radius={8} />
          </View>
          <SkeletonBlock width={rS(20)} height={rS(20)} radius={10} />
        </View>
        <View style={mapStyles.quickActions}>
          <SkeletonBlock width={rS(112)} height={rV(38)} radius={999} />
          <SkeletonBlock width={rS(72)} height={rV(38)} radius={999} />
          <SkeletonBlock width={rS(96)} height={rV(38)} radius={999} />
        </View>
      </View>
    </View>
  );
}

export function ProductDetailSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
      <SkeletonBlock height={rV(336)} radius={32} />
      <View style={styles.sectionGap}>
        <View style={styles.rowGapWrap}>
          <SkeletonBlock width={rS(74)} height={rV(28)} radius={999} />
          <SkeletonBlock width={rS(108)} height={rV(28)} radius={999} />
        </View>
        <SkeletonBlock width="72%" height={rV(30)} radius={12} style={styles.mt12} />
        <SkeletonBlock width="90%" height={rV(16)} radius={10} style={styles.mt10} />
        <SkeletonBlock width="100%" height={rV(120)} radius={28} style={styles.mt16} />
        <SkeletonBlock width="100%" height={rV(138)} radius={28} style={styles.mt16} />
        <SkeletonBlock width="100%" height={rV(160)} radius={28} style={styles.mt16} />
      </View>
    </ScrollView>
  );
}

function RecommendationSkeleton() {
  return (
    <View style={styles.recommendationCard}>
      <SkeletonBlock width={rS(132)} height={rV(132)} radius={24} />
      <View style={styles.flexOne}>
        <View style={styles.rowBetween}>
          <SkeletonBlock width="34%" height={rV(12)} radius={8} />
          <SkeletonBlock width="18%" height={rV(12)} radius={8} />
        </View>
        <SkeletonBlock width="76%" height={rV(18)} radius={10} style={styles.mt12} />
        <SkeletonBlock width="48%" height={rV(14)} radius={8} style={styles.mt8} />
        <SkeletonBlock width="64%" height={rV(12)} radius={8} style={styles.mt12} />
        <View style={styles.rowBetweenTight}>
          <SkeletonBlock width="30%" height={rV(18)} radius={10} />
          <View style={styles.rowGapWrap}>
            <SkeletonBlock width={rS(42)} height={rS(42)} radius={21} />
            <SkeletonBlock width={rS(42)} height={rS(42)} radius={21} />
          </View>
        </View>
      </View>
    </View>
  );
}

function StoreCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.storeCard, compact && styles.storeCardCompact]}>
      <SkeletonBlock height={compact ? rV(120) : rV(150)} radius={24} />
      <SkeletonBlock width="66%" height={rV(14)} radius={8} style={styles.mt12} />
      <SkeletonBlock width="42%" height={rV(12)} radius={8} style={styles.mt8} />
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    paddingTop: rV(8),
    paddingBottom: rV(80),
    gap: rV(4),
    backgroundColor: "#F5F7FA",
  },
  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    paddingTop: rV(10),
  },
  homeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  homeHeaderText: {
    gap: rV(4),
  },
  sectionBlock: {
    paddingHorizontal: rS(16),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rV(12),
  },
  horizontalRow: {
    flexDirection: "row",
    gap: rS(12),
    paddingLeft: rS(16),
    marginLeft: -rS(16),
  },
  detailContainer: {
    paddingBottom: rV(72),
    backgroundColor: "#F5F7FA",
  },
  sectionGap: {
    gap: rV(14),
    marginTop: rV(18),
  },
  stackGap: {
    gap: rV(12),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBetweenTight: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowGapWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
    alignItems: "center",
  },
  recommendationCard: {
    flexDirection: "row",
    gap: rS(14),
    padding: rS(14),
    backgroundColor: AppColors.white,
    borderRadius: rMS(26),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  categoryCard: {
    flexDirection: "row",
    gap: rS(14),
    padding: rS(14),
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  flexOne: {
    flex: 1,
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(12),
  },
  gridCard: {
    width: "47%",
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    padding: rS(12),
  },
  storeCard: {
    width: "47%",
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    padding: rS(12),
  },
  storeCardCompact: {
    width: rS(170),
  },
  storeProfileShell: {
    marginTop: -rV(26),
    marginHorizontal: rS(16),
    paddingHorizontal: rS(16),
    paddingBottom: rV(24),
    backgroundColor: "#F5F7FA",
    gap: rV(10),
  },
  pullUpLogo: {
    marginTop: -rV(42),
    borderWidth: 6,
    borderColor: "#F5F7FA",
  },
  mt8: {
    marginTop: rV(8),
  },
  mt10: {
    marginTop: rV(10),
  },
  mt12: {
    marginTop: rV(12),
  },
  mt16: {
    marginTop: rV(16),
  },
});

export function CartPageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ paddingHorizontal: rS(16), paddingTop: rV(14) }}>
      <View
        style={{
          backgroundColor: AppColors.white,
          borderRadius: rMS(20),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "#E6EAF0",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={`cart-skeleton-${index}`}
            style={{
              padding: rS(12),
              borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
              borderTopColor: "#F1F5F9",
            }}
          >
            <View style={{ flexDirection: "row", gap: rS(10), alignItems: "center" }}>
              <SkeletonBlock width={rS(58)} height={rS(58)} radius={14} />
              <View style={{ flex: 1, gap: rV(6) }}>
                <SkeletonBlock width="78%" height={rV(12)} radius={6} />
                <SkeletonBlock width="40%" height={rV(10)} radius={6} />
                <SkeletonBlock width="55%" height={rV(22)} radius={10} />
              </View>
            </View>
          </View>
        ))}
      </View>
      <SkeletonBlock height={rV(120)} radius={18} style={{ marginTop: rV(12) }} />
    </View>
  );
}

export function WishlistGridSkeleton({
  columns = 2,
  count = 4,
}: {
  columns?: number;
  count?: number;
}) {
  const cardWidth = gridCardWidth(
    Dimensions.get("window").width,
    columns,
    rS(12),
  );

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: rS(12),
        paddingHorizontal: rS(16),
        paddingTop: rV(18),
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock
          key={`wishlist-skeleton-${index}`}
          width={cardWidth}
          height={rV(168)}
          radius={18}
        />
      ))}
    </View>
  );
}
