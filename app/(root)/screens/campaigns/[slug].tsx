import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import RecommendationCard from "@/components/cards/RecommendationCard";
import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import { ProductListSkeleton } from "@/components/loaders/CommerceSkeletons";
import ImageReadyScreenGate from "@/components/media/ImageReadyScreenGate";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useMerchandisingCampaignDetail } from "@/hooks/useMerchandisingCampaigns";
import { productCardGapY, rV, useResponsive } from "@/styles/responsive";
import { buildImageReadyResetKey, prefetchCommerceImages } from "@/utils/imageReady";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { FlatList, Image, RefreshControl, View } from "react-native";

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

export default function MerchandisingCampaignScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = parseParam(params.slug);

  const {
    campaign,
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useMerchandisingCampaignDetail(slug);

  const imageReadyResetKey = useMemo(
    () => buildImageReadyResetKey(products, 6),
    [products],
  );

  useEffect(() => {
    if (products.length > 0) {
      prefetchCommerceImages(products, 6);
    }
  }, [products]);

  const listHeader = (
    <View style={{ gap: rV(14) }}>
      {campaign?.bannerImageUrl ? (
        <Image
          source={{ uri: campaign.bannerImageUrl }}
          style={{
            width: "100%",
            height: rV(160),
            borderRadius: 18,
            backgroundColor: "#E5E7EB",
          }}
          resizeMode="cover"
        />
      ) : null}

      <CommerceSeeAllHero
        badgeIcon="megaphone-outline"
        badgeLabel={campaign?.isFeatured ? "Featured campaign" : "Campaign"}
        title={campaign?.title || "Campaign"}
        subtitle={
          campaign?.description ||
          campaign?.subtitle ||
          "Curated marketplace picks for this campaign."
        }
        accent="gold"
        stats={[
          { value: campaign?.productCount ?? products.length, label: "products" },
          {
            value: campaign?.secondsRemaining
              ? Math.max(1, Math.ceil(campaign.secondsRemaining / 3600))
              : 0,
            label: "hours left",
          },
        ]}
      />

      {campaign?.endsAt ? (
        <FlashSaleCountdown
          endsAt={campaign.endsAt}
          serverSecondsRemaining={campaign.secondsRemaining}
        />
      ) : null}

      <CommerceSeeAllSectionHeader
        title="Campaign products"
        subtitle="Live catalog items assigned to this campaign — stock and price update automatically."
        count={products.length}
      />
    </View>
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title={campaign?.title || "Campaign"} />

      {isLoading && products.length === 0 ? (
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: rV(8),
            paddingBottom: sectionSpacing,
          }}
        >
          {listHeader}
          <ProductListSkeleton count={2} />
        </View>
      ) : (
        <ImageReadyScreenGate
          resetKey={imageReadyResetKey}
          enabled={products.length > 0}
          skeleton={
            <View
              style={{
                paddingHorizontal: horizontalPadding,
                paddingTop: rV(8),
                paddingBottom: sectionSpacing,
              }}
            >
              {listHeader}
              <ProductListSkeleton count={2} />
            </View>
          }
        >
          <FlatList
            style={{ flex: 1 }}
            data={products}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />
            }
            onEndReached={() => {
              if (hasMore) {
                void loadMore();
              }
            }}
            onEndReachedThreshold={0.45}
            ListFooterComponent={
              <CatalogScrollFooter isLoadingMore={isLoadingMore} />
            }
            ItemSeparatorComponent={() => <View style={{ height: productCardGapY() }} />}
            renderItem={({ item }) => (
              <RecommendationCard
                {...item}
                sourceScreen="merchandising_campaign"
                storeId={item.storeId}
                reviews={
                  item.reviews !== undefined ? Number(item.reviews) : undefined
                }
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingTop: rV(8),
              paddingBottom: sectionSpacing,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <CommerceSeeAllEmptyState
                icon="megaphone-outline"
                title={error ? "We couldn't load this campaign" : "Nothing in this campaign yet"}
                subtitle={
                  error
                    ? "Pull to refresh, or browse deals while we reconnect."
                    : "Check back soon — products appear as soon as they're assigned."
                }
              />
            }
          />
        </ImageReadyScreenGate>
      )}
    </View>
  );
}
