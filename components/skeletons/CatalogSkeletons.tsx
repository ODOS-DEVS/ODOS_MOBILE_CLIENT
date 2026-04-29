import { AppColors } from "@/constants/Colors";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type SkeletonBlockProps = {
  width?: number | string;
  height: number;
  radius?: number;
  style?: object;
};

export function SkeletonBlock({
  width = "100%",
  height,
  radius = 12,
  style,
}: SkeletonBlockProps) {
  return (
    <View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    />
  );
}

export function CategoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: rV(14) }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`category-skeleton-${index}`} style={styles.categoryCard}>
          <View style={styles.categoryText}>
            <SkeletonBlock width="55%" height={rV(20)} radius={8} />
            <SkeletonBlock
              width="40%"
              height={rV(14)}
              radius={8}
              style={{ marginTop: rV(8) }}
            />
            <SkeletonBlock
              width={rS(110)}
              height={rV(40)}
              radius={12}
              style={{ marginTop: rV(16) }}
            />
          </View>
          <SkeletonBlock width={rS(150)} height={rS(150)} radius={999} />
        </View>
      ))}
    </View>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.gridWrap}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`grid-skeleton-${index}`} style={styles.gridCard}>
          <SkeletonBlock width="100%" height={rV(132)} radius={16} />
          <SkeletonBlock
            width="70%"
            height={rV(14)}
            radius={8}
            style={{ marginTop: rV(12) }}
          />
          <SkeletonBlock
            width="45%"
            height={rV(12)}
            radius={8}
            style={{ marginTop: rV(8) }}
          />
          <SkeletonBlock
            width="38%"
            height={rV(14)}
            radius={8}
            style={{ marginTop: rV(12) }}
          />
        </View>
      ))}
    </View>
  );
}

export function RecommendationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: rV(10) }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`recommendation-skeleton-${index}`} style={styles.listCard}>
          <SkeletonBlock width={rS(90)} height={rS(80)} radius={12} />
          <View style={{ flex: 1, marginLeft: rS(12) }}>
            <SkeletonBlock width="62%" height={rV(14)} radius={8} />
            <SkeletonBlock
              width="42%"
              height={rV(12)}
              radius={8}
              style={{ marginTop: rV(8) }}
            />
            <SkeletonBlock
              width="48%"
              height={rV(14)}
              radius={8}
              style={{ marginTop: rV(12) }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function HorizontalProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: rS(16) }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={`horizontal-skeleton-${index}`} style={styles.horizontalCard}>
          <SkeletonBlock width="100%" height={rV(180)} radius={16} />
          <SkeletonBlock
            width="72%"
            height={rV(14)}
            radius={8}
            style={{ marginTop: rV(12) }}
          />
          <SkeletonBlock
            width="48%"
            height={rV(12)}
            radius={8}
            style={{ marginTop: rV(8) }}
          />
          <SkeletonBlock
            width="34%"
            height={rV(14)}
            radius={8}
            style={{ marginTop: rV(10) }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

export function ProductDetailSkeleton() {
  return (
    <View style={styles.detailContainer}>
      <SkeletonBlock width="100%" height={rV(340)} radius={0} />
      <View style={styles.detailContent}>
        <SkeletonBlock width="65%" height={rV(24)} radius={10} />
        <SkeletonBlock
          width="38%"
          height={rV(16)}
          radius={8}
          style={{ marginTop: rV(12) }}
        />
        <SkeletonBlock
          width="30%"
          height={rV(22)}
          radius={8}
          style={{ marginTop: rV(18) }}
        />
        <View style={styles.variantSkeletonCard}>
          <SkeletonBlock width="42%" height={rV(16)} radius={8} />
          <View style={styles.dotRow}>
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock
                key={`dot-${index}`}
                width={rS(40)}
                height={rS(40)}
                radius={999}
              />
            ))}
          </View>
          <SkeletonBlock
            width="32%"
            height={rV(16)}
            radius={8}
            style={{ marginTop: rV(18) }}
          />
          <View style={styles.dotRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock
                key={`size-${index}`}
                width={rS(42)}
                height={rV(36)}
                radius={12}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export function CheckoutSkeleton() {
  return (
    <View style={styles.checkoutWrap}>
      <View style={styles.checkoutCard}>
        <SkeletonBlock width="38%" height={rV(14)} radius={8} />
        <View style={[styles.listCard, { marginTop: rV(14), paddingHorizontal: 0, paddingVertical: 0, backgroundColor: "transparent" }]}>
          <SkeletonBlock width={rMS(88)} height={rMS(88)} radius={12} />
          <View style={{ flex: 1, marginLeft: rS(12) }}>
            <SkeletonBlock width="72%" height={rV(16)} radius={8} />
            <SkeletonBlock
              width="45%"
              height={rV(12)}
              radius={8}
              style={{ marginTop: rV(8) }}
            />
            <SkeletonBlock
              width="35%"
              height={rV(16)}
              radius={8}
              style={{ marginTop: rV(12) }}
            />
          </View>
        </View>
      </View>
      <View style={styles.checkoutCard}>
        <SkeletonBlock width="28%" height={rV(14)} radius={8} />
        <SkeletonBlock
          width="100%"
          height={rV(58)}
          radius={16}
          style={{ marginTop: rV(14) }}
        />
      </View>
      <View style={styles.checkoutCard}>
        <SkeletonBlock width="24%" height={rV(14)} radius={8} />
        <SkeletonBlock
          width="100%"
          height={rV(58)}
          radius={16}
          style={{ marginTop: rV(14) }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#E8EDF3",
  },
  categoryCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(20),
    paddingVertical: rV(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryText: {
    flex: 1,
    paddingRight: rS(12),
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  gridCard: {
    width: "47%",
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(12),
    marginBottom: rV(6),
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
  },
  horizontalCard: {
    width: rS(160),
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(10),
    marginRight: rS(10),
  },
  detailContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  detailContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(20),
  },
  variantSkeletonCard: {
    marginTop: rV(20),
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E8EDF3",
    padding: rS(16),
  },
  dotRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(14),
    flexWrap: "wrap",
  },
  checkoutWrap: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    gap: rV(12),
    backgroundColor: "#F5F5F5",
    flex: 1,
  },
  checkoutCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(16),
  },
});
