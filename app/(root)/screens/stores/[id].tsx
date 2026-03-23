import PrimaryButton from "@/components/buttons/PrimaryButton";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StoreDetailScreen = () => {
  const [timeLeft, setTimeLeft] = useState("06:00:00");
  const { title, image } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

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
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER TITLE & BACK */}
      <View className="px-4 mb-3 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-black/20 rounded-full justify-center items-center"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text
          className="flex-1 text-2xl font-montserrat-extraBold text-gray-900"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* FULL IMAGE SECTION */}
      <View className="px-4">
        <View className="w-full h-[200px] relative rounded-3xl overflow-hidden">
          <Image
            source={image as any}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
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
          <Text className="text-base font-montserrat-extraBold text-gray-800">
            Product line
          </Text>
        </View>

        <View>
          <FlatList
            data={gentsData}
            numColumns={2}
            scrollEnabled={false} // IMPORTANT
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard {...item} />}
            contentContainerStyle={{
              paddingHorizontal: 10,
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

        {/* Visit Store CTA */}
        <View className="px-12">
          <PrimaryButton
            title="Visit Store"
            roundedFull
            onPress={() =>
              router.push({
                pathname: "/screens/stores/map",
                params: { title: String(title ?? "Store") },
              })
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default StoreDetailScreen;
