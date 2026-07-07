import { useTheme } from "@/context/ThemeContext";
import { gridCardWidth, rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STOREFRONT_COVER_HEIGHT } from "@/components/store/StorefrontExperience";
import {
  SkeletonLine,
  SkeletonListRow,
  SkeletonProductRow,
  SkeletonTile,
} from "@/components/loaders/Skeleton";

const SHEET_PEEK = rV(196);
const STRIP_TILE_W = rS(168);
const STRIP_TILE_H = rV(128);

type SectionVariant = "banner" | "strip" | "row";

export function SectionSkeleton({
  variant = "row",
  delay = 0,
}: {
  variant?: SectionVariant;
  delay?: number;
}) {
  if (variant === "banner") {
    return <SkeletonTile height={rV(132)} radius={rMS(22)} delay={delay} />;
  }

  if (variant === "strip") {
    return (
      <View style={styles.strip}>
        <SkeletonTile
          width={STRIP_TILE_W}
          height={STRIP_TILE_H}
          radius={rMS(20)}
          delay={delay}
        />
        <SkeletonTile
          width={STRIP_TILE_W}
          height={STRIP_TILE_H}
          radius={rMS(20)}
          delay={delay + 70}
        />
      </View>
    );
  }

  return <SkeletonProductRow delay={delay} />;
}

/** Initial home feed — staggered, shape-matched placeholders. */
export function HomeContentSkeleton() {
  return (
    <View style={styles.feedGap}>
      <View style={styles.feedBlock}>
        <SkeletonLine width={rS(72)} height={rV(8)} delay={0} />
        <SectionSkeleton variant="strip" delay={60} />
      </View>

      <View style={styles.feedBlock}>
        <SkeletonLine width={rS(88)} height={rV(8)} delay={120} />
        <SkeletonTile height={rV(132)} radius={rMS(22)} delay={180} />
      </View>

      <View style={styles.feedBlock}>
        <SkeletonLine width={rS(64)} height={rV(8)} delay={240} />
        <SkeletonProductRow delay={300} />
      </View>
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={homeContainer}>
      <View style={styles.homeHeader}>
        <SkeletonTile width={rS(40)} height={rS(40)} radius={20} delay={0} />
        <View style={{ flex: 1, gap: rV(7) }}>
          <SkeletonLine width="36%" delay={30} />
          <SkeletonLine width="50%" height={rV(12)} delay={60} />
        </View>
        <SkeletonTile width={rS(36)} height={rS(36)} radius={18} delay={30} />
      </View>
      <SkeletonTile
        height={rV(44)}
        radius={999}
        delay={90}
        style={{ marginHorizontal: rS(16), marginTop: rV(12) }}
      />
      <View style={[styles.sectionBlock, { marginTop: rV(20) }]}>
        <HomeContentSkeleton />
      </View>
    </ScrollView>
  );
}

export const FlashSalesRowSkeleton = () => <SectionSkeleton variant="strip" />;
export const HorizontalStoreRowSkeleton = () => <SectionSkeleton variant="strip" />;
export const HorizontalProductRowSkeleton = () => <SectionSkeleton variant="strip" />;
export const MarketsRowSkeleton = () => <SectionSkeleton variant="strip" />;
export const PromoBannerSkeleton = () => <SectionSkeleton variant="banner" />;
export const HomeHeaderSkeleton = () => null;
export const SearchLauncherSkeleton = () => null;
export const SectionTitleSkeleton = () => <SkeletonLine width="32%" height={rV(12)} />;

