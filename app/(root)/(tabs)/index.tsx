import FlashSalesCard from "@/components/cards/FlashSaleCard";
import MarketCard from "@/components/cards/MarketCard";
import ProductCard from "@/components/cards/ProductCard";
import PromoBanner from "@/components/cards/PromoBanner";
import RecommendationCard from "@/components/cards/RecommendationCard";
import StoreCard from "@/components/cards/StoreCard";
import { HomeHeader } from "@/components/HomeHeader";
import { SearchBar } from "@/components/SearchBar";
import {
  flashSales,
  markets,
  PopularProducts,
  recommendations,
  Stores,
} from "@/constants/Data";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SearchItem = {
  id: string;
  title: string;
  image: any;
  [key: string]: any;
};

const HomeScreen = () => {
  const [timeLeft, setTimeLeft] = useState("06:00:00");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // ---------------- TIMER --------------------
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

  // ---------------- SEARCH LOGIC --------------------
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const allProducts: SearchItem[] = [
      ...flashSales,
      ...recommendations,
      ...PopularProducts,
      ...Stores,
      ...markets,
    ];

    const results = allProducts.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  };

  // 🔥 SEARCH DEBOUNCE — automatically search 5 sec after user stops typing
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      handleSearch();
    }, 1000); // 1 seconds debounce

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <View className="flex-1">
      <StatusBar barStyle={"dark-content"} />

      {/* ---------------- SEARCH RESULTS MODE ---------------- */}
      {searchQuery.length > 0 && searchResults.length > 0 ? (
        <View className="mt-6 px-4">
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text === "") setSearchResults([]);
            }}
          />

          <Text className="text-lg font-montserrat-bold mt-6 mb-4">
            Search Results
          </Text>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-4">
                <ProductCard {...item} />
              </View>
            )}
            numColumns={2}
          />
        </View>
      ) : (
        // ---------------- HOMEPAGE MODE ----------------
        <FlatList
          data={[]}
          keyExtractor={() => "dummy"}
          renderItem={() => null}
          ListHeaderComponent={
            <View className="pb-20">
              {/* Header */}
              <HomeHeader />

              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text === "") setSearchResults([]);
                }}
              />

              {/* Flash Sales Section */}
              <View className="flex-row justify-between mt-8 mx-8">
                <Text className="text-base font-montserrat-extraBold text-gray-800">
                  Flash Sales
                </Text>
                <Text className="font-montserrat-semiBold text-primary">
                  {timeLeft}
                </Text>
              </View>

              <View className="ml-[-20]">
                <FlatList
                  data={flashSales}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FlashSalesCard {...item} />}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              </View>

              <PromoBanner />

              {/* Recommendations */}
              <View className="flex-row justify-between mx-6 mt-8 ">
                <Text className="text-lg font-montserrat-semiBold ">
                  Recommendation
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("../screens/recommendation")}
                >
                  <Text className="text-lg font-montserrat-semiBold">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mx-4">
                <FlatList
                  data={recommendations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <RecommendationCard {...item} />}
                  contentContainerStyle={{ paddingHorizontal: 25 }}
                />
              </View>

              {/* Stores */}
              <View className="flex-row justify-between mx-6 mt-8 ">
                <Text className="text-lg font-montserrat-semiBold ">
                  Stores
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("../screens/stores/stores")}
                >
                  <Text className="text-lg font-montserrat-semiBold">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="px-6">
                <FlatList
                  data={Stores}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <StoreCard {...item} />}
                />
              </View>

              {/* Popular Products */}
              <View className="flex-row justify-between mx-6 mt-8 ">
                <Text className="text-lg font-montserrat-semiBold ">
                  Popular products
                </Text>
                <TouchableOpacity>
                  <Text className="text-lg font-montserrat-semiBold">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={PopularProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProductCard {...item} />}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />

              {/* Market */}
              <View className="flex-row justify-between mx-6 mt-8 ">
                <Text className="text-lg font-montserrat-semiBold ">
                  Market
                </Text>
                <TouchableOpacity>
                  <Text className="text-lg font-montserrat-semiBold">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={markets}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MarketCard {...item} />}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeScreen;
