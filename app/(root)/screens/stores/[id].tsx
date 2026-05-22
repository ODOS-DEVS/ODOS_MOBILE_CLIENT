import PrimaryButton from "@/components/buttons/PrimaryButton";
import FlashSalesCard from "@/components/cards/FlashSaleCard";
import ProductCard from "@/components/cards/ProductCard";
import StoreOfferCard from "@/components/cards/StoreOfferCard";
import { ProductGridSkeleton, StoreProfileSkeleton } from "@/components/loaders/CommerceSkeletons";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useStore } from "@/hooks/useCommerce";
import { type StoreVoucherOffer, useVouchers } from "@/hooks/useVouchers";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { resolveApiMediaUrl } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRODUCT_PREVIEW_LIMIT = 6;

const StoreDetailScreen = () => {
  const [timeLeft, setTimeLeft] = useState("06:00:00");
  const [storeOffers, setStoreOffers] = useState<StoreVoucherOffer[]>([]);
  const [isClaimingOfferId, setIsClaimingOfferId] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
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
      status: "active",
      image: resolveApiMediaUrl(typeof params.image === "string" ? params.image : undefined)
        ? { uri: resolveApiMediaUrl(typeof params.image === "string" ? params.image : undefined)! }
        : null,
      imageBanner: resolveApiMediaUrl(
        typeof params.imageBanner === "string"
          ? params.imageBanner
          : typeof params.image === "string"
            ? params.image
            : undefined,
      )
        ? {
            uri: resolveApiMediaUrl(
              typeof params.imageBanner === "string"
                ? params.imageBanner
                : typeof params.image === "string"
                  ? params.image
                  : undefined,
            )!,
          }
        : null,
    }),
    [paramTitle, params.image, params.imageBanner, storeId],
  );
  const { store, isLoading, error: storeError } = useStore({
    storeId,
    fallback: fallbackStore,
  });
  const { products: storeProducts, isLoading: isLoadingStoreProducts } = useCatalogProducts({
    storeId,
  });
  const { products: flashSaleProducts } = useCatalogProducts({
    storeId,
    placement: "flash-sale",
  });
  const insets = useSafeAreaInsets();
  const { gridCardWidth, horizontalPadding, width } = useResponsive();
  const gridGap = rS(6);
  const gridPadding = horizontalPadding;
  const shellWidth = width;
  const canExpandProductLine = storeProducts.length > PRODUCT_PREVIEW_LIMIT;
  const visibleStoreProducts = showAllProducts
    ? storeProducts
    : storeProducts.slice(0, PRODUCT_PREVIEW_LIMIT);
  const singleFlashSaleCardWidth = Math.max(shellWidth - horizontalPadding * 2, rS(200));

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

  useEffect(() => {
    setShowAllProducts(false);
  }, [storeId]);

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

  if (isLoading && !store) {
    return <StoreProfileSkeleton />;
  }

  if (!store) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>
            {storeError ?? "We couldn't load this store"}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            Reopen the store from the live catalog and try again.
          </Text>
        </View>
      </View>
    );
  }

  const storeLocation = [store.address, store.city].filter(Boolean).join(", ");
  const audienceLabel =
    store.audienceSlugs && store.audienceSlugs.length > 0
      ? store.audienceSlugs.join(", ")
      : "All shoppers";
  const isVerified = store.status === "active";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { width: shellWidth, alignSelf: "center" }]}>
        <View style={styles.coverWrap}>
          <TouchableOpacity
            onPress={() =>
              goBackOr(router, { fallback: "/(root)/screens/stores/stores" as any })
            }
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(root)/(tabs)" as any)}
            style={[styles.backButton, styles.homeButton]}
          >
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {store.imageBanner ?? store.image ? (
            <Image
              source={(store.imageBanner ?? store.image) as any}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image-outline" size={rS(26)} color="#CBD5E1" />
              <Text style={styles.coverPlaceholderText}>Store cover pending</Text>
            </View>
          )}
          <View style={styles.coverOverlay} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.logoShell}>
            {store.image ? (
              <Image source={store.image} style={styles.logoImage} resizeMode="cover" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="storefront-outline" size={rS(22)} color="#94A3B8" />
              </View>
            )}
          </View>

          <View style={styles.profileHeaderRow}>
            <View style={styles.profileTextWrap}>
              <View style={styles.nameRow}>
                <Text style={styles.storeName} numberOfLines={2}>
                  {store.title}
                </Text>
                {isVerified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={rS(18)}
                    color="#16A34A"
                    style={styles.verifiedIcon}
                  />
                ) : null}
              </View>

              <Text style={styles.storeMeta} numberOfLines={2}>
                {[store.category, store.city].filter(Boolean).join(" · ")}
              </Text>

              {storeLocation ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={rS(14)} color="#6B7280" />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {storeLocation}
                  </Text>
                </View>
              ) : null}

              {store.description ? (
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {store.description}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.tagRow}>
            {store.city ? (
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{store.city}</Text>
              </View>
            ) : null}
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{audienceLabel}</Text>
            </View>
            {isVerified ? (
              <View style={[styles.tagPill, styles.tagPillVerified]}>
                <Text style={[styles.tagText, styles.tagTextVerified]}>Verified store</Text>
              </View>
            ) : null}
          </View>
        </View>
        </View>

        <View style={[styles.contentSection, { width: shellWidth, alignSelf: "center" }]}>
        {flashSaleProducts.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Flash Sales
              </Text>
              <Text style={styles.sectionAccent}>
                {timeLeft}
              </Text>
            </View>

            {flashSaleProducts.length === 1 ? (
              <View style={styles.singleFlashSaleWrap}>
                <FlashSalesCard
                  {...flashSaleProducts[0]}
                  cardWidth={singleFlashSaleCardWidth}
                  cardSpacing={0}
                  imageHeight={rV(190)}
                />
              </View>
            ) : (
              <View style={styles.horizontalListWrap}>
                <FlatList
                  data={flashSaleProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FlashSalesCard {...item} />}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                />
              </View>
            )}
          </>
        ) : null}

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={styles.sectionTitle}>
              Product line
            </Text>
            {canExpandProductLine ? (
              <Text style={styles.sectionSubtextCompact}>
                {showAllProducts
                  ? `${storeProducts.length} products in this store`
                  : `Showing ${PRODUCT_PREVIEW_LIMIT} of ${storeProducts.length} products`}
              </Text>
            ) : null}
          </View>
          {canExpandProductLine ? (
            <TouchableOpacity
              onPress={() => setShowAllProducts((current) => !current)}
              style={styles.inlineActionPill}
            >
              <Text style={styles.inlineActionText}>
                {showAllProducts ? "Show less" : `See all (${storeProducts.length})`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View>
          {isLoadingStoreProducts && visibleStoreProducts.length === 0 ? (
            <View style={{ paddingHorizontal: gridPadding, paddingTop: 16 }}>
              <ProductGridSkeleton count={4} />
            </View>
          ) : (
            <FlatList
              data={visibleStoreProducts}
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
          )}
        </View>

        {storeOffers.length > 0 ? (
          <>
            <View style={styles.sectionHeaderBlock}>
              <Text style={styles.sectionTitle}>
                Store offers
              </Text>
              <Text style={styles.sectionSubtext}>
                Save a store promotion now and use it when your basket qualifies.
              </Text>
            </View>

            <View style={styles.horizontalListWrap}>
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
                contentContainerStyle={{ paddingHorizontal: 4 }}
              />
            </View>
          </>
        ) : null}

        <View style={styles.ctaWrap}>
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
    </View>
  );
};

export default StoreDetailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: rS(24),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    color: "#1F2937",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rS(18),
    textAlign: "center",
  },
  emptyStateSubtitle: {
    marginTop: rS(8),
    color: "#6B7280",
    fontFamily: "Montserrat-Regular",
    fontSize: rS(12.5),
    lineHeight: rS(19),
    textAlign: "center",
  },
  heroSection: {
    paddingHorizontal: 0,
  },
  coverWrap: {
    height: rS(232),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: rS(30),
    borderBottomRightRadius: rS(30),
    overflow: "hidden",
    backgroundColor: "#D9E1EA",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: rV(6),
    backgroundColor: "#CBD5E1",
  },
  coverPlaceholderText: {
    fontSize: rS(11),
    color: "#FFFFFF",
    fontFamily: "Montserrat-SemiBold",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.12)",
  },
  backButton: {
    position: "absolute",
    top: rS(16),
    left: rS(16),
    zIndex: 3,
    width: rS(40),
    height: rS(40),
    borderRadius: rS(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.34)",
  },
  homeButton: {
    left: undefined,
    right: rS(16),
  },
  profileCard: {
    marginTop: -rS(52),
    marginHorizontal: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: rS(30),
    paddingHorizontal: rS(20),
    paddingTop: rS(20),
    paddingBottom: rS(18),
    borderWidth: 1,
    borderColor: "#E8EDF3",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  logoShell: {
    width: rS(92),
    height: rS(92),
    borderRadius: rS(28),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginTop: -rS(66),
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  profileHeaderRow: {
    marginTop: rS(12),
  },
  profileTextWrap: {
    gap: rS(6),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingRight: rS(10),
  },
  storeName: {
    flexShrink: 1,
    color: "#111827",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rS(22),
    lineHeight: rS(28),
  },
  verifiedIcon: {
    marginTop: rS(1),
  },
  storeMeta: {
    color: "#4B5563",
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(12.5),
    lineHeight: rS(18),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  locationText: {
    flex: 1,
    color: "#6B7280",
    fontFamily: "Montserrat-Regular",
    fontSize: rS(11.5),
    lineHeight: rS(17),
  },
  descriptionText: {
    color: "#667085",
    fontFamily: "Montserrat-Regular",
    fontSize: rS(11.5),
    lineHeight: rS(18),
    marginTop: rS(2),
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rS(12),
  },
  tagPill: {
    borderRadius: rS(999),
    backgroundColor: "#F3F4F6",
    paddingHorizontal: rS(12),
    paddingVertical: rS(7),
  },
  tagPillVerified: {
    backgroundColor: "#E8F8EE",
  },
  tagText: {
    color: "#4B5563",
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(10.75),
  },
  tagTextVerified: {
    color: "#15803D",
  },
  contentSection: {
    marginTop: rS(10),
  },
  sectionHeaderRow: {
    marginTop: rS(18),
    marginBottom: rS(12),
    paddingHorizontal: rS(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(10),
  },
  sectionHeaderBlock: {
    marginTop: rS(18),
    marginBottom: rS(12),
    paddingHorizontal: rS(6),
  },
  sectionTitle: {
    color: "#1F2937",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rS(20),
  },
  sectionAccent: {
    color: "#667085",
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(12.5),
  },
  sectionSubtext: {
    marginTop: rS(5),
    color: "#6B7280",
    fontFamily: "Montserrat-Regular",
    fontSize: rS(12),
    lineHeight: rS(18),
  },
  sectionHeaderCopy: {
    flex: 1,
  },
  sectionSubtextCompact: {
    marginTop: rS(3),
    color: "#6B7280",
    fontFamily: "Montserrat-Regular",
    fontSize: rS(11.25),
    lineHeight: rS(16),
  },
  inlineActionPill: {
    borderRadius: rS(999),
    backgroundColor: "#EEF2FF",
    paddingHorizontal: rS(12),
    paddingVertical: rS(8),
  },
  inlineActionText: {
    color: "#344054",
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(11),
  },
  horizontalListWrap: {
    marginLeft: rS(-4),
  },
  singleFlashSaleWrap: {
    paddingHorizontal: rS(12),
  },
  ctaWrap: {
    paddingHorizontal: rS(30),
    marginTop: rS(18),
  },
});
