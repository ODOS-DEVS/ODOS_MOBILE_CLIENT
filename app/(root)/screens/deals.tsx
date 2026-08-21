import PromoOfferCard from "@/components/cards/PromoOfferCard";
import RecommendationCard from "@/components/cards/RecommendationCard";
import PromoBanner from "@/components/cards/PromoBanner";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import TopDealSpotlight from "@/components/deals/TopDealSpotlight";
import { CarouselDots } from "@/components/ui/CarouselDots";
import { HomeContentSkeleton } from "@/components/loaders/CommerceSkeletons";
import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import { NetworkErrorState } from "@/components/empty/NetworkErrorState";
import ProfileHeader from "@/components/profile/ProfileHeader";
import CommerceImage from "@/components/media/CommerceImage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useDealsHub } from "@/hooks/useDealsHub";
import { useVouchers } from "@/hooks/useVouchers";
import { rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { computeSavingsPercent } from "@/utils/deals";
import { navigateToCampaignDeals, navigateToMerchandisingCampaign } from "@/utils/promoNavigation";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Fonts from "@/constants/Fonts";

const CAMPAIGN_TAGS_PREVIEW_COUNT = 6;

export default function DealsScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { width: screenWidth } = useWindowDimensions();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { data, isLoading, error, errorKind, refresh } = useDealsHub();
  const { claimVoucher, vouchers } = useVouchers();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [promoCarouselIndex, setPromoCarouselIndex] = useState(0);
  const [showAllCampaignTags, setShowAllCampaignTags] = useState(false);

  const promoSlideWidth = screenWidth - horizontalPadding * 2;

  const savedPromotionIds = useMemo(
    () => new Set(vouchers.map((item) => item.id)),
    [vouchers],
  );

  const promotions = useMemo(
    () =>
      (data?.promotions ?? []).map((promotion) => ({
        ...promotion,
        claimed: promotion.claimed || savedPromotionIds.has(promotion.id),
      })),
    [data?.promotions, savedPromotionIds],
  );

  const primaryFlashEvent = data?.flashEvents[0] ?? null;
  const dealProducts = useMemo(() => data?.dealProducts ?? [], [data?.dealProducts]);
  const campaigns = data?.campaigns ?? [];
  const hasCustomBanners = (data?.banners.length ?? 0) > 0;
  const bestDeal = useMemo(() => {
    if (hasCustomBanners || dealProducts.length === 0) {
      return null;
    }
    let best: { product: (typeof dealProducts)[number]; savingsPercent: number } | null = null;
    for (const product of dealProducts) {
      const savingsPercent = computeSavingsPercent(product.price, product.oldPrice);
      if (savingsPercent != null && (!best || savingsPercent > best.savingsPercent)) {
        best = { product, savingsPercent };
      }
    }
    return best;
  }, [dealProducts, hasCustomBanners]);
  const activeVoucherCount = useMemo(
    () => vouchers.filter((item) => item.status === "active").length,
    [vouchers],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClaimPromotion = async (promotionId: string) => {
    if (!user) {
      showToast("Sign in to save promos to your wallet.", "info");
      router.push("/(root)/(auth)/signin");
      return;
    }

    setClaimingId(promotionId);
    try {
      await claimVoucher(promotionId);
      showToast("Promo saved to your wallet.", "success");
    } catch (claimError) {
      showToast(
        claimError instanceof Error ? claimError.message : "Unable to save this promo.",
        "error",
      );
    } finally {
      setClaimingId(null);
    }
  };

  const handleUsePromotion = () => {
    router.push("/(root)/screens/profileScreens/Account/Vouchers");
  };

  const handlePromoCarouselScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / promoSlideWidth);
      setPromoCarouselIndex(Math.max(0, Math.min(nextIndex, promotions.length - 1)));
    },
    [promoSlideWidth, promotions.length],
  );

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader
        title="Deals & Promos"
        rightNode={
          <TouchableOpacity
            onPress={() => router.push("/(root)/screens/profileScreens/Account/Vouchers")}
            activeOpacity={0.82}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="My vouchers"
            style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="pricetags-outline" size={22} color={colors.text} />
            {activeVoucherCount > 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors.dangerText,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 3,
                  borderWidth: 2,
                  borderColor: colors.screen,
                }}
              >
                <Text style={{ color: colors.onPrimary, fontSize: 9, fontFamily: Fonts.titleBold }}>
                  {activeVoucherCount > 9 ? "9+" : activeVoucherCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          screenStyles.scrollContent,
          {
            paddingBottom: sectionSpacing,
          },
        ]}
      >
        <View style={{ paddingHorizontal: horizontalPadding, gap: rV(20) }}>
          <View style={{ gap: rV(6), paddingTop: rV(4) }}>
            <Text
              style={{
                fontFamily: Fonts.titleBold,
                fontSize: 24,
                color: colors.text,
              }}
            >
              Save more on ODOS
            </Text>
            <Text
              style={{
                fontFamily: Fonts.text,
                fontSize: 14,
                color: colors.textMuted,
                lineHeight: 20,
              }}
            >
              Promo codes, flash sales, and price drops — curated for shoppers in Ghana.
            </Text>
          </View>

          {isLoading && !data ? (
            <HomeContentSkeleton />
          ) : error ? (
            <NetworkErrorState kind={errorKind} title="Couldn't load deals" onRetry={() => void refresh()} />
          ) : (
            <>
              {hasCustomBanners ? (
                <PromoBanner banners={data?.banners} dealCount={dealProducts.length} inset={false} />
              ) : bestDeal ? (
                <TopDealSpotlight product={bestDeal.product} savingsPercent={bestDeal.savingsPercent} />
              ) : null}

              {campaigns.length > 0 ? (
                <View style={{ gap: rV(12) }}>
                  <CommerceSeeAllSectionHeader
                    title="Campaigns"
                    subtitle="Seasonal and featured marketplace campaigns"
                    count={campaigns.length}
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {campaigns.map((campaign) => (
                      <TouchableOpacity
                        key={campaign.id}
                        activeOpacity={0.9}
                        onPress={() =>
                          navigateToMerchandisingCampaign(campaign.slug, campaign.title)
                        }
                        style={{
                          width: 200,
                          marginRight: 10,
                          borderRadius: 16,
                          overflow: "hidden",
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        {campaign.thumbnailImageUrl || campaign.bannerImageUrl ? (
                          <CommerceImage
                            source={{
                              uri: campaign.thumbnailImageUrl || campaign.bannerImageUrl,
                            }}
                            style={{ width: "100%", height: 96 }}
                            contentFit="cover"
                            trackingId={`deals-campaign-${campaign.id}`}
                            recyclingKey={
                              campaign.thumbnailImageUrl || campaign.bannerImageUrl || campaign.id
                            }
                            placeholderColor={colors.imagePlaceholder}
                          />
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              height: 96,
                              backgroundColor: colors.imagePlaceholder,
                            }}
                          />
                        )}
                        <View style={{ padding: 12, gap: 4 }}>
                          <Text
                            numberOfLines={1}
                            style={{ fontFamily: Fonts.titleBold, fontSize: 13, color: colors.text }}
                          >
                            {campaign.title}
                          </Text>
                          {campaign.subtitle ? (
                            <Text
                              numberOfLines={2}
                              style={{ fontFamily: Fonts.text, fontSize: 11, color: colors.textMuted }}
                            >
                              {campaign.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {primaryFlashEvent ? (
                <View style={{ gap: rV(10) }}>
                  <CommerceSeeAllSectionHeader
                    title={primaryFlashEvent.title}
                    subtitle={primaryFlashEvent.subtitle ?? "Limited-time event"}
                    count={primaryFlashEvent.productCount}
                  />
                  <FlashSaleCountdown
                    endsAt={primaryFlashEvent.endsAt}
                    serverSecondsRemaining={primaryFlashEvent.secondsRemaining}
                  />
                  <TouchableOpacity onPress={() => router.push("/(root)/screens/flash-sales")}>
                    <Text
                      style={{
                        fontFamily: Fonts.titleBold,
                        fontSize: 13,
                        color: colors.primary,
                      }}
                    >
                      View all flash sales →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {promotions.length > 0 ? (
              <View style={{ gap: rV(12) }}>
                <CommerceSeeAllSectionHeader
                  title="Promo codes"
                  subtitle="Save to your wallet, then apply at checkout"
                  count={promotions.length}
                />
                {promotions.length === 1 ? (
                  <PromoOfferCard
                    offer={promotions[0]}
                    fullWidth
                    isBusy={claimingId === promotions[0].id}
                    onClaim={() => void handleClaimPromotion(promotions[0].id)}
                    onUse={handleUsePromotion}
                  />
                ) : (
                  <View>
                    <FlatList
                      data={promotions}
                      horizontal
                      pagingEnabled
                      nestedScrollEnabled
                      showsHorizontalScrollIndicator={false}
                      decelerationRate="fast"
                      snapToInterval={promoSlideWidth}
                      snapToAlignment="start"
                      disableIntervalMomentum
                      keyExtractor={(item) => item.id}
                      onMomentumScrollEnd={handlePromoCarouselScrollEnd}
                      getItemLayout={(_, index) => ({
                        length: promoSlideWidth,
                        offset: promoSlideWidth * index,
                        index,
                      })}
                      renderItem={({ item }) => (
                        <View style={{ width: promoSlideWidth }}>
                          <PromoOfferCard
                            offer={item}
                            fullWidth
                            isBusy={claimingId === item.id}
                            onClaim={() => void handleClaimPromotion(item.id)}
                            onUse={handleUsePromotion}
                          />
                        </View>
                      )}
                    />
                    <CarouselDots count={promotions.length} activeIndex={promoCarouselIndex} />
                  </View>
                )}
              </View>
              ) : null}

              <View style={{ gap: rV(12) }}>
                <CommerceSeeAllSectionHeader
                  title="Today's deals"
                  subtitle="Products already on sale — no code needed"
                  count={dealProducts.length}
                />
                {dealProducts.length === 0 ? (
                  <CommerceSeeAllEmptyState
                    icon="flame-outline"
                    title="No product deals yet"
                    subtitle="Check back as vendors publish sale pricing."
                  />
                ) : (
                  <View style={{ gap: rV(12) }}>
                    {dealProducts.slice(0, 8).map((item) => (
                      <RecommendationCard key={item.id} {...item} />
                    ))}
                  </View>
                )}
              </View>

              {(data?.campaignTags.length ?? 0) > 0 ? (
                <View style={{ gap: rV(10) }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowAllCampaignTags((current) => !current)}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <CommerceSeeAllSectionHeader
                      title="Seasonal campaigns"
                      subtitle="Ghana shopping moments on ODOS"
                    />
                    <Ionicons
                      name={showAllCampaignTags ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {(showAllCampaignTags
                      ? data?.campaignTags
                      : data?.campaignTags.slice(0, CAMPAIGN_TAGS_PREVIEW_COUNT)
                    )?.map((campaign) => (
                      <TouchableOpacity
                        key={campaign.tag}
                        activeOpacity={0.85}
                        onPress={() => navigateToCampaignDeals(campaign.tag, campaign.label)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: colors.warningSoft,
                          borderWidth: 1,
                          borderColor: colors.warningBorder,
                        }}
                      >
                        <Text
                          style={{ fontFamily: Fonts.textBold, fontSize: 12, color: colors.warningText }}
                        >
                          {campaign.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {(data?.campaignTags.length ?? 0) > CAMPAIGN_TAGS_PREVIEW_COUNT ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowAllCampaignTags((current) => !current)}
                    >
                      <Text style={{ fontFamily: Fonts.titleBold, fontSize: 12.5, color: colors.primary }}>
                        {showAllCampaignTags
                          ? "Show less"
                          : `Show all ${data?.campaignTags.length} moments`}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
