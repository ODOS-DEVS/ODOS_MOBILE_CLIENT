import FlashSalesCard from "@/components/cards/FlashSaleCard";
import MarketCard from "@/components/cards/MarketCard";
import ProductCard from "@/components/cards/ProductCard";
import PromoBanner from "@/components/cards/PromoBanner";
import RecommendationCard from "@/components/cards/RecommendationCard";
import { HomeFeedSkeleton } from "@/components/loaders/CommerceSkeletons";
import SearchLauncher from "@/components/search/SearchLauncher";
import StoreCard from "@/components/cards/StoreCard";
import { HomeHeader } from "@/components/HomeHeader";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { useCatalogProducts, useRecommendedProducts } from "@/hooks/useCatalog";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function buildShuffleScore(id: string, seed: number) {
  return Array.from(`${id}-${seed}`).reduce(
    (score, character) => (score * 31 + character.charCodeAt(0)) % 2147483647,
    7,
  );
}

const HomeScreen = () => {
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
  const isInitialLoading =
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
  // ---------------- TIMER (UNCHANGED) --------------------
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
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }} edges={["top"]}>
      <StatusBar barStyle={"dark-content"} />
      {isInitialLoading ? (
        <HomeFeedSkeleton />
      ) : (
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

            {flashSaleProducts.length > 0 ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: sectionSpacing,
                    paddingHorizontal: horizontalPadding,
                  }}
                >
                  <Text className="text-xl font-montserrat-extraBold text-gray-800">
                    Flash Sales
                  </Text>
                  <Text className="font-montserrat-semiBold text-primary">
                    {timeLeft}
                  </Text>
                </View>

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
              </>
            ) : null}

            <PromoBanner />

            {/* Recommendations */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: horizontalPadding,
                marginTop: sectionSpacing,
                marginBottom: rV(10),
              }}
            >
              <Text className="text-xl font-montserrat-extraBold text-gray-800">
                Recommendation
              </Text>
              <TouchableOpacity
                onPress={() => router.push("../screens/recommendation")}
              >
                <Text className="text-base font-montserrat-extraBold text-gray-800">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Stores */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: horizontalPadding,
                marginTop: sectionSpacing,
                marginBottom: rS(10),
              }}
            >
              <Text className="text-xl font-montserrat-extraBold text-gray-800">
                Stores
              </Text>
              <TouchableOpacity
                onPress={() => router.push("../screens/stores/stores")}
              >
                <Text className="text-base font-montserrat-extraBold text-gray-800">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: horizontalPadding }}>
              <FlatList
                data={storeItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <StoreCard {...item} />}
              />
            </View>

            {/* Popular Products */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: horizontalPadding,
                marginTop: sectionSpacing,
                marginBottom: rS(10),
              }}
            >
              <Text className="text-xl font-montserrat-extraBold text-gray-800">
                Popular products
              </Text>
              <TouchableOpacity
                onPress={() => router.push("../screens/popular")}
              >
                <Text className="text-base font-montserrat-extraBold text-gray-800">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Market */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: horizontalPadding,
                marginTop: sectionSpacing,
                marginBottom: rS(10),
              }}
            >
              <Text className="text-xl font-montserrat-extraBold text-gray-800">
                Market
              </Text>
              <TouchableOpacity onPress={() => router.push("../screens/market")}>
                <Text className="text-base font-montserrat-extraBold text-gray-800">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

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
          </View>
        }
      />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
