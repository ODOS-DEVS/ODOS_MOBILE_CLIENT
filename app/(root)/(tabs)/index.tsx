import { View, StatusBar, Text, FlatList, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { HomeHeader } from "@/components/HomeHeader";
import { SearchBar } from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { flashSales, markets, PopularProducts, recommendations, Stores } from "@/constants/Data";
import PromoBanner from "@/components/PromoBanner";
import RecommendationCard from "@/components/RecommendationCard";

const HomeScreen = () => {
  const [timeLeft, setTimeLeft] = useState("06:00:00");

  useEffect(() => {
    const saleEnd = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 hours from now

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
    <ScrollView>
      <View>
        <StatusBar barStyle={"dark-content"} />
        <HomeHeader />
        <SearchBar />

        <View className="flex-row justify-between mt-8 mx-8">
          <Text className="text-base font-montserrat-extraBold text-gray-800">
            Flash Sales
          </Text>
          <Text className="font-montserrat-semiBold text-primary">
            {timeLeft}
          </Text>
        </View>

        <FlatList
          data={flashSales}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
        <PromoBanner />
        <View className="flex-row justify-between mx-6 mt-8 ">
          <Text className="text-lg font-montserrat-semiBold ">
            Recommendation
          </Text>
          <TouchableOpacity>
            <Text className="text-lg font-montserrat-semiBold">See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecommendationCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 25 }}
        />
        <View className="flex-row justify-between mx-6 mt-8 ">
          <Text className="text-lg font-montserrat-semiBold ">Stores</Text>
          <TouchableOpacity>
            <Text className="text-lg font-montserrat-semiBold">See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={Stores}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
        <View className="flex-row justify-between mx-6 mt-8 ">
          <Text className="text-lg font-montserrat-semiBold ">
            Popular products
          </Text>
          <TouchableOpacity>
            <Text className="text-lg font-montserrat-semiBold">See All</Text>
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
        <View className="flex-row justify-between mx-6 mt-8 ">
          <Text className="text-lg font-montserrat-semiBold ">
            Market
          </Text>
          <TouchableOpacity>
            <Text className="text-lg font-montserrat-semiBold">See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={markets}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
