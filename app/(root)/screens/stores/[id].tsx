import PrimaryButton from "@/components/buttons/PrimaryButton";
import FlashSalesCard from "@/components/cards/FlashSaleCard";
import ProductCard from "@/components/cards/ProductCard";
import VoucherCard from "@/components/cards/VoucherCard";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { gentsData, vouchers } from "@/constants/Data";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useStore } from "@/hooks/useCommerce";
import { rS, useResponsive } from "@/styles/responsive";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
  const params = useLocalSearchParams();
  const storeId =
    typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const paramTitle =
    typeof params.title === "string"
      ? params.title
      : Array.isArray(params.title)
        ? params.title[0]
        : "Store";
  const fallbackStore = useMemo(
    () => ({
      id: storeId,
      slug: paramTitle.toLowerCase().replace(/\s+/g, "-"),
      title: paramTitle,
      image: resolveImageSource(
        typeof params.image === "string" ? params.image : undefined,
        typeof params.imageKey === "string" ? params.imageKey : undefined,
      ),
      imageBanner: resolveImageSource(
        typeof params.imageBanner === "string"
          ? params.imageBanner
          : typeof params.image === "string"
            ? params.image
            : undefined,
        typeof params.imageBannerKey === "string"
          ? params.imageBannerKey
          : typeof params.imageKey === "string"
            ? params.imageKey
            : undefined,
      ),
    }),
    [paramTitle, params.image, params.imageBanner, params.imageBannerKey, params.imageKey, storeId],
  );
  const { store, isLoading } = useStore({
    storeId,
    fallback: fallbackStore,
  });
  const { products: storeProducts } = useCatalogProducts({
    storeId,
    fallback: gentsData,
  });
  const { products: flashSaleProducts } = useCatalogProducts({
    storeId,
    placement: "flash-sale",
    fallback: [],
  });
  const insets = useSafeAreaInsets();
  const { gridCardWidth } = useResponsive();
  const gridGap = rS(6);
  const gridPadding = rS(17);

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

  if (isLoading) {
    return <ScreenLoader label="Loading store..." />;
  }

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
          {store.title}
        </Text>
      </View>

      {/* FULL IMAGE SECTION */}
      <View className="px-4">
        <View className="w-full h-[200px] relative rounded-3xl overflow-hidden">
          <Image
            source={store.imageBanner ?? store.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* REST OF CONTENT */}
      <View>
        {flashSaleProducts.length > 0 ? (
          <>
            <View className="flex-row justify-between mt-8 mx-8">
              <Text className="text-xl font-montserrat-extraBold text-gray-800 mt-8">
                Flash Sales
              </Text>
              <Text className="font-montserrat-semiBold text-primary mt-8">
                {timeLeft}
              </Text>
            </View>

            <View className="ml-[-20]">
              <FlatList
                data={flashSaleProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FlashSalesCard {...item} />}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            </View>
          </>
        ) : null}

        <View className="mx-6 mt-8">
          <Text className="text-xl font-montserrat-extraBold text-gray-800">
            Product line
          </Text>
        </View>

        <View>
          <FlatList
            data={storeProducts}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ columnGap: gridGap }}
            renderItem={({ item }) => (
              <ProductCard
                {...item}
                cardWidth={gridCardWidth(2, gridGap)}
                horizontalSpacing={7}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: gridPadding,
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
                params: {
                  title: String(store.title ?? "Store"),
                  address: store.address,
                  phone: store.phone,
                  email: store.email,
                  city: store.city,
                  distanceKm: store.distanceKm,
                  travelMinutes: store.travelMinutes,
                },
              })
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default StoreDetailScreen;
