import PromoOfferCard from "@/components/cards/PromoOfferCard";
import RecommendationCard from "@/components/cards/RecommendationCard";
import PromoBanner from "@/components/cards/PromoBanner";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import { HomeContentSkeleton } from "@/components/loaders/CommerceSkeletons";
import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useDealsHub } from "@/hooks/useDealsHub";
import { useVouchers } from "@/hooks/useVouchers";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";

export default function DealsScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, error, refresh } = useDealsHub();
  const { claimVoucher, vouchers } = useVouchers();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const dealProducts = data?.dealProducts ?? [];

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

  return (
    <View style={screenStyles.screen}>
      <ProfileHeader title="Deals & Promos" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={AppColors.primary}
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
                color: "#111827",
              }}
            >
              Save more on ODOS
            </Text>
            <Text
              style={{
                fontFamily: Fonts.text,
                fontSize: 14,
                color: "#64748B",
                lineHeight: 20,
              }}
            >
              Promo codes, flash sales, and price drops — curated for shoppers in Ghana.
            </Text>
          </View>

          {isLoading && !data ? (
            <HomeContentSkeleton />
          ) : error ? (
            <CommerceSeeAllEmptyState
              icon="alert-circle-outline"
              title="Couldn't load deals"
              subtitle={error}
            />
          ) : (
            <>
              <PromoBanner
                banners={(data?.banners.length ?? 0) > 0 ? data?.banners : undefined}
                dealCount={dealProducts.length}
                inset={false}
              />

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
                        color: AppColors.primary,
                      }}
                    >
                      View all flash sales →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={{ gap: rV(12) }}>
                <CommerceSeeAllSectionHeader
                  title="Promo codes"
                  subtitle="Save to your wallet, then apply at checkout"
                  count={promotions.length}
                />
                {promotions.length === 0 ? (
                  <CommerceSeeAllEmptyState
                    icon="pricetags-outline"
                    title="No promo codes right now"
                    subtitle="New platform offers appear here when campaigns go live."
                  />
                ) : promotions.length === 1 ? (
                  <PromoOfferCard
                    offer={promotions[0]}
                    fullWidth
                    isBusy={claimingId === promotions[0].id}
                    onClaim={() => void handleClaimPromotion(promotions[0].id)}
                    onUse={handleUsePromotion}
                  />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: rS(12), paddingVertical: rV(2) }}
                  >
                    {promotions.map((item) => (
                      <PromoOfferCard
                        key={item.id}
                        offer={item}
                        compact
                        isBusy={claimingId === item.id}
                        onClaim={() => void handleClaimPromotion(item.id)}
                        onUse={handleUsePromotion}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>

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
                  <CommerceSeeAllSectionHeader
                    title="Seasonal campaigns"
                    subtitle="Ghana shopping moments on ODOS"
                  />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {data?.campaignTags.map((campaign) => (
                      <View
                        key={campaign.tag}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: "#FFF7ED",
                          borderWidth: 1,
                          borderColor: "#FED7AA",
                        }}
                      >
                        <Text
                          style={{ fontFamily: Fonts.textBold, fontSize: 12, color: "#9A3412" }}
                        >
                          {campaign.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
