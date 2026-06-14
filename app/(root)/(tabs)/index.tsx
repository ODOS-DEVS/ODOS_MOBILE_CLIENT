import FlashSalesCard from "@/components/cards/FlashSaleCard";
import MarketCard from "@/components/cards/MarketCard";
import ProductCard from "@/components/cards/ProductCard";
import PromoBanner from "@/components/cards/PromoBanner";
import PromoOfferCard from "@/components/cards/PromoOfferCard";
import RecommendationCard from "@/components/cards/RecommendationCard";
import {
  FlashSalesRowSkeleton,
  HorizontalProductRowSkeleton,
  HorizontalStoreRowSkeleton,
  HomeFeedSkeleton,
  MarketsRowSkeleton,
  ProductListSkeleton,
  PromoBannerSkeleton,
} from "@/components/loaders/CommerceSkeletons";
import { ViewAllButton } from "@/components/browse/ViewAllButton";
import { OffersCountBadge } from "@/components/deals/OffersCountBadge";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import EmptySection from "@/components/empty/EmptySection";
import SearchLauncher from "@/components/search/SearchLauncher";
import StoreCard from "@/components/cards/StoreCard";
import { HomeHeader } from "@/components/HomeHeader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { useCatalogProducts, useRecommendedProducts } from "@/hooks/useCatalog";
import { usePromotions } from "@/hooks/usePromotions";
import { usePromoBanners } from "@/hooks/usePromoBanners";
import { useFlashSaleEvents } from "@/hooks/useFlashSaleEvents";
import { useVouchers } from "@/hooks/useVouchers";
import { dedupeProductsById, isDealProduct } from "@/utils/deals";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

function buildShuffleScore(id: string, seed: number) {
  return Array.from(`${id}-${seed}`).reduce(
    (score, character) => (score * 31 + character.charCodeAt(0)) % 2147483647,
    7,
  );
}

type HomeSectionProps = {
  title: string;
  onSeeAll?: () => void;
  headerRight?: React.ReactNode;
  isLoading: boolean;
  isEmpty: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  sectionSpacing: number;
  horizontalPadding: number;
};

