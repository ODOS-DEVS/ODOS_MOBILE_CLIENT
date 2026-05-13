import PrimaryButton from "@/components/buttons/PrimaryButton";
import FlashSalesCard from "@/components/cards/FlashSaleCard";
import ProductCard from "@/components/cards/ProductCard";
import StoreOfferCard from "@/components/cards/StoreOfferCard";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { gentsData } from "@/constants/Data";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useStore } from "@/hooks/useCommerce";
import { type StoreVoucherOffer, useVouchers } from "@/hooks/useVouchers";
import { rS, useResponsive } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
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
  const [storeOffers, setStoreOffers] = useState<StoreVoucherOffer[]>([]);
  const [isClaimingOfferId, setIsClaimingOfferId] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setCheckoutVoucherCode } = useProfile();
  const { fetchStoreVouchers, claimVoucher } = useVouchers();
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

  useEffect(() => {
    let isMounted = true;

    if (!storeId) {
      setStoreOffers([]);
      return;
    }

    void fetchStoreVouchers(storeId)
      .then((offers) => {
        if (!isMounted) {
          return;
        }
        setStoreOffers(offers);
      })
      .catch(() => {
        if (isMounted) {
          setStoreOffers([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchStoreVouchers, storeId]);

  const handleClaimOffer = async (offer: StoreVoucherOffer) => {
    if (!user) {
      showToast("Sign in to save this store offer.");
      return;
    }

    setIsClaimingOfferId(offer.id);
    try {
      const claimed = await claimVoucher(offer.id);
      setStoreOffers((current) =>
        current.map((item) =>
          item.id === offer.id ? { ...item, claimed: true } : item,
        ),
      );
      showToast(`${claimed.code} saved to your wallet.`);
    } catch (error) {
      showToast(
        error instanceof Error && error.message
          ? error.message
          : "We couldn't save that offer right now.",
      );
    } finally {
      setIsClaimingOfferId(null);
    }
  };

  const handleUseOffer = (offer: StoreVoucherOffer) => {
    setCheckoutVoucherCode(offer.code);
    showToast(`${offer.code} saved for checkout.`);
  };

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
          onPress={() =>
            goBackOr(router, { fallback: "/(root)/screens/stores/stores" as any })
          }
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

        {storeOffers.length > 0 ? (
          <>
            <View className="mx-6 mt-8">
              <Text className="text-xl font-montserrat-extraBold text-gray-800">
                Store offers
              </Text>
              <Text className="mt-2 text-sm font-montserrat text-gray-500">
                Save a store promotion now and use it when your basket qualifies.
              </Text>
            </View>

            <View>
              <FlatList
                data={storeOffers}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <StoreOfferCard
                    offer={item}
                    isBusy={isClaimingOfferId === item.id}
                    onClaim={handleClaimOffer}
                    onUse={handleUseOffer}
                  />
                )}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            </View>
          </>
        ) : null}

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
