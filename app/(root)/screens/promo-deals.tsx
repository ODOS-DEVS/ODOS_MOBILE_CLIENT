import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import RecommendationCard from "@/components/cards/RecommendationCard";
import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import { useDealProducts } from "@/hooks/useDealProducts";
import { rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

export default function PromoDealsScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const params = useLocalSearchParams<{
    title?: string;
    subtitle?: string;
    minDiscount?: string;
    campaign?: string;
  }>();

  const title = parseParam(params.title) || "Deals for you";
  const subtitleParam = parseParam(params.subtitle);
  const minDiscount = Number.parseInt(parseParam(params.minDiscount), 10);
  const campaignTag = parseParam(params.campaign);

  const minDiscountPercent =
    Number.isFinite(minDiscount) && minDiscount > 0 && minDiscount <= 90
      ? minDiscount
      : undefined;

  const {
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useDealProducts({
    minDiscountPercent,
    campaignTag: campaignTag || undefined,
  });

  const heroSubtitle = useMemo(() => {
    if (subtitleParam) {
      return subtitleParam;
    }
    if (minDiscountPercent && campaignTag) {
      return `Shops opted into this campaign with ${minDiscountPercent}%+ off — prices set by each vendor.`;
    }
    if (minDiscountPercent) {
      return `Products where vendors set sale pricing at ${minDiscountPercent}% off or more. ODOS never changes shop prices.`;
    }
    if (campaignTag) {
      return "Vendor-priced offers that opted into this ODOS campaign.";
    }
    return "Every discount here comes from a shop's own sale price or an approved flash event.";
  }, [campaignTag, minDiscountPercent, subtitleParam]);

  const badgeLabel = minDiscountPercent
    ? `${minDiscountPercent}%+ off`
    : campaignTag
      ? "Campaign picks"
      : "Vendor deals";

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      <CommerceSeeAllHero
        badgeIcon="pricetag-outline"
        badgeLabel={badgeLabel}
        title={title}
        subtitle={heroSubtitle}
        accent="gold"
        stats={[
          { value: products.length, label: "products" },
          {
            value: products.filter((item) => Boolean(item.discount?.trim()))
              .length,
            label: "marked down",
          },
        ]}
      />

      <CommerceSeeAllSectionHeader
        title="Eligible products"
        subtitle="Only items with active vendor sale pricing or approved flash pricing appear here."
        count={products.length}
      />
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title={title} />

      {isLoading && products.length === 0 ? (
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: rV(8),
            paddingBottom: sectionSpacing,
          }}
        >
          <ProductListSkeleton count={6} />
        </View>
      ) : error && products.length === 0 ? (
        <View
          style={{ paddingHorizontal: horizontalPadding, paddingTop: rV(12) }}
        >
          <CommerceSeeAllEmptyState
            icon="alert-circle-outline"
            title="Couldn't load deals"
            subtitle={error}
          />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecommendationCard {...item} />}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <CommerceSeeAllEmptyState
              icon="pricetags-outline"
              title="No matching deals yet"
              subtitle={
                minDiscountPercent
                  ? `No vendors have published ${minDiscountPercent}%+ off pricing yet. Check back soon or browse all deals.`
                  : "Vendors add sale pricing on their listings — new deals appear as shops publish them."
              }
            />
          }
          ListFooterComponent={
            <CatalogScrollFooter isLoadingMore={isLoadingMore} />
          }
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: sectionSpacing,
            gap: rV(12),
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && products.length > 0}
              onRefresh={() => void refresh()}
              tintColor={AppColors.primary}
            />
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
        />
      )}
    </View>
  );
}
