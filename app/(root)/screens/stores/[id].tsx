import FlashSalesCard from "@/components/cards/FlashSaleCard";
import ProductCard from "@/components/cards/ProductCard";
import VoucherCard from "@/components/cards/VoucherCard";
import { flashSales, gentsData, vouchers } from "@/constants/Data";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StoreDetailScreen = () => {
  const [timeLeft, setTimeLeft] = useState("06:00:00");
  const { title, image } = useLocalSearchParams();

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
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      {/* FULL IMAGE SECTION */}
      <View className="w-full h-[180px] relative">
        {/* Image fills the entire area */}
        <Image
          source={image as any}
          className="w-full h-full rounded-xl"
          resizeMode="cover"
        />

        {/* OVERLAY HEADER */}
        <SafeAreaView className="absolute top-0 left-0 w-full px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-black/40 rounded-full justify-center items-center"
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text className="w-30 h-12 p-2 bg-black/40 rounded-lg text-center text-white text-2xl font-montserrat-extraBold">
            {title}
          </Text>

          {/* For spacing on right */}
          <View className="w-10" />
        </SafeAreaView>
      </View>

      {/* REST OF CONTENT */}
      <View>
        {/* Flash Sales */}
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

        <View className="mx-6 mt-8">
          <Text className="text-xl font-montserrat-extraBold ">
            Product line
          </Text>
        </View>

        <View>
          <FlatList
            data={gentsData}
            numColumns={3}
            scrollEnabled={false} // IMPORTANT
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
            }}
          />
        </View>

        <View className="mx-6 mt-8">
          <Text className="text-xl font-montserrat-extraBold ">Vouchers</Text>
        </View>

        <View>
          <FlatList
            data={vouchers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <VoucherCard {...item} />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default StoreDetailScreen;
