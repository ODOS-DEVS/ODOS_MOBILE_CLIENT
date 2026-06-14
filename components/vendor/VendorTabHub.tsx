import {
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
} from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import VendorStoreActionRow from "@/components/vendor/VendorStoreActionRow";
import VendorStorefrontPreview from "@/components/vendor/VendorStorefrontPreview";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { ManagedStoreProfile } from "@/types/store";
import type { VendorDashboardStats, VendorStatus } from "@/types/vendor";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTION_GAP = rV(14);

type VendorTabHubProps = {
  store: ManagedStoreProfile | null;
  businessName?: string | null;
  vendorStatus: VendorStatus;
  stats: VendorDashboardStats | null;
  isLoading: boolean;
  onOpenDashboard: () => void;
};

function formatCompactSales(value: number, currency: string) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${currency} ${(value / 1000).toFixed(1)}k`;
  }
  return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function VendorTabHub({
  store,
  businessName,
  vendorStatus,
  stats,
  isLoading,
  onOpenDashboard,
}: VendorTabHubProps) {
  const { colors, isDark } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { contentMaxWidth, horizontalPadding } = useResponsive();

  const pendingOrders = stats?.pendingOrders ?? 0;

  const glanceStats = useMemo(() => {
    if (!stats) {
      return undefined;
    }

    return [
      { value: stats.activeProducts, label: "Live" },
      { value: pendingOrders, label: "Pending" },
      { value: formatCompactSales(stats.totalSales, stats.currency), label: "Sales" },
    ];
  }, [pendingOrders, stats]);

  const shortcuts = useMemo(
    () => [
      {
        key: "profile",
        icon: "color-palette-outline" as const,
        label: "Store profile",
        subtitle: "Banner, logo, description, and contact details.",
        onPress: () => router.push("/vendor/store" as any),
      },
      {
        key: "products",
        icon: "cube-outline" as const,
        label: "Products",
        subtitle: stats
          ? `${stats.activeProducts} active listing${stats.activeProducts === 1 ? "" : "s"}`
          : "Manage your catalog and stock.",
        onPress: () => router.push("/vendor/products" as any),
      },
      {
        key: "orders",
        icon: "receipt-outline" as const,
        label: "Orders",
        subtitle: "Fulfillment and customer purchases.",
        onPress: () => router.push("/vendor/orders" as any),
        badge: pendingOrders > 0 ? String(pendingOrders) : undefined,
        badgeTone: "warning" as const,
      },
      {
        key: "wallet",
        icon: "wallet-outline" as const,
        label: "Wallet",
        subtitle: stats
          ? `${formatCompactSales(stats.availableBalance, stats.currency)} available`
          : "Payouts and balance.",
        onPress: () => router.push("/vendor/wallet" as any),
        isLast: true,
      },
    ],
    [pendingOrders, stats],
  );

  const openStorefrontPreview = () => {
    if (!store?.id) {
      return;
    }

    const banner = resolveApiMediaUrl(store.bannerImage);
    const logo = resolveApiMediaUrl(store.logoImage);

    router.push({
      pathname: "/(root)/screens/stores/[id]" as any,
      params: {
        id: store.id,
        title: store.name,
        image: banner ?? logo ?? undefined,
        imageBanner: banner ?? undefined,
        imageUrl: banner ?? logo ?? undefined,
      },
    });
  };

  const vendorLabel =
    vendorStatus === "approved" ? "Approved vendor" : "Vendor account";

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.screen }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: tabBarInset,
          },
        ]}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.intro}>
            <View
              style={[
                styles.introBadge,
                { backgroundColor: isDark ? colors.pill : "rgba(99, 102, 241, 0.1)" },
              ]}
            >
              <Ionicons name="storefront-outline" size={rMS(13)} color={colors.primary} />
              <Text style={[styles.introBadgeText, { color: colors.primary }]}>
                {vendorLabel}
              </Text>
            </View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>My store</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Your public storefront on ODOS. Use the dashboard for orders, analytics, and
              daily operations.
            </Text>
          </View>

          {isLoading && !store ? (
            <View style={styles.loaderWrap}>
              <ScreenLoader label="Loading storefront" />
            </View>
          ) : null}

          {!isLoading && !store ? (
            <AccountEmptyState
              icon="storefront-outline"
              title="Storefront not ready"
              message="Your vendor account is approved, but we could not load your store profile yet."
              actionLabel="Set up store profile"
              onAction={() => router.push("/vendor/store" as any)}
            />
          ) : null}

          {store ? (
            <View style={styles.sections}>
              <VendorStorefrontPreview
                store={store}
                businessName={businessName}
                onPress={openStorefrontPreview}
                onEditPress={() => router.push("/vendor/store" as any)}
              />

              {glanceStats ? (
                <AccountInsightCard
                  title="At a glance"
                  subtitle="Quick pulse before opening the dashboard."
                  stats={glanceStats}
                />
              ) : null}

              <AccountListCard style={styles.dashboardCardWrap}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onOpenDashboard}
                  style={[
                    styles.dashboardRow,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : colors.text,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dashboardIcon,
                      {
                        backgroundColor: isDark
                          ? colors.pill
                          : "rgba(255, 255, 255, 0.14)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="grid"
                      size={rMS(20)}
                      color={isDark ? colors.primary : "#FFFFFF"}
                    />
                  </View>

                  <View style={styles.dashboardCopy}>
                    <View style={styles.dashboardTitleRow}>
                      <Text
                        style={[
                          styles.dashboardTitle,
                          { color: isDark ? colors.text : "#FFFFFF" },
                        ]}
                        numberOfLines={1}
                      >
                        Open vendor dashboard
                      </Text>
                      {pendingOrders > 0 ? (
                        <View style={styles.dashboardBadge}>
                          <Text style={styles.dashboardBadgeText}>{pendingOrders}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.dashboardSubtitle,
                        {
                          color: isDark ? colors.textMuted : "rgba(255,255,255,0.85)",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      Analytics, chats, promotions, and advanced controls.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={rMS(20)}
                    color={isDark ? colors.iconMuted : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </AccountListCard>

              <AccountListCard style={styles.shortcutsCard}>
                <View
                  style={[styles.shortcutsHeader, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.shortcutsTitle, { color: colors.text }]}>
                    Shortcuts
                  </Text>
                  <Text style={[styles.shortcutsDescription, { color: colors.textMuted }]}>
                    Jump to the tools you use most.
                  </Text>
                </View>
                <View style={styles.shortcutsList}>
                  {shortcuts.map((item) => (
                    <VendorStoreActionRow
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      subtitle={item.subtitle}
                      onPress={item.onPress}
                      badge={item.badge}
                      badgeTone={item.badgeTone}
                      isLast={Boolean(item.isLast)}
                    />
                  ))}
                </View>
              </AccountListCard>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingTop: rV(10),
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  intro: {
    gap: rV(8),
    marginBottom: rV(18),
  },
  introBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: rS(6),
    paddingHorizontal: rS(10),
    paddingVertical: rV(4),
    borderRadius: rMS(999),
  },
  introBadgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(26),
    letterSpacing: -0.3,
    lineHeight: rMS(32),
  },
  pageSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(20),
  },
  loaderWrap: {
    minHeight: rV(200),
    justifyContent: "center",
  },
  sections: {
    gap: SECTION_GAP,
  },
  dashboardCardWrap: {
    padding: 0,
    overflow: "hidden",
  },
  dashboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    minHeight: rV(76),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
  },
  shortcutsCard: {
    padding: 0,
    overflow: "hidden",
  },
  shortcutsHeader: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(14),
    gap: rV(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  shortcutsTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(20),
  },
  shortcutsDescription: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  shortcutsList: {
    paddingHorizontal: rS(16),
  },
  dashboardIcon: {
    width: rMS(44),
    height: rMS(44),
    borderRadius: rMS(12),
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardCopy: {
    flex: 1,
    gap: rV(3),
    minWidth: 0,
  },
  dashboardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  dashboardTitle: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(20),
  },
  dashboardSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
  dashboardBadge: {
    minWidth: rS(22),
    height: rS(22),
    borderRadius: rS(11),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(6),
    backgroundColor: "#FCD34D",
  },
  dashboardBadgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    color: "#78350F",
  },
});
