import { AppColors } from "@/constants/Colors";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SkeletonBlock, SkeletonPulse } from "@/components/loaders/Skeleton";

export function HomeFeedSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.homeContainer}
    >
      <SkeletonPulse>
        <View style={styles.sectionGap}>
          <SkeletonBlock height={rV(56)} radius={24} />
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.rowBetween}>
            <SkeletonBlock width="36%" height={rV(24)} radius={12} />
            <SkeletonBlock width="24%" height={rV(18)} radius={10} />
          </View>
          <View style={styles.rowGap}>
            <SkeletonBlock width={rS(240)} height={rV(168)} radius={26} />
            <SkeletonBlock width={rS(240)} height={rV(168)} radius={26} />
          </View>
        </View>

        <SkeletonBlock height={rV(166)} radius={28} />

        <View style={styles.sectionGap}>
          <View style={styles.rowBetween}>
            <SkeletonBlock width="42%" height={rV(24)} radius={12} />
            <SkeletonBlock width="18%" height={rV(18)} radius={10} />
          </View>
          {[0, 1, 2].map((item) => (
            <RecommendationSkeleton key={`home-rec-${item}`} />
          ))}
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.rowBetween}>
            <SkeletonBlock width="28%" height={rV(24)} radius={12} />
            <SkeletonBlock width="18%" height={rV(18)} radius={10} />
          </View>
          <View style={styles.rowGap}>
            <StoreCardSkeleton compact />
            <StoreCardSkeleton compact />
          </View>
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.rowBetween}>
            <SkeletonBlock width="40%" height={rV(24)} radius={12} />
            <SkeletonBlock width="20%" height={rV(18)} radius={10} />
          </View>
          <View style={styles.rowGap}>
            <SkeletonBlock width={rS(120)} height={rV(132)} radius={22} />
            <SkeletonBlock width={rS(120)} height={rV(132)} radius={22} />
            <SkeletonBlock width={rS(120)} height={rV(132)} radius={22} />
          </View>
        </View>
      </SkeletonPulse>
    </ScrollView>
  );
}

export function CategoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.stackGap}>
      <SkeletonPulse>
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
      </SkeletonPulse>
    </View>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SkeletonPulse>
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
    </SkeletonPulse>
  );
}

export function ProductListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.stackGap}>
      <SkeletonPulse>
        {Array.from({ length: count }).map((_, index) => (
          <RecommendationSkeleton key={`product-list-${index}`} />
        ))}
      </SkeletonPulse>
    </View>
  );
}

export function StoreGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonPulse>
      <View style={styles.gridWrap}>
        {Array.from({ length: count }).map((_, index) => (
          <StoreCardSkeleton key={`store-grid-${index}`} />
        ))}
      </View>
    </SkeletonPulse>
  );
}

export function StoreProfileSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
      <SkeletonPulse>
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
      </SkeletonPulse>
    </ScrollView>
  );
}

export function ProductDetailSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContainer}>
      <SkeletonPulse>
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
      </SkeletonPulse>
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
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(80),
    gap: rV(18),
  },
  detailContainer: {
    paddingBottom: rV(72),
    backgroundColor: "#F5F7FA",
  },
  sectionGap: {
    gap: rV(14),
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
  rowGap: {
    flexDirection: "row",
    gap: rS(12),
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
