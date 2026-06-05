import FlashSalesCard from "@/components/cards/FlashSaleCard";
import MarketCard from "@/components/cards/MarketCard";
import ProductCard from "@/components/cards/ProductCard";
import PromoBanner from "@/components/cards/PromoBanner";
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
import EmptySection from "@/components/empty/EmptySection";
import SearchLauncher from "@/components/search/SearchLauncher";
import StoreCard from "@/components/cards/StoreCard";
import { HomeHeader } from "@/components/HomeHeader";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { useCatalogProducts, useRecommendedProducts } from "@/hooks/useCatalog";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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

  const showHeader = !isEmpty;

  return (
    <>
      {showHeader ? (
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
            className="flex-1 text-xl font-montserrat-extraBold text-gray-800 dark:text-gray-100"
            numberOfLines={1}
          >
            {title}
          </Text>
          {headerRight ??
            (onSeeAll ? (
              <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
                <Text className="text-base font-montserrat-extraBold text-gray-800 dark:text-gray-100">
                  See All
                </Text>
              </TouchableOpacity>
            ) : null)}
        </View>
      ) : null}

      {isLoading && isEmpty ? (
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            marginTop: showHeader ? 0 : sectionSpacing,
          }}
        >
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
  const { horizontalPadding, sectionSpacing } = useResponsive();
  const [timeLeft, setTimeLeft] = useState("06:00:00");
  const [recommendationSeed, setRecommendationSeed] = useState(1);
  const { products: flashSaleProducts, isLoading: isLoadingFlashSales } = useCatalogProducts({
    placement: "flash-sale",
  });
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
    (isLoadingFlashSales ||
      isLoadingRecommendations ||
      isLoadingPopular ||
      isLoadingMarkets ||
      isLoadingStores);

  useEffect(() => {
    const saleEnd = new Date().getTime() + 6 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = saleEnd - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00:00");
      } else {
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
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
          <View style={{ paddingBottom: 80 }}>
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
              headerRight={
                <Text className="font-montserrat-semiBold text-base text-primary tabular-nums">
                  {timeLeft}
                </Text>
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

            {hasCatalogContent ? (
              isLoadingFlashSales && flashSaleProducts.length === 0 ? (
                <PromoBannerSkeleton />
              ) : (
                <PromoBanner />
              )
            ) : null}

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
