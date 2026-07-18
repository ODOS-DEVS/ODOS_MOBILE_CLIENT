import FlashSalesCard from "@/components/cards/FlashSaleCard";
import MarketCard from "@/components/cards/MarketCard";
import ProductCard from "@/components/cards/ProductCard";
import PromoBanner from "@/components/cards/PromoBanner";
import RecommendationCard from "@/components/cards/RecommendationCard";
import {
  HomeContentSkeleton,
  PromoBannerSkeleton,
  SectionSkeleton,
} from "@/components/loaders/CommerceSkeletons";
import ImageReadyScreenGate from "@/components/media/ImageReadyScreenGate";
import { ViewAllButton } from "@/components/browse/ViewAllButton";
import { OffersCountBadge } from "@/components/deals/OffersCountBadge";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import EmptySection from "@/components/empty/EmptySection";
import SearchLauncher from "@/components/search/SearchLauncher";
import StoreCard from "@/components/cards/StoreCard";
import { HomeHeader } from "@/components/HomeHeader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useForYouRecommendations } from "@/hooks/useRecommendations";
import { useFlashSaleEvents } from "@/hooks/useFlashSaleEvents";
import { usePromoBanners } from "@/hooks/usePromoBanners";
import { useMerchandisingCampaigns } from "@/hooks/useMerchandisingCampaigns";
import { dedupeProductsById, isDealProduct } from "@/utils/deals";
import { buildImageReadyResetKey, prefetchCommerceImages } from "@/utils/imageReady";
import { navigateToMerchandisingCampaign } from "@/utils/promoNavigation";
import { productCardGapY, rS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const tabBarInset = useTabBarContentInsetFromContext();
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const { products: flashSaleProducts, isLoading: isLoadingFlashSales } = useCatalogProducts({
    placement: "flash-sale",
  });
  const { primaryEvent: primaryFlashSaleEvent } = useFlashSaleEvents();
  const { banners: promoBanners, isLoading: isLoadingPromoBanners, refresh: refreshPromoBanners } =
    usePromoBanners();
  const {
    campaigns: featuredCampaigns,
    isLoading: isLoadingCampaigns,
    refresh: refreshCampaigns,
  } = useMerchandisingCampaigns({ featuredOnly: true });
  const {
    feed: recommendationFeed,
    products: recommendationProducts,
    isLoading: isLoadingRecommendations,
    refresh: refreshRecommendations,
  } = useForYouRecommendations({
    limit: 12,
  });
  const [isRefreshingHome, setIsRefreshingHome] = useState(false);
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
    promoBanners.length === 0 &&
    (isLoadingFlashSales ||
      isLoadingRecommendations ||
      isLoadingPopular ||
      isLoadingMarkets ||
      isLoadingStores ||
      isLoadingPromoBanners);

  const dealProducts = useMemo(
    () =>
      dedupeProductsById([
        ...flashSaleProducts.filter(isDealProduct),
        ...popularProducts.filter(isDealProduct),
        ...recommendationProducts.filter(isDealProduct),
      ]),
    [flashSaleProducts, popularProducts, recommendationProducts],
  );

  const totalLiveOffers = dealProducts.length;

  const handleRefreshHome = useCallback(async () => {
    setIsRefreshingHome(true);
    try {
      await Promise.all([
        refreshRecommendations(),
        refreshPromoBanners(),
        refreshCampaigns(),
      ]);
    } finally {
      setIsRefreshingHome(false);
    }
  }, [refreshCampaigns, refreshPromoBanners, refreshRecommendations]);

  useFocusEffect(
    useCallback(() => {
      void refreshPromoBanners();
    }, [refreshPromoBanners]),
  );

  const handleOpenDeals = useCallback(() => {
    router.push("../screens/deals");
  }, []);

  const homeRecommendationProducts = useMemo(
    () => recommendationProducts.slice(0, 4),
    [recommendationProducts],
  );

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

  const imageReadyItems = useMemo(
    () => [
      ...flashSaleProducts.slice(0, 4),
      ...dealProducts.slice(0, 3),
      ...homeRecommendationProducts,
      ...popularProducts.slice(0, 4),
    ],
    [dealProducts, flashSaleProducts, homeRecommendationProducts, popularProducts],
  );
  const imageReadyResetKey = useMemo(
    () => buildImageReadyResetKey(imageReadyItems),
    [imageReadyItems],
  );

  useEffect(() => {
    if (!isBootstrapping && hasCatalogContent) {
      prefetchCommerceImages(imageReadyItems);
    }
  }, [hasCatalogContent, imageReadyItems, isBootstrapping]);

  if (isBootstrapping) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={["top"]}>
        <View style={{ paddingBottom: tabBarInset }}>
          <HomeHeader />
          <SearchLauncher />
          <View style={{ paddingHorizontal: horizontalPadding, marginTop: sectionSpacing }}>
            <HomeContentSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={["top"]}>
      <ImageReadyScreenGate
        resetKey={imageReadyResetKey}
        enabled={hasCatalogContent && !isCatalogEmpty}
        skeleton={
          <View style={{ paddingBottom: tabBarInset }}>
            <HomeHeader />
            <SearchLauncher />
            <View style={{ paddingHorizontal: horizontalPadding, marginTop: sectionSpacing }}>
              <HomeContentSkeleton />
            </View>
          </View>
        }
      >
        <FlatList
          data={[]}
          keyExtractor={() => "dummy"}
          renderItem={() => null}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingHome}
              onRefresh={() => void handleRefreshHome()}
            />
          }
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
                skeleton={<SectionSkeleton variant="strip" />}
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

              {hasCatalogContent || promoBanners.length > 0 ? (
                isLoadingPromoBanners &&
                promoBanners.length === 0 &&
                isLoadingFlashSales &&
                flashSaleProducts.length === 0 ? (
                  <PromoBannerSkeleton />
                ) : (
                  <PromoBanner
                    banners={promoBanners}
                    dealCount={totalLiveOffers}
                    onPress={handleOpenDeals}
                  />
                )
              ) : null}

              <HomeSection
                title="Campaigns"
                onSeeAll={() => router.push("../screens/deals")}
                isLoading={isLoadingCampaigns}
                isEmpty={featuredCampaigns.length === 0}
                skeleton={<SectionSkeleton variant="strip" />}
                sectionSpacing={sectionSpacing}
                horizontalPadding={horizontalPadding}
              >
                <View style={{ marginLeft: -horizontalPadding }}>
                  <FlatList
                    data={featuredCampaigns}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigateToMerchandisingCampaign(item.slug, item.title)}
                        style={{
                          width: rS(220),
                          marginRight: rS(10),
                          borderRadius: rS(16),
                          overflow: "hidden",
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.cardBorder,
                        }}
                      >
                        {item.thumbnailImageUrl || item.bannerImageUrl ? (
                          <Image
                            source={{
                              uri: item.thumbnailImageUrl || item.bannerImageUrl,
                            }}
                            style={{ width: "100%", height: rV(110) }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              height: rV(110),
                              backgroundColor: colors.imagePlaceholder,
                            }}
                          />
                        )}
                        <View style={{ padding: rS(12), gap: rV(4) }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: "Montserrat-ExtraBold",
                              fontSize: rS(13),
                              color: colors.text,
                            }}
                          >
                            {item.title}
                          </Text>
                          {item.subtitle ? (
                            <Text
                              numberOfLines={2}
                              style={{
                                fontSize: rS(11),
                                color: colors.textMuted,
                              }}
                            >
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    )}
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
                skeleton={<SectionSkeleton variant="row" />}
                sectionSpacing={sectionSpacing}
                horizontalPadding={horizontalPadding}
              >
                <View style={{ paddingHorizontal: horizontalPadding }}>
                  <FlatList
                    data={dealProducts.slice(0, 3)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <RecommendationCard
                        {...item}
                        badgeLabel="Deal"
                        sourceScreen="home_top_deals"
                        storeId={item.storeId}
                        reviews={
                          item.reviews !== undefined
                            ? Number(item.reviews)
                            : undefined
                        }
                      />
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={{ height: productCardGapY() }} />
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </HomeSection>

              <HomeSection
                title={recommendationFeed.title}
                onSeeAll={() => router.push("../screens/recommendation")}
                isLoading={isLoadingRecommendations}
                isEmpty={homeRecommendationProducts.length === 0}
                skeleton={<SectionSkeleton variant="row" />}
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
                        badgeLabel={recommendationFeed.personalized ? "For you" : "ODOS Pick"}
                        sourceScreen="home_for_you"
                        storeId={item.storeId}
                        reviews={
                          item.reviews !== undefined
                            ? Number(item.reviews)
                            : undefined
                        }
                      />
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={{ height: productCardGapY() }} />
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </HomeSection>

              <HomeSection
                title="Stores"
                onSeeAll={() => router.push("../screens/stores/stores")}
                isLoading={isLoadingStores}
                isEmpty={storeItems.length === 0}
                skeleton={<SectionSkeleton variant="strip" />}
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
                skeleton={<SectionSkeleton variant="strip" />}
                sectionSpacing={sectionSpacing}
                horizontalPadding={horizontalPadding}
              >
                <View style={{ paddingHorizontal: horizontalPadding }}>
                  <FlatList
                    data={popularProducts}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ProductCard {...item} sourceScreen="home_popular" />}
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
                skeleton={<SectionSkeleton variant="strip" />}
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
      </ImageReadyScreenGate>
    </SafeAreaView>
  );
};

export default HomeScreen;