function HomeSection({
  title,
  onSeeAll,
  headerRight,
  isLoading,
  isEmpty,
  skeleton,
  children,
  sectionSpacing,
  horizontalPadding,
}: HomeSectionProps) {
  if (!isLoading && isEmpty) {
    return null;
  }

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(12),
          paddingHorizontal: horizontalPadding,
          marginTop: sectionSpacing,
          marginBottom: rS(10),
        }}
      >
        <Text
          className="flex-1 shrink text-xl font-montserrat-extraBold text-gray-800 dark:text-gray-100"
          numberOfLines={1}
        >
          {title}
        </Text>
        {headerRight || onSeeAll ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: rS(8),
              flexShrink: 0,
            }}
          >
            {headerRight}
            {onSeeAll ? <ViewAllButton onPress={onSeeAll} /> : null}
          </View>
        ) : null}
      </View>

      {isLoading && isEmpty ? (
        <View style={{ paddingHorizontal: horizontalPadding }}>
          {skeleton}
        </View>
      ) : (
        children
      )}
    </>
  );
}

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [recommendationSeed, setRecommendationSeed] = useState(1);
  const [claimingPromotionId, setClaimingPromotionId] = useState<string | null>(null);
  const { products: flashSaleProducts, isLoading: isLoadingFlashSales } = useCatalogProducts({
    placement: "flash-sale",
  });
  const { primaryEvent: primaryFlashSaleEvent } = useFlashSaleEvents();
  const { promotions, isLoading: isLoadingPromotions } = usePromotions();
  const { banners: promoBanners, isLoading: isLoadingPromoBanners } = usePromoBanners();
  const { claimVoucher, vouchers } = useVouchers();
  const { products: recommendationProducts, isLoading: isLoadingRecommendations } =
    useRecommendedProducts({
      limit: 12,
    });
  const { products: popularProducts, isLoading: isLoadingPopular } = useCatalogProducts({
    section: "popular",
  });
  const { markets: marketItems, isLoading: isLoadingMarkets } = useMarkets();
  const { stores: storeItems, isLoading: isLoadingStores } = useStores({});

  const isBootstrapping =
    flashSaleProducts.length === 0 &&
    recommendationProducts.length === 0 &&
    popularProducts.length === 0 &&
    marketItems.length === 0 &&
    storeItems.length === 0 &&
    promotions.length === 0 &&
    promoBanners.length === 0 &&
    (isLoadingFlashSales ||
      isLoadingRecommendations ||
      isLoadingPopular ||
      isLoadingMarkets ||
      isLoadingStores ||
      isLoadingPromotions ||
      isLoadingPromoBanners);

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

  const dealProducts = useMemo(
    () =>
      dedupeProductsById([
        ...flashSaleProducts.filter(isDealProduct),
        ...popularProducts.filter(isDealProduct),
        ...recommendationProducts.filter(isDealProduct),
      ]),
    [flashSaleProducts, popularProducts, recommendationProducts],
  );

  const featuredPromotion = promotionsWithSavedState[0] ?? null;
  const totalLiveOffers = dealProducts.length + promotionsWithSavedState.length;

  const handleClaimPromotion = useCallback(
    async (promotionId: string) => {
      if (!user) {
        showToast("Sign in to save promotions to your wallet.", "info");
        router.push("/(root)/(auth)/signin");
        return;
      }

      setClaimingPromotionId(promotionId);
      try {
        await claimVoucher(promotionId);
        showToast("Promotion saved to your wallet.", "success");
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Unable to save this promotion.",
          "error",
        );
      } finally {
        setClaimingPromotionId(null);
      }
    },
    [claimVoucher, showToast, user],
  );

  const handleOpenDeals = useCallback(() => {
    router.push("../screens/deals");
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (recommendationProducts.length > 4) {
        setRecommendationSeed((current) => current + 1);
      }
    }, [recommendationProducts.length]),
  );

  const homeRecommendationProducts = useMemo(() => {
    if (recommendationProducts.length <= 4) {
      return recommendationProducts;
    }

    return [...recommendationProducts]
      .sort((left, right) => {
        const leftScore = buildShuffleScore(left.id, recommendationSeed);
        const rightScore = buildShuffleScore(right.id, recommendationSeed);
        return leftScore - rightScore;
      })
      .slice(0, 4);
  }, [recommendationProducts, recommendationSeed]);

  const hasCatalogContent =
    flashSaleProducts.length > 0 ||
    homeRecommendationProducts.length > 0 ||
    popularProducts.length > 0 ||
    storeItems.length > 0 ||
    marketItems.length > 0;

  const isCatalogEmpty =
    !isBootstrapping &&
    !hasCatalogContent &&
    !isLoadingFlashSales &&
    !isLoadingRecommendations &&
    !isLoadingPopular &&
    !isLoadingStores &&
    !isLoadingMarkets;

  if (isBootstrapping) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={["top"]}>
        <HomeFeedSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={["top"]}>
      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={() => null}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View style={{ paddingBottom: tabBarInset }}>
            <HomeHeader />
            <SearchLauncher />

            {isCatalogEmpty ? (
              <View style={{ paddingHorizontal: horizontalPadding, marginTop: sectionSpacing }}>
                <EmptySection
                  icon="sparkles-outline"
                  title="Nothing to browse yet"
                  message="New products, stores, and markets will appear here once they are published on ODOS."
                />
              </View>
            ) : null}

            <HomeSection
              title="Flash Sales"
              onSeeAll={() => router.push("../screens/flash-sales")}
              headerRight={
                primaryFlashSaleEvent ? (
                  <FlashSaleCountdown
                    endsAt={primaryFlashSaleEvent.endsAt}
                    serverSecondsRemaining={primaryFlashSaleEvent.secondsRemaining}
                  />
                ) : flashSaleProducts.length > 0 ? (
                  <OffersCountBadge count={flashSaleProducts.length} label="live" />
                ) : undefined
              }
              isLoading={isLoadingFlashSales}
              isEmpty={flashSaleProducts.length === 0}
              skeleton={<FlashSalesRowSkeleton />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ marginLeft: -horizontalPadding }}>
                <FlatList
                  data={flashSaleProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FlashSalesCard {...item} />}
                  contentContainerStyle={{
                    paddingHorizontal: horizontalPadding,
                  }}
                />
              </View>
            </HomeSection>

            {hasCatalogContent ||
            promotionsWithSavedState.length > 0 ||
            promoBanners.length > 0 ? (
              isLoadingPromotions &&
              promotionsWithSavedState.length === 0 &&
              isLoadingPromoBanners &&
              promoBanners.length === 0 &&
              isLoadingFlashSales &&
              flashSaleProducts.length === 0 ? (
                <PromoBannerSkeleton />
              ) : (
                <PromoBanner
                  banners={promoBanners}
                  featuredPromotion={featuredPromotion}
                  dealCount={totalLiveOffers}
                  onPress={handleOpenDeals}
                />
              )
            ) : null}

            <HomeSection
              title="Promo codes"
              onSeeAll={handleOpenDeals}
              isLoading={isLoadingPromotions}
              isEmpty={promotionsWithSavedState.length === 0}
              skeleton={<HorizontalProductRowSkeleton />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ marginLeft: -horizontalPadding }}>
                <FlatList
                  data={promotionsWithSavedState}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <PromoOfferCard
                      offer={item}
                      compact
                      isBusy={claimingPromotionId === item.id}
                      onClaim={() => handleClaimPromotion(item.id)}
                      onUse={() =>
                        router.push("/(root)/screens/profileScreens/Account/Vouchers")
                      }
                    />
                  )}
                  contentContainerStyle={{
                    paddingHorizontal: horizontalPadding,
                  }}
                />
              </View>
            </HomeSection>

            <HomeSection
              title="Top deals"
              onSeeAll={() =>
                router.push({
                  pathname: "../screens/recommendation",
                  params: { filter: "deals" },
                })
              }
              isLoading={isLoadingRecommendations || isLoadingPopular}
              isEmpty={dealProducts.length === 0}
              skeleton={<ProductListSkeleton count={2} />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ paddingHorizontal: horizontalPadding }}>
                <FlatList
                  data={dealProducts.slice(0, 4)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <RecommendationCard
                      {...item}
                      reviews={
                        item.reviews !== undefined
                          ? Number(item.reviews)
                          : undefined
                      }
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
                  scrollEnabled={false}
                />
              </View>
            </HomeSection>

            <HomeSection
              title="Recommendation"
              onSeeAll={() => router.push("../screens/recommendation")}
              isLoading={isLoadingRecommendations}
              isEmpty={homeRecommendationProducts.length === 0}
              skeleton={<ProductListSkeleton count={2} />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ paddingHorizontal: horizontalPadding }}>
                <FlatList
                  data={homeRecommendationProducts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <RecommendationCard
                      {...item}
                      reviews={
                        item.reviews !== undefined
                          ? Number(item.reviews)
                          : undefined
                      }
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: rV(12) }} />}
                  scrollEnabled={false}
                  contentContainerStyle={{
                    paddingHorizontal: horizontalPadding * 0.5,
                  }}
                />
              </View>
            </HomeSection>

            <HomeSection
              title="Stores"
              onSeeAll={() => router.push("../screens/stores/stores")}
              isLoading={isLoadingStores}
              isEmpty={storeItems.length === 0}
              skeleton={<HorizontalStoreRowSkeleton />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ paddingHorizontal: horizontalPadding }}>
                <FlatList
                  data={storeItems}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <StoreCard {...item} />}
                />
              </View>
            </HomeSection>

            <HomeSection
              title="Popular products"
              onSeeAll={() => router.push("../screens/popular")}
              isLoading={isLoadingPopular}
              isEmpty={popularProducts.length === 0}
              skeleton={<HorizontalProductRowSkeleton />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ paddingHorizontal: horizontalPadding }}>
                <FlatList
                  data={popularProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <ProductCard {...item} />}
                  contentContainerStyle={{
                    paddingRight: horizontalPadding,
                  }}
                />
              </View>
            </HomeSection>

            <HomeSection
              title="Market"
              onSeeAll={() => router.push("../screens/market")}
              isLoading={isLoadingMarkets}
              isEmpty={marketItems.length === 0}
              skeleton={<MarketsRowSkeleton />}
              sectionSpacing={sectionSpacing}
              horizontalPadding={horizontalPadding}
            >
              <View style={{ paddingHorizontal: horizontalPadding }}>
                <FlatList
                  data={marketItems}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <MarketCard {...item} />}
                  contentContainerStyle={{
                    paddingRight: horizontalPadding,
                  }}
                />
              </View>
            </HomeSection>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
