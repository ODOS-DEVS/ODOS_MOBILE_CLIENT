import CatalogScrollFooter from "@/components/catalog/CatalogScrollFooter";
import ProductCard from "@/components/cards/ProductCard";
import { CommerceFilterChips } from "@/components/browse/CommerceSeeAllUi";
import CommerceEmptyState from "@/components/empty/CommerceEmptyState";
import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import { SkeletonLine, SkeletonTile } from "@/components/loaders/Skeleton";
import CommerceImage from "@/components/media/CommerceImage";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useMarkets, useStores, type StoreItem } from "@/hooks/useCommerce";
import { useInfiniteCatalogProducts } from "@/hooks/useInfiniteCatalogProducts";
import {
  productCardGapX,
  productCardGapY,
  responsiveColumns,
  rMS,
  rS,
  rV,
  useResponsive,
} from "@/styles/responsive";
import { computeStoreOpenStatus } from "@/utils/storeHours";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AVATAR_SIZE = rS(36);
const RIGHT_PANE_PADDING = rS(14);
const HANDLE_WIDTH = rS(18);
const HANDLE_HEIGHT = rS(46);

export default function MarketHubScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, isSmallDevice } = useResponsive();
  const { slug: slugParam, title: titleParam } = useLocalSearchParams<{
    slug?: string;
    title?: string;
  }>();

  const { markets } = useMarkets();

  // Local, not route-driven — lets the market switcher below change context
  // in place without pushing a new screen (and without leaving a stacked
  // "back" trail per market).
  const [activeMarketSlug, setActiveMarketSlug] = useState(
    typeof slugParam === "string" ? slugParam : "",
  );
  const [activeMarketTitle, setActiveMarketTitle] = useState(
    typeof titleParam === "string" && titleParam ? titleParam : "Market",
  );

  useEffect(() => {
    const match = markets.find((market) => market.slug === activeMarketSlug);
    if (match && match.title !== activeMarketTitle) {
      setActiveMarketTitle(match.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets, activeMarketSlug]);

  const marketChips = useMemo(
    () => markets.map((market) => ({ key: market.slug, label: market.title })),
    [markets],
  );

  const handleMarketChange = (nextSlug: string) => {
    if (nextSlug === activeMarketSlug) return;
    const match = markets.find((market) => market.slug === nextSlug);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveMarketSlug(nextSlug);
    setActiveMarketTitle(match?.title ?? nextSlug);
  };

  const { stores, isLoading: isLoadingStores } = useStores({ marketSlug: activeMarketSlug });
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarWidth = isSmallDevice ? rS(64) : rS(72);

  useEffect(() => {
    if (stores.length === 0) {
      setSelectedStoreId(null);
      return;
    }
    setSelectedStoreId((current) =>
      current && stores.some((store) => store.id === current) ? current : stores[0].id,
    );
  }, [stores]);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) ?? null,
    [selectedStoreId, stores],
  );

  const {
    products,
    isLoading: isLoadingProducts,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteCatalogProducts({
    storeId: selectedStoreId ?? undefined,
    enabled: Boolean(selectedStoreId),
  });

  const toggleSidebar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSidebarOpen((current) => !current);
  };

  const gridGap = productCardGapX();
  const rightPaneWidth = Math.max(width - (isSidebarOpen ? sidebarWidth : 0), 0);
  const gridColumns = Math.max(
    1,
    Math.min(responsiveColumns(rightPaneWidth), isSidebarOpen ? 3 : 5),
  );
  const cardWidth =
    (rightPaneWidth - RIGHT_PANE_PADDING * 2 - gridGap * (gridColumns - 1)) / gridColumns;

  const handleVisitStore = (store: StoreItem) => {
    router.push({
      pathname: "/(root)/screens/stores/[id]" as any,
      params: {
        id: store.id,
        image: store.imageUrl ?? undefined,
        imageKey: store.imageKey,
        imageUrl: store.imageUrl,
        imageBanner: store.imageBannerUrl ?? store.imageUrl ?? undefined,
        title: store.title,
      },
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1 },
        marketSwitcherRow: {
          height: rV(44),
          marginTop: rV(8),
          flexShrink: 0,
          flexGrow: 0,
        },
        marketSwitcher: {
          paddingHorizontal: rS(14),
          paddingBottom: rV(8),
          alignItems: "center",
        },
        body: { flex: 1, flexDirection: "row", position: "relative" },
        sidebarHandle: {
          position: "absolute",
          top: "50%",
          marginTop: -HANDLE_HEIGHT / 2,
          width: HANDLE_WIDTH,
          height: HANDLE_HEIGHT,
          borderRadius: rS(9),
          borderWidth: StyleSheet.hairlineWidth,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 5,
          elevation: 4,
        },
        sidebar: {
          borderRightWidth: StyleSheet.hairlineWidth,
          overflow: "hidden",
        },
        sidebarItem: {
          alignItems: "center",
          paddingVertical: rV(9),
          paddingHorizontal: rS(4),
          gap: rV(5),
        },
        sidebarAvatarWrap: {
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: AVATAR_SIZE / 2,
          overflow: "hidden",
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
        },
        sidebarAvatarPlaceholder: {
          alignItems: "center",
          justifyContent: "center",
        },
        sidebarStatusDot: {
          position: "absolute",
          bottom: 0,
          right: rS(1),
          width: rS(8),
          height: rS(8),
          borderRadius: rS(4),
          borderWidth: 1.5,
        },
        sidebarLabel: {
          fontFamily: Fonts.title,
          fontSize: rMS(9.5),
          textAlign: "center",
          lineHeight: rMS(12),
        },
        sidebarAccentBar: {
          position: "absolute",
          left: 0,
          top: rV(4),
          bottom: rV(4),
          width: rS(3),
          borderRadius: rS(2),
        },
        rightPane: { flex: 1 },
        selectedStoreHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: RIGHT_PANE_PADDING,
          paddingTop: rV(10),
          paddingBottom: rV(8),
          gap: rS(8),
        },
        selectedStoreTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14.5),
          flexShrink: 1,
        },
        selectedStoreSubtitle: {
          fontFamily: Fonts.title,
          fontSize: rMS(10.5),
          marginTop: rV(2),
        },
        visitStoreChip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(5),
          borderRadius: 999,
          paddingHorizontal: rS(12),
          paddingVertical: rV(8),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.16,
          shadowRadius: 4,
          elevation: 2,
        },
        visitStoreChipText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
        },
      }),
    [],
  );

  const selectedOpenStatus = useMemo(
    () => computeStoreOpenStatus(selectedStore?.businessHours),
    [selectedStore?.businessHours],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <ProfileHeader title={activeMarketTitle} />

      {marketChips.length > 1 ? (
        <View style={styles.marketSwitcherRow}>
          <CommerceFilterChips
            chips={marketChips}
            activeKey={activeMarketSlug}
            onChange={handleMarketChange}
            style={styles.marketSwitcher}
          />
        </View>
      ) : null}

      {!isLoadingStores && stores.length === 0 ? (
        <View style={{ paddingHorizontal: rS(16), marginTop: rV(28) }}>
          <CommerceEmptyState
            icon="storefront-outline"
            title="No stores here yet"
            message="This market doesn't have any active stores right now. Check back soon."
          />
        </View>
      ) : (
        <View style={styles.body}>
          <View
            style={[
              styles.sidebar,
              {
                width: isSidebarOpen ? sidebarWidth : 0,
                borderRightColor: isSidebarOpen ? colors.border : "transparent",
              },
            ]}
          >
            {isLoadingStores && stores.length === 0 ? (
              <View style={{ paddingTop: rV(12) }}>
                {[0, 1, 2, 3, 4].map((key) => (
                  <View key={key} style={styles.sidebarItem}>
                    <SkeletonTile
                      width={AVATAR_SIZE}
                      height={AVATAR_SIZE}
                      radius={AVATAR_SIZE / 2}
                      delay={key * 60}
                    />
                    <SkeletonLine width={AVATAR_SIZE} height={rV(7)} delay={key * 60 + 40} />
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                data={stores}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: rV(10) }}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedStoreId;
                  const openStatus = computeStoreOpenStatus(item.businessHours);
                  const isOpen = !item.isOnVacation && (openStatus ? openStatus.isOpen : true);
                  return (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setSelectedStoreId(item.id)}
                      style={styles.sidebarItem}
                    >
                      {isSelected ? (
                        <View
                          style={[styles.sidebarAccentBar, { backgroundColor: colors.primary }]}
                        />
                      ) : null}
                      <View
                        style={[
                          styles.sidebarAvatarWrap,
                          {
                            borderColor: isSelected ? colors.primary : "transparent",
                            backgroundColor: colors.imagePlaceholder,
                          },
                        ]}
                      >
                        {item.image ? (
                          <CommerceImage
                            source={item.image}
                            trackingId={`market-sidebar-store-${item.id}`}
                            recyclingKey={item.id}
                            placeholderColor={colors.imagePlaceholder}
                          />
                        ) : (
                          <View style={styles.sidebarAvatarPlaceholder}>
                            <Ionicons
                              name="storefront-outline"
                              size={rS(15)}
                              color={colors.iconMuted}
                            />
                          </View>
                        )}
                        <View
                          style={[
                            styles.sidebarStatusDot,
                            {
                              backgroundColor: isOpen ? "#22C55E" : "#9CA3AF",
                              borderColor: colors.screen,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sidebarLabel,
                          { color: isSelected ? colors.text : colors.textMuted },
                        ]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>

          <View style={styles.rightPane}>
            <View style={styles.selectedStoreHeader}>
              {selectedStore ? (
                <View style={{ flexShrink: 1 }}>
                  <Text
                    style={[styles.selectedStoreTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {selectedStore.title}
                  </Text>
                  <Text
                    style={[styles.selectedStoreSubtitle, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {products.length} {products.length === 1 ? "product" : "products"}
                    {hasMore ? "+" : ""}
                    {selectedOpenStatus
                      ? ` · ${selectedOpenStatus.isOpen ? "Open now" : "Closed"}`
                      : ""}
                  </Text>
                </View>
              ) : (
                <View style={{ flexShrink: 1 }} />
              )}
              {selectedStore ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleVisitStore(selectedStore)}
                  style={[styles.visitStoreChip, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="storefront-outline" size={rMS(13)} color={colors.onPrimary} />
                  <Text style={[styles.visitStoreChipText, { color: colors.onPrimary }]}>
                    Visit store
                  </Text>
                  <Ionicons name="chevron-forward" size={rMS(12)} color={colors.onPrimary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {isLoadingProducts && products.length === 0 ? (
              <View style={{ paddingHorizontal: RIGHT_PANE_PADDING, paddingTop: rV(4) }}>
                <ProductGridSkeleton count={4} />
              </View>
            ) : (
              <FlatList
                data={products}
                key={`${selectedStoreId}-${gridColumns}`}
                numColumns={gridColumns}
                keyExtractor={(item) => item.id}
                onEndReached={() => void loadMore()}
                onEndReachedThreshold={0.42}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingProducts && products.length > 0}
                    onRefresh={() => void refresh()}
                    tintColor={colors.primary}
                  />
                }
                ListFooterComponent={<CatalogScrollFooter isLoadingMore={isLoadingMore} />}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  columnGap: gridGap,
                  paddingHorizontal: RIGHT_PANE_PADDING,
                }}
                contentContainerStyle={{
                  paddingBottom: insets.bottom + rV(24),
                  flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={false}
                renderItem={({ item }) => (
                  <View style={{ width: cardWidth, marginBottom: productCardGapY() }}>
                    <ProductCard
                      {...item}
                      cardWidth={cardWidth}
                      horizontalSpacing={0}
                      sourceScreen="market_hub"
                      storeId={selectedStoreId ?? undefined}
                    />
                  </View>
                )}
                ListEmptyComponent={
                  selectedStore ? (
                    <View style={{ paddingHorizontal: RIGHT_PANE_PADDING, marginTop: rV(28) }}>
                      <CommerceEmptyState
                        icon="bag-outline"
                        title="No products yet"
                        message={`${selectedStore.title} hasn't added any products yet.`}
                      />
                    </View>
                  ) : null
                }
              />
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleSidebar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.sidebarHandle,
              {
                left: isSidebarOpen ? sidebarWidth - HANDLE_WIDTH / 2 : rS(2),
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={isSidebarOpen ? "chevron-back" : "chevron-forward"}
              size={rMS(14)}
              color={isSidebarOpen ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
