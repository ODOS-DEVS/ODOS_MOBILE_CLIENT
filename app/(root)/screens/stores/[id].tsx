import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import VerifiedSeal from "@/components/badges/VerifiedSeal";
import FlashSalesCard from "@/components/cards/FlashSaleCard";
import ProductCard from "@/components/cards/ProductCard";
import StoreOfferCard from "@/components/cards/StoreOfferCard";
import EmptySection from "@/components/empty/EmptySection";
import { OffersCountBadge } from "@/components/deals/OffersCountBadge";
import { ProductGridSkeleton, StoreProfileSkeleton } from "@/components/loaders/CommerceSkeletons";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { useStore } from "@/hooks/useCommerce";
import { type StoreVoucherOffer, useVouchers } from "@/hooks/useVouchers";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { formatStoreAddress, hasStoreCoordinates } from "@/utils/location";
import { goBackOr, navigateToHome } from "@/utils/navigation";
import { resolveApiMediaUrl } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COVER_HEIGHT = rV(232);
const STICKY_BAR_HEIGHT = rV(52);

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const StoreDetailScreen = () => {
  const [storeOffers, setStoreOffers] = useState<StoreVoucherOffer[]>([]);
  const [isClaimingOfferId, setIsClaimingOfferId] = useState<string | null>(null);
  const [stickyThreshold, setStickyThreshold] = useState(COVER_HEIGHT + 180);
  const [stickyActive, setStickyActive] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentRef = useRef<View>(null);
  const nameAnchorRef = useRef<View>(null);
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
  const {
    products: storeProducts,
    isLoading: isLoadingStoreProducts,
    isLoadingMore: isLoadingMoreStoreProducts,
    loadMore: loadMoreStoreProducts,
  } = useInfiniteCatalogProducts({
    storeId,
    enabled: Boolean(storeId),
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
  const singleFlashSaleCardWidth = Math.max(shellWidth - horizontalPadding * 2, rS(200));

  const handleStoreScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: {
        nativeEvent: {
          layoutMeasurement: { height: number };
          contentOffset: { y: number };
          contentSize: { height: number };
        };
      }) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = rV(280);
        if (
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom
        ) {
          void loadMoreStoreProducts();
        }
      },
    },
  );

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
    scrollY.setValue(0);
    setStickyActive(false);
    setStickyThreshold(COVER_HEIGHT + 180);
  }, [storeId, scrollY]);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      setStickyActive(value >= stickyThreshold - 8);
    });
    return () => scrollY.removeListener(listenerId);
  }, [scrollY, stickyThreshold]);

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
        <StatusBar style="dark" />
        <View style={[styles.emptyState, { paddingTop: insets.top }]}>
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

  const storeLocation = formatStoreAddress([store.address, store.city, store.region]);
  const audienceLabel =
    store.audienceSlugs && store.audienceSlugs.length > 0
      ? store.audienceSlugs.join(", ")
      : "All shoppers";
  const isVerified = store.status === "active";
  const hasStoreProducts = storeProducts.length > 0;
  const coverHeight = COVER_HEIGHT + insets.top;
  const headerButtonTop = insets.top + rS(12);
  const stickyBarTotalHeight = insets.top + STICKY_BAR_HEIGHT;

  const measureStickyThreshold = () => {
    if (!contentRef.current || !nameAnchorRef.current) {
      return;
    }

    nameAnchorRef.current.measureLayout(
      contentRef.current,
      (_x, y) => {
        setStickyThreshold(Math.max(0, y - stickyBarTotalHeight));
      },
      () => undefined,
    );
  };

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(0, stickyThreshold - 28),
      Math.max(1, stickyThreshold),
    ],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const inlineNameOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(0, stickyThreshold - 28),
      Math.max(1, stickyThreshold),
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [
      Math.max(0, stickyThreshold - 28),
      Math.max(1, stickyThreshold),
    ],
    outputRange: [-rS(10), 0],
    extrapolate: "clamp",
  });
  const hasVisitLocation = Boolean(
    storeLocation ||
      hasStoreCoordinates(store.latitude, store.longitude) ||
      store.distanceKm ||
      store.travelMinutes,
  );
  const visitLocationHint = [
    storeLocation,
    store.distanceKm ? `${store.distanceKm} away` : null,
    store.travelMinutes ? store.travelMinutes : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const openStoreLocation = () => {
    router.push({
      pathname: "/(root)/screens/stores/map" as any,
      params: {
        storeId: store.id,
        title: String(store.title ?? "Store"),
      },
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />
      <AnimatedScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleStoreScroll}
      >
        <View
          ref={contentRef}
          collapsable={false}
          style={{ width: shellWidth, alignSelf: "center" }}
          onLayout={measureStickyThreshold}
        >
        <View style={styles.heroSection}>
        <View style={[styles.coverWrap, { height: coverHeight }]}>
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

          <TouchableOpacity
            onPress={() =>
              goBackOr(router, { fallback: "/(root)/screens/stores/stores" as any })
            }
            style={[styles.backButton, { top: headerButtonTop }]}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateToHome(router)}
            style={[styles.backButton, styles.homeButton, { top: headerButtonTop }]}
          >
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.logoShell}>
            <View style={styles.logoClip}>
              {store.image ? (
                <Image source={store.image} style={styles.logoImage} resizeMode="cover" />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="storefront-outline" size={rS(22)} color="#94A3B8" />
                </View>
              )}
            </View>
            {isVerified ? (
              <VerifiedSeal size={rS(24)} style={styles.verifiedSeal} />
            ) : null}
          </View>

          <View style={styles.profileHeaderRow}>
            <View style={styles.profileTextWrap}>
              <View
                ref={nameAnchorRef}
                collapsable={false}
                onLayout={measureStickyThreshold}
                style={styles.nameRow}
              >
                <Animated.Text
                  style={[styles.storeName, { opacity: inlineNameOpacity }]}
                  numberOfLines={2}
                >
                  {store.title}
                </Animated.Text>
              </View>

              <Text style={styles.storeMeta} numberOfLines={2}>
                {[store.category, store.city].filter(Boolean).join(" · ")}
              </Text>

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
          </View>

          {hasVisitLocation ? (
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={openStoreLocation}
              style={styles.visitLocationCard}
            >
              <View style={styles.visitLocationIconWrap}>
                <Ionicons name="navigate-circle" size={rS(22)} color="#696969" />
              </View>
              <View style={styles.visitLocationCopy}>
                <Text style={styles.visitLocationTitle}>Visit store</Text>
                <Text style={styles.visitLocationSubtitle} numberOfLines={2}>
                  {visitLocationHint || "View exact store location on the map"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={rS(18)} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
        </View>

        <View style={styles.contentSection}>
        {flashSaleProducts.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Flash Sales
              </Text>
              <OffersCountBadge count={flashSaleProducts.length} label="live" />
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

        <>
            {hasStoreProducts ? (
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionTitle}>Product line</Text>
                  <Text style={styles.sectionSubtextCompact}>
                    {storeProducts.length} product{storeProducts.length === 1 ? "" : "s"} loaded
                  </Text>
                </View>
              </View>
            ) : null}

            <View>
              {isLoadingStoreProducts && storeProducts.length === 0 ? (
                <View style={{ paddingHorizontal: gridPadding, paddingTop: 16 }}>
                  <ProductGridSkeleton count={4} />
                </View>
              ) : hasStoreProducts ? (
                <>
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
                  <CatalogScrollFooter isLoadingMore={isLoadingMoreStoreProducts} />
                </>
              ) : (
                <View style={{ paddingHorizontal: gridPadding }}>
                  <EmptySection
                    icon="shirt-outline"
                    title="No products in this store yet"
                    message="When the store owner adds items, they will show up here for shoppers to browse and buy."
                  />
                </View>
              )}
            </View>
        </>

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
        </View>
        </View>
      </AnimatedScrollView>

      <Animated.View
        pointerEvents={stickyActive ? "box-none" : "none"}
        style={[
          styles.stickyHeader,
          {
            height: stickyBarTotalHeight,
            opacity: stickyHeaderOpacity,
            transform: [{ translateY: stickyHeaderTranslateY }],
          },
        ]}
      >
        <View
          style={[
            styles.stickyHeaderInner,
            { paddingTop: insets.top, height: stickyBarTotalHeight },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              goBackOr(router, { fallback: "/(root)/screens/stores/stores" as any })
            }
            style={styles.stickyIconButton}
            activeOpacity={0.82}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>

          <View style={styles.stickyTitleWrap}>
            {store.image ? (
              <Image source={store.image} style={styles.stickyLogo} resizeMode="cover" />
            ) : (
              <View style={styles.stickyLogoPlaceholder}>
                <Ionicons name="storefront-outline" size={rS(14)} color="#94A3B8" />
              </View>
            )}
            <Text style={styles.stickyTitle} numberOfLines={1}>
              {store.title}
            </Text>
            {isVerified ? <VerifiedSeal size={rS(16)} /> : null}
          </View>

          <TouchableOpacity
            onPress={() => navigateToHome(router)}
            style={styles.stickyIconButton}
            activeOpacity={0.82}
          >
            <Ionicons name="home-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    marginTop: -rS(66),
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoClip: {
    width: "100%",
    height: "100%",
    borderRadius: rS(28),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  verifiedSeal: {
    position: "absolute",
    right: -rS(4),
    bottom: -rS(4),
    zIndex: 4,
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
  storeMeta: {
    color: "#4B5563",
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(12.5),
    lineHeight: rS(18),
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
  tagText: {
    color: "#4B5563",
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(10.75),
  },
  visitLocationCard: {
    marginTop: rS(14),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingHorizontal: rS(14),
    paddingVertical: rS(12),
    borderRadius: rS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  visitLocationIconWrap: {
    width: rS(42),
    height: rS(42),
    borderRadius: rS(21),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  visitLocationCopy: {
    flex: 1,
    gap: rV(2),
  },
  visitLocationTitle: {
    color: "#111827",
    fontFamily: "Montserrat-Bold",
    fontSize: rS(13),
  },
  visitLocationSubtitle: {
    color: "#6B7280",
    fontFamily: "Montserrat-Regular",
    fontSize: rS(11.5),
    lineHeight: rS(16),
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
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(15, 23, 42, 0.1)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  stickyHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(12),
    gap: rS(8),
  },
  stickyIconButton: {
    width: rS(40),
    height: rS(40),
    borderRadius: rS(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  stickyTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    paddingHorizontal: rS(4),
  },
  stickyLogo: {
    width: rS(30),
    height: rS(30),
    borderRadius: rS(10),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  stickyLogoPlaceholder: {
    width: rS(30),
    height: rS(30),
    borderRadius: rS(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  stickyTitle: {
    flexShrink: 1,
    maxWidth: "72%",
    color: "#111827",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rS(15),
  },
});
