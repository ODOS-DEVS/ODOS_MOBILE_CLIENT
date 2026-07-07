import VerifiedSeal from "@/components/badges/VerifiedSeal";
import { StoreProfileSkeleton } from "@/components/loaders/CommerceSkeletons";
import StoreDealsShowcase from "@/components/store/StoreDealsShowcase";
import StoreExploreBar from "@/components/store/StoreExploreBar";
import StoreFeaturedShowcase from "@/components/store/StoreFeaturedShowcase";
import StoreInfoPanel from "@/components/store/StoreInfoPanel";
import StoreVouchersStrip from "@/components/store/StoreVouchersStrip";
import AssistantEntryButton from "@/components/assistant/AssistantEntryButton";
import {
  STOREFRONT_COVER_HEIGHT,
  StorefrontHero,
} from "@/components/store/StorefrontExperience";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useStore } from "@/hooks/useCommerce";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { hasStoreCoordinates } from "@/utils/location";
import { resolveApiMediaUrl } from "@/utils/media";
import { goBackOr } from "@/utils/navigation";
import { shareStore } from "@/utils/shareStore";
import { formatStoreProductBadge, formatStoreProductCount } from "@/utils/storeProductBrowse";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STICKY_BAR_HEIGHT = rV(48);
const EXPLORE_BAR_SPACE = rV(96);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const StoreLandingScreen = () => {
  const { colors } = useTheme();
  const [stickyThreshold, setStickyThreshold] = useState(
    STOREFRONT_COVER_HEIGHT + 120,
  );
  const [stickyActive, setStickyActive] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentRef = useRef<View>(null);
  const nameAnchorRef = useRef<View>(null);
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const storeId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const paramTitle =
    typeof params.title === "string"
      ? params.title
      : Array.isArray(params.title)
        ? params.title[0]
        : "Store";
  const paramImage =
    typeof params.image === "string"
      ? params.image
      : Array.isArray(params.image)
        ? params.image[0]
        : undefined;
  const paramImageBanner =
    typeof params.imageBanner === "string"
      ? params.imageBanner
      : Array.isArray(params.imageBanner)
        ? params.imageBanner[0]
        : paramImage;

  const fallbackStore = useMemo(
    () => ({
      id: storeId,
      slug: paramTitle.toLowerCase().replace(/\s+/g, "-"),
      title: paramTitle,
      status: "active",
      image: resolveApiMediaUrl(paramImage)
        ? { uri: resolveApiMediaUrl(paramImage)! }
        : null,
      imageBanner: resolveApiMediaUrl(paramImageBanner)
        ? { uri: resolveApiMediaUrl(paramImageBanner)! }
        : null,
    }),
    [paramImage, paramImageBanner, paramTitle, storeId],
  );

  const {
    store,
    isLoading,
    error: storeError,
    refresh,
  } = useStore({
    storeId,
    fallback: fallbackStore,
  });

  const {
    products: storeProducts,
    hasMore: hasMoreStoreProducts,
    isLoading: productsLoading,
  } = useInfiniteCatalogProducts({
      storeId,
      enabled: Boolean(storeId),
    });

  const insets = useSafeAreaInsets();
  const { horizontalPadding, width } = useResponsive();
  const shellWidth = width;

  useEffect(() => {
    scrollY.setValue(0);
    setStickyActive(false);
    setStickyThreshold(STOREFRONT_COVER_HEIGHT + 120);
  }, [storeId, scrollY]);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      setStickyActive(value >= stickyThreshold - 6);
    });
    return () => scrollY.removeListener(listenerId);
  }, [scrollY, stickyThreshold]);

  const measureStickyThreshold = useCallback(() => {
    if (!contentRef.current || !nameAnchorRef.current) return;
    nameAnchorRef.current.measureLayout(
      contentRef.current,
      (_x, y) =>
        setStickyThreshold(Math.max(0, y - (insets.top + STICKY_BAR_HEIGHT))),
      () => undefined,
    );
  }, [insets.top]);

  const handleShareStore = useCallback(async () => {
    if (!store) return;
    try {
      await shareStore({
        id: store.id,
        name: store.title,
        slug: store.slug,
        category: store.category,
        city: store.city,
        region: store.region,
      });
    } catch {
      showToast("We couldn't share this store right now.");
    }
  }, [showToast, store]);

  const openStoreLocation = useCallback(() => {
    if (!store) return;
    router.push({
      pathname: "/(root)/screens/stores/map" as any,
      params: { storeId: store.id, title: String(store.title ?? "Store") },
    });
  }, [store]);

  const openStoreChat = useCallback(() => {
    if (!store) return;
    if (!user) {
      showToast("Sign in to chat with this store.");
      return;
    }
    router.push({
      pathname: "/screens/productDetails/chat/[vendorId]",
      params: {
        vendorId: store.id,
        vendorName: String(store.title ?? "Store"),
      },
    } as any);
  }, [showToast, store, user]);

  const openStoreProducts = useCallback(() => {
    if (!store) return;
    router.push({
      pathname: "/(root)/screens/stores/[id]/products" as any,
      params: {
        id: store.id,
        title: String(store.title ?? "Store"),
        image: paramImage ?? "",
        imageBanner: paramImageBanner ?? "",
      },
    });
  }, [paramImage, paramImageBanner, store]);

  if (isLoading && !store) {
    return <StoreProfileSkeleton />;
  }

  if (!store) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.screen }]}>
        <StatusBar style="dark" />
        <View style={[styles.emptyState, { paddingTop: insets.top + rV(24) }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.pill }]}>
            <Ionicons name="storefront-outline" size={rS(28)} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            {storeError ?? "We couldn't load this store"}
          </Text>
          <Text
            style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}
          >
            Check your connection and try again, or go back to browse other stores.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={[styles.emptyPrimary, { backgroundColor: colors.text }]}
              activeOpacity={0.9}
              onPress={() => void refresh()}
            >
              <Text style={[styles.emptyPrimaryText, { color: colors.onPrimary }]}>
                Try again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emptySecondary, { borderColor: colors.borderStrong }]}
              activeOpacity={0.86}
              onPress={() =>
                goBackOr(router, {
                  fallback: "/(root)/screens/stores/stores" as any,
                })
              }
            >
              <Text style={[styles.emptySecondaryText, { color: colors.text }]}>
                Back to stores
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const isVerified = store.status === "active";
  const coverHeight = STOREFRONT_COVER_HEIGHT + insets.top;
  const headerButtonTop = insets.top + rS(10);
  const stickyBarTotalHeight = insets.top + STICKY_BAR_HEIGHT;
  const hasMap =
    hasStoreCoordinates(store.latitude, store.longitude) ||
    Boolean(store.address || store.city || store.distanceKm);

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(0, stickyThreshold - 24),
      Math.max(1, stickyThreshold),
    ],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const inlineNameOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(0, stickyThreshold - 24),
      Math.max(1, stickyThreshold),
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [
      Math.max(0, stickyThreshold - 24),
      Math.max(1, stickyThreshold),
    ],
    outputRange: [-rS(8), 0],
    extrapolate: "clamp",
  });

  const exploreLabel = formatStoreProductCount(
    storeProducts.length,
    hasMoreStoreProducts,
  );
  const productBadge = formatStoreProductBadge(
    storeProducts.length,
    hasMoreStoreProducts,
  );
  const hasProducts = storeProducts.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <StatusBar style="light" translucent />
      <AnimatedScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + EXPLORE_BAR_SPACE,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          },
        )}
      >
        <View
          ref={contentRef}
          collapsable={false}
          style={{ width: shellWidth, alignSelf: "center" }}
          onLayout={measureStickyThreshold}
        >
          <StorefrontHero
            store={store}
            coverHeight={coverHeight}
            headerButtonTop={headerButtonTop}
            scrollY={scrollY}
            inlineNameOpacity={inlineNameOpacity}
            nameAnchorRef={nameAnchorRef}
            onMeasureName={measureStickyThreshold}
            onBack={() =>
              goBackOr(router, {
                fallback: "/(root)/screens/stores/stores" as any,
              })
            }
            onShare={() => void handleShareStore()}
            onChat={openStoreChat}
            onMap={hasMap ? openStoreLocation : undefined}
            productBadge={productBadge}
          />

          <StoreInfoPanel
            store={store}
            horizontalPadding={horizontalPadding}
            onMap={hasMap ? openStoreLocation : undefined}
          />

          <StoreVouchersStrip storeId={storeId} horizontalPadding={horizontalPadding} />

          <StoreDealsShowcase
            products={storeProducts}
            storeId={storeId}
            horizontalPadding={horizontalPadding}
            onBrowseAll={openStoreProducts}
          />

          <View style={{ paddingHorizontal: horizontalPadding, marginTop: rV(8) }}>
            <AssistantEntryButton
              screen="store"
              label="Ask about this store"
              compact
            />
          </View>

          <StoreFeaturedShowcase
            products={storeProducts}
            storeId={storeId}
            storeTitle={store.title}
            horizontalPadding={horizontalPadding}
            productsLoading={productsLoading}
            hasMoreProducts={hasMoreStoreProducts}
            onBrowseAll={openStoreProducts}
          />
        </View>
      </AnimatedScrollView>

      <StoreExploreBar
        label={exploreLabel}
        sublabel={
          hasProducts
            ? "Search, filter, and shop the full catalog"
            : productsLoading
              ? "Loading this store's catalog…"
              : "Open the catalog to check for new arrivals"
        }
        loading={productsLoading && storeProducts.length === 0}
        onPress={openStoreProducts}
      />

      <Animated.View
        pointerEvents={stickyActive ? "box-none" : "none"}
        style={[
          styles.stickyHeader,
          {
            height: stickyBarTotalHeight,
            opacity: stickyHeaderOpacity,
            transform: [{ translateY: stickyHeaderTranslateY }],
            backgroundColor: colors.card,
            borderBottomColor: colors.headerBorder,
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
              goBackOr(router, {
                fallback: "/(root)/screens/stores/stores" as any,
              })
            }
            style={[styles.stickyIconButton, { backgroundColor: colors.pill }]}
            activeOpacity={0.82}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.stickyTitleWrap}>
            {store.image ? (
              <Image
                source={store.image}
                style={styles.stickyLogo}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.stickyLogoPlaceholder,
                  { backgroundColor: colors.pill },
                ]}
              >
                <Ionicons
                  name="storefront-outline"
                  size={rS(14)}
                  color={colors.iconMuted}
                />
              </View>
            )}
            <Text
              style={[styles.stickyTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {store.title}
            </Text>
            {isVerified ? <VerifiedSeal size={rS(15)} /> : null}
          </View>

          <TouchableOpacity
            onPress={() => void handleShareStore()}
            style={[styles.stickyIconButton, { backgroundColor: colors.pill }]}
            activeOpacity={0.82}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default StoreLandingScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: rS(24),
    alignItems: "center",
    justifyContent: "center",
    gap: rV(10),
  },
  emptyIcon: {
    width: rS(64),
    height: rS(64),
    borderRadius: rS(22),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(4),
  },
  emptyStateTitle: {
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rS(18),
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: rS(12.5),
    lineHeight: rS(19),
    textAlign: "center",
    maxWidth: rS(280),
  },
  emptyActions: {
    marginTop: rV(12),
    width: "100%",
    gap: rV(10),
  },
  emptyPrimary: {
    minHeight: rV(48),
    borderRadius: rS(14),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPrimaryText: {
    fontFamily: "Montserrat-Bold",
    fontSize: rS(14),
  },
  emptySecondary: {
    minHeight: rV(48),
    borderRadius: rS(14),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySecondaryText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: rS(14),
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    width: rS(28),
    height: rS(28),
    borderRadius: rS(9),
  },
  stickyLogoPlaceholder: {
    width: rS(28),
    height: rS(28),
    borderRadius: rS(9),
    alignItems: "center",
    justifyContent: "center",
  },
  stickyTitle: {
    flexShrink: 1,
    maxWidth: "62%",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rS(14.5),
  },
});
