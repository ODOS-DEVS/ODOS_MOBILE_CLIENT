import PromoOfferCard from "@/components/cards/PromoOfferCard";
import FlashSalesCard from "@/components/cards/FlashSaleCard";
import RecommendationCard from "@/components/cards/RecommendationCard";
import {
  HorizontalProductRowSkeleton,
  ProductListSkeleton,
} from "@/components/loaders/CommerceSkeletons";
import {
  CommerceSeeAllEmptyState,
  CommerceSeeAllHero,
  CommerceSeeAllSectionHeader,
  useCommerceSeeAllScreenStyles,
} from "@/components/browse/CommerceSeeAllUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogProducts, useRecommendedProducts } from "@/hooks/useCatalog";
import { usePromotions } from "@/hooks/usePromotions";
import { useVouchers } from "@/hooks/useVouchers";
import {
  dedupeProductsById,
  isDealProduct,
  sortDealsBySavings,
} from "@/utils/deals";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";

export default function DealsScreen() {
  const screenStyles = useCommerceSeeAllScreenStyles();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { promotions, isLoading: isLoadingPromotions } = usePromotions();
  const { claimVoucher, vouchers } = useVouchers();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { products: flashSaleProducts, isLoading: isLoadingFlashSales } = useCatalogProducts({
    placement: "flash-sale",
  });
  const { products: recommendedProducts, isLoading: isLoadingRecommendations } =
    useRecommendedProducts({ limit: 24 });

  const dealProducts = useMemo(
    () =>
      sortDealsBySavings(
        dedupeProductsById([
          ...flashSaleProducts.filter(isDealProduct),
          ...recommendedProducts.filter(isDealProduct),
        ]),
      ),
    [flashSaleProducts, recommendedProducts],
  );

  const savedPromotionIds = useMemo(
    () => new Set(vouchers.map((item) => item.id)),
    [vouchers],
  );

  const promotionsWithSavedState = useMemo(
    () =>
      promotions.map((promotion) => ({
        ...promotion,
        claimed: promotion.claimed || savedPromotionIds.has(promotion.id),
      })),
    [promotions, savedPromotionIds],
  );

  const featuredPromotion = promotionsWithSavedState[0] ?? null;
  const previewFlashSales = flashSaleProducts.slice(0, 8);
  const hasAnyDealsContent =
    promotionsWithSavedState.length > 0 ||
    flashSaleProducts.length > 0 ||
    dealProducts.length > 0;

  const handleClaimPromotion = async (promotionId: string) => {
    if (!user) {
      showToast("Sign in to save promotions to your wallet.", "info");
      router.push("/(root)/(auth)/signin");
      return;
    }

    setClaimingId(promotionId);
    try {
      await claimVoucher(promotionId);
      showToast("Promotion saved to your wallet.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to save this promotion.",
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
        contentContainerStyle={[
          screenStyles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: sectionSpacing,
          },
        ]}
      >
        <CommerceSeeAllHero
          badgeIcon="pricetags-outline"
          badgeLabel="Save more"
          title="Real savings across ODOS"
          subtitle="Browse live promo codes, flash sale products, and curated price drops in one place."
          accent="gold"
          stats={[
            { value: promotionsWithSavedState.length, label: "promo codes" },
            { value: flashSaleProducts.length, label: "flash items" },
            { value: dealProducts.length, label: "product deals" },
          ]}
        />

        {!hasAnyDealsContent &&
        !isLoadingPromotions &&
        !isLoadingFlashSales &&
        !isLoadingRecommendations ? (
          <CommerceSeeAllEmptyState
            icon="pricetags-outline"
            title="No deals live right now"
            subtitle="Promotions and flash sales will appear here as soon as vendors and ODOS publish them."
          />
        ) : null}

        {isLoadingPromotions && promotionsWithSavedState.length === 0 ? (
          <HorizontalProductRowSkeleton />
        ) : promotionsWithSavedState.length > 0 ? (
          <View style={screenStyles.contentBlock}>
            <CommerceSeeAllSectionHeader
              title="Promo codes"
              subtitle={
                featuredPromotion
                  ? `Featured: ${featuredPromotion.rewardText}`
                  : "Save these codes and apply them at checkout"
              }
              count={promotionsWithSavedState.length}
            />
            <FlatList
              data={promotionsWithSavedState}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PromoOfferCard
                  offer={item}
                  compact
                  isBusy={claimingId === item.id}
                  onClaim={() => handleClaimPromotion(item.id)}
                  onUse={handleUsePromotion}
                />
              )}
              contentContainerStyle={{ paddingTop: rV(4), paddingBottom: rV(8) }}
            />
          </View>
        ) : null}

        {isLoadingFlashSales && flashSaleProducts.length === 0 ? (
          <HorizontalProductRowSkeleton />
        ) : flashSaleProducts.length > 0 ? (
          <View style={screenStyles.contentBlock}>
            <CommerceSeeAllSectionHeader
              title="Flash sales"
              subtitle="Limited-time products with standout pricing"
              count={flashSaleProducts.length}
            />
            <FlatList
              data={previewFlashSales}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FlashSalesCard {...item} />}
              contentContainerStyle={{ paddingTop: rV(4), paddingBottom: rV(8) }}
            />
          </View>
        ) : null}

        <View style={screenStyles.contentBlock}>
          <CommerceSeeAllSectionHeader
            title="Product deals"
            subtitle="Price drops and savings across the marketplace"
            count={dealProducts.length}
          />

          {isLoadingRecommendations && dealProducts.length === 0 ? (
            <ProductListSkeleton count={4} />
          ) : dealProducts.length === 0 ? (
            <CommerceSeeAllEmptyState
              icon="sparkles-outline"
              title="No product deals yet"
              subtitle="When vendors mark down products, they will show up here automatically."
            />
          ) : (
            <FlatList
              data={dealProducts}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
              renderItem={({ item }) => (
                <RecommendationCard
                  {...item}
                  reviews={
                    item.reviews !== undefined ? Number(item.reviews) : undefined
                  }
                />
              )}
              contentContainerStyle={{ paddingTop: rV(4), paddingBottom: rV(8) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