export function CategoryListSkeleton({ count = 3 }: { count?: number }) {
  const safeCount = Math.min(count, 3);

  return (
    <View style={styles.stackGap}>
      {Array.from({ length: safeCount }).map((_, index) => (
        <SkeletonListRow key={`category-skeleton-${index}`} delay={index * 80} />
      ))}
    </View>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  const safeCount = Math.min(count, 4);

  return (
    <View style={styles.gridWrap}>
      {Array.from({ length: safeCount }).map((_, index) => (
        <SkeletonTile
          key={`product-grid-${index}`}
          width="47%"
          height={rV(160)}
          radius={rMS(16)}
          delay={index * 60}
        />
      ))}
    </View>
  );
}

export function ProductListSkeleton({ count = 2 }: { count?: number }) {
  const safeCount = Math.min(count, 2);

  return (
    <View style={styles.stackGap}>
      {Array.from({ length: safeCount }).map((_, index) => (
        <SkeletonProductRow key={`product-list-${index}`} delay={index * 90} />
      ))}
    </View>
  );
}

export function StoreGridSkeleton({ count = 4 }: { count?: number }) {
  const safeCount = Math.min(count, 4);

  return (
    <View style={styles.gridWrap}>
      {Array.from({ length: safeCount }).map((_, index) => (
        <SkeletonTile
          key={`store-grid-${index}`}
          width="47%"
          height={rV(136)}
          radius={rMS(16)}
          delay={index * 60}
        />
      ))}
    </View>
  );
}

export function StoreProfileSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
      <SkeletonTile height={STOREFRONT_COVER_HEIGHT} radius={0} delay={0} />
      <View style={styles.storeProfileShell}>
        <SkeletonTile
          width={rS(96)}
          height={rS(96)}
          radius={rS(30)}
          delay={80}
          style={styles.pullUpLogo}
        />
        <SkeletonLine width="52%" height={rV(18)} delay={120} />
        <SkeletonLine width="34%" delay={160} />
        <SkeletonLine width="78%" delay={200} />
        <View style={{ flexDirection: "row", gap: rS(10), marginTop: rV(8) }}>
          <SkeletonTile width="48%" height={rV(48)} radius={rS(14)} delay={240} />
          <SkeletonTile width="48%" height={rV(48)} radius={rS(14)} delay={280} />
        </View>
        <ProductGridSkeleton count={2} />
      </View>
    </ScrollView>
  );
}

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
        sheet: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: SHEET_PEEK + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.card,
          borderTopLeftRadius: rMS(24),
          borderTopRightRadius: rMS(24),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          paddingHorizontal: rS(18),
          paddingTop: rV(10),
        },
      }),
    [colors, insets.bottom],
  );

  return (
    <View style={mapStyles.screen}>
      <View style={mapStyles.mapCanvas} />
      <View style={[mapStyles.topChrome, { paddingTop: insets.top + rV(10) }]}>
        <SkeletonTile width={rS(40)} height={rS(40)} radius={20} />
        <View style={mapStyles.topText}>
          <SkeletonLine width={rS(84)} />
          <SkeletonLine width={rS(124)} height={rV(11)} />
        </View>
      </View>
      <View style={mapStyles.sheet}>
        <SkeletonLine
          width={rS(36)}
          height={rV(4)}
          radius={999}
          style={{ alignSelf: "center", marginBottom: rV(14) }}
        />
        <SkeletonListRow />
      </View>
    </View>
  );
}

export function ProductDetailSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
      <SkeletonTile height={rV(300)} radius={0} delay={0} />
      <View style={styles.detailBody}>
        <SkeletonLine width="58%" height={rV(17)} delay={80} />
        <SkeletonLine width="82%" delay={120} />
        <SkeletonLine width="36%" height={rV(13)} delay={160} />
        <SkeletonTile height={rV(88)} radius={rMS(16)} delay={200} style={{ marginTop: rV(6) }} />
      </View>
    </ScrollView>
  );
}

export function CartPageSkeleton({ count = 2 }: { count?: number }) {
  const safeCount = Math.min(count, 2);

  return (
    <View style={{ paddingHorizontal: rS(16), paddingTop: rV(14), gap: rV(14) }}>
      {Array.from({ length: safeCount }).map((_, index) => (
        <SkeletonListRow key={`cart-skeleton-${index}`} delay={index * 80} />
      ))}
      <SkeletonTile height={rV(84)} radius={rMS(14)} delay={160} />
    </View>
  );
}

export function WishlistGridSkeleton({
  columns = 2,
  count = 2,
}: {
  columns?: number;
  count?: number;
}) {
  const cardWidth = gridCardWidth(Dimensions.get("window").width, columns, rS(12));
  const safeCount = Math.min(count, columns);

  return (
    <View style={styles.wishlistGrid}>
      {Array.from({ length: safeCount }).map((_, index) => (
        <SkeletonTile
          key={`wishlist-skeleton-${index}`}
          width={cardWidth}
          height={rV(152)}
          radius={rMS(16)}
          delay={index * 70}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    paddingTop: rV(8),
    paddingBottom: rV(80),
  },
  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingHorizontal: rS(16),
    paddingTop: rV(10),
  },
  sectionBlock: {
    paddingHorizontal: rS(16),
  },
  feedGap: {
    gap: rV(22),
  },
  feedBlock: {
    gap: rV(10),
  },
  strip: {
    flexDirection: "row",
    gap: rS(12),
  },
  stackGap: {
    gap: rV(12),
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(12),
  },
  detailContainer: {
    paddingBottom: rV(72),
  },
  detailBody: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
    gap: rV(10),
  },
  storeProfileShell: {
    marginTop: -rV(24),
    marginHorizontal: rS(16),
    paddingHorizontal: rS(16),
    paddingBottom: rV(24),
    gap: rV(12),
  },
  pullUpLogo: {
    marginTop: -rV(36),
  },
  wishlistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(12),
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
  },
});
