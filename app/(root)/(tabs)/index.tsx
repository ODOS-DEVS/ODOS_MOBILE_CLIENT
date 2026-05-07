import FlashSalesCard from "@/components/cards/FlashSaleCard";
import MarketCard from "@/components/cards/MarketCard";
import ProductCard from "@/components/cards/ProductCard";
import PromoBanner from "@/components/cards/PromoBanner";
import RecommendationCard from "@/components/cards/RecommendationCard";
import StoreCard from "@/components/cards/StoreCard";
import { HomeHeader } from "@/components/HomeHeader";
import { SearchBar } from "@/components/SearchBar";
import {
  markets,
  PopularProducts,
  recommendations,
  Stores,
} from "@/constants/Data";
import { useMarkets, useStores } from "@/hooks/useCommerce";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HomeScreen = () => {
  const { horizontalPadding, sectionSpacing, gridCardWidth } = useResponsive();
  const [timeLeft, setTimeLeft] = useState("06:00:00");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fallbackMarkets = useMemo(
    () =>
      markets.map((item) => ({
        id: item.id,
        slug: item.title.toLowerCase(),
        title: item.title,
        image: item.image,
      })),
    [],
  );
  const fallbackStores = useMemo(
    () =>
      Stores.map((item) => ({
        id: item.id,
        slug: item.title.toLowerCase().replace(/\s+/g, "-"),
        title: item.title,
        category: item.category,
        image: item.image,
        rating: item.rating,
        marketSlug: item.market?.toLowerCase(),
      })),
    [],
  );
  const { products: flashSaleProducts, isLoading: isLoadingFlashSales } =
    useCatalogProducts({
      placement: "flash-sale",
      fallback: [],
  });
  const {
    products: recommendationProducts,
    isLoading: isLoadingRecommendations,
  } = useCatalogProducts({
    section: "recommendations",
    fallback: recommendations,
  });
  const { products: popularProducts, isLoading: isLoadingPopular } =
    useCatalogProducts({
      section: "popular",
      fallback: PopularProducts,
    });
  const { markets: marketItems } = useMarkets(fallbackMarkets);
  const { stores: storeItems } = useStores({
    fallback: fallbackStores,
  });

  // Combine all searchable items
  const allProducts = useMemo(
    () => [...flashSaleProducts, ...recommendationProducts, ...popularProducts],
    [flashSaleProducts, popularProducts, recommendationProducts],
  );
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

  return (
    <View className="flex-1">
      <StatusBar barStyle={"dark-content"} />

      {/* ---------------- SEARCH RESULTS MODE ---------------- */}
      {isSearching ? (
        <ScrollView>
          <View style={{ marginTop: 48, paddingHorizontal: horizontalPadding }}>
            <View className="flex-row items-center mt-6 mb-4">
              <TouchableOpacity
                onPress={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                }}
                className="mr-2 p-2"
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>

              <Text className="text-xl font-montserrat-extraBold text-gray-800">
                Search Results
              </Text>
            </View>
            <View className="relative bottom-8">
              <SearchBar
                data={allProducts}
                onStartSearch={() => setIsSearching(true)}
                onResults={setSearchResults}
              />
            </View>

            {searchResults.length === 0 ? (
              <Text className="text-xl text-center font-montserrat-semiBold mt-12 text-primary">
                No results found
              </Text>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      width: gridCardWidth(2, 8),
                      paddingHorizontal: 4,
                    }}
                  >
                    <ProductCard {...item} cardWidth={gridCardWidth(2, 8)} />
                  </View>
                )}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ gap: 8, marginBottom: 12 }}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        // ---------------- HOMEPAGE MODE ----------------
        <FlatList
          data={[]}
          keyExtractor={() => "dummy"}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={{ paddingBottom: 80 }}>
              <HomeHeader />

              {/* Search Bar */}
              <>
                <SearchBar
                  data={allProducts}
                  onResults={setSearchResults}
                  onStartSearch={() => setIsSearching(true)}
                />

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
                      data={recommendationProducts}
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
              </>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeScreen;
