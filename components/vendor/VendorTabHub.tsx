import { AccountEmptyState } from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import type { ManagedStoreProfile } from "@/types/store";
import type { VendorAnalyticsInsights, VendorDashboardStats, VendorStatus } from "@/types/vendor";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTION_GAP = rV(16);

type VendorTabHubProps = {
  store: ManagedStoreProfile | null;
  businessName?: string | null;
  vendorStatus: VendorStatus;
  stats: VendorDashboardStats | null;
  insights: VendorAnalyticsInsights;
  unreadChats?: number;
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenDashboard: () => void;
  onOpenSettings?: () => void;
};

type MetricTone = "default" | "accent" | "success" | "warning";

type MetricTile = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: MetricTone;
  onPress: () => void;
};

type QuickTile = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  badgeTone?: "neutral" | "warning" | "success";
  onPress: () => void;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function formatCompactSales(value: number | null | undefined, currency?: string | null) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const safeCurrency = currency?.trim() || "GHS";
  const abs = Math.abs(safeValue);
  if (abs >= 1_000_000) {
    return `${safeCurrency} ${(safeValue / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${safeCurrency} ${(safeValue / 1000).toFixed(1)}k`;
  }
  return `${safeCurrency} ${safeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function useMetricPalette(tone: MetricTone = "default") {
  const { colors, isDark } = useTheme();

  return useMemo(() => {
    if (tone === "warning") {
      return {
        bg: isDark ? "#422006" : "#FFF7ED",
        border: isDark ? "#78350F" : "#FED7AA",
        accent: "#F59E0B",
        value: isDark ? "#FCD34D" : "#92400E",
        label: isDark ? "#FDE68A" : "#B45309",
        iconBg: isDark ? "#78350F" : "#FEF3C7",
        icon: isDark ? "#FCD34D" : "#D97706",
      };
    }
    if (tone === "success") {
      return {
        bg: isDark ? "#052E16" : "#F0FDF4",
        border: isDark ? "#166534" : "#BBF7D0",
        accent: "#22C55E",
        value: isDark ? "#86EFAC" : "#166534",
        label: isDark ? "#A7F3D0" : "#15803D",
        iconBg: isDark ? "#14532D" : "#DCFCE7",
        icon: isDark ? "#86EFAC" : "#16A34A",
      };
    }
    if (tone === "accent") {
      return {
        bg: isDark ? "#1E1B4B" : "#EEF2FF",
        border: isDark ? "#4338CA" : "#C7D2FE",
        accent: colors.primary,
        value: colors.text,
        label: colors.textMuted,
        iconBg: isDark ? colors.pill : "#FFFFFF",
        icon: colors.primary,
      };
    }
    return {
      bg: isDark ? colors.surfaceSubtle : colors.card,
      border: colors.cardBorder,
      accent: colors.border,
      value: colors.text,
      label: colors.textMuted,
      iconBg: isDark ? colors.pill : "#F3F4F6",
      icon: colors.primary,
    };
  }, [colors, isDark, tone]);
}

function VendorStoreTabHero({
  storeName,
  businessName,
  vendorStatus,
  isLive,
  onOpenSettings,
}: {
  storeName: string;
  businessName?: string | null;
  vendorStatus: VendorStatus;
  isLive: boolean;
  onOpenSettings?: () => void;
}) {
  const { colors, isDark } = useTheme();
  const gradientColors = isDark
    ? (["#111827", "#1E1B4B", "#0F172A"] as const)
    : (["#EEF2FF", "#F5F3FF", "#FFFFFF"] as const);

  const vendorLabel =
    vendorStatus === "approved" ? "Seller Center" : "Vendor account";

  return (
    <LinearGradient colors={gradientColors} style={heroStyles.shell}>
      <View style={heroStyles.topRow}>
        <View style={heroStyles.greetingBlock}>
          <Text style={[heroStyles.greeting, { color: colors.textMuted }]}>
            {getGreeting()} · Seller Center
          </Text>
          <Text style={[heroStyles.storeName, { color: colors.text }]} numberOfLines={2}>
            {storeName}
          </Text>
          {businessName && businessName !== storeName ? (
            <Text
              style={[heroStyles.businessName, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {businessName}
            </Text>
          ) : null}
        </View>

        {onOpenSettings ? (
          <TouchableOpacity
            style={[
              heroStyles.settingsButton,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)",
                borderColor: isDark ? colors.border : "rgba(99, 102, 241, 0.12)",
              },
            ]}
            onPress={onOpenSettings}
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel="Store settings"
          >
            <Ionicons name="settings-outline" size={rMS(20)} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={heroStyles.badges}>
        <View
          style={[
            heroStyles.badge,
            { backgroundColor: isDark ? colors.pill : "rgba(99, 102, 241, 0.1)" },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={rMS(12)} color={colors.primary} />
          <Text style={[heroStyles.badgeText, { color: colors.primary }]}>{vendorLabel}</Text>
        </View>

        <View
          style={[
            heroStyles.badge,
            {
              backgroundColor: isLive
                ? isDark
                  ? "rgba(34, 197, 94, 0.18)"
                  : "rgba(22, 163, 74, 0.1)"
                : isDark
                  ? colors.pill
                  : "#F3F4F6",
            },
          ]}
        >
          {isLive ? <View style={heroStyles.liveDot} /> : null}
          <Text
            style={[
              heroStyles.badgeText,
              { color: isLive ? (isDark ? "#86EFAC" : "#166534") : colors.textMuted },
            ]}
          >
            {isLive ? "Live storefront" : "Draft storefront"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function VendorNotificationsPrompt() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const needsMasterToggle = !user?.allow_notifications;
  const needsOrderToggle =
    Boolean(user?.allow_notifications) &&
    !(user?.vendor_notify_orders ?? user?.vendor_order_notifications);

  if (!needsMasterToggle && !needsOrderToggle) {
    return null;
  }

  const title = needsMasterToggle ? "Turn on order alerts" : "Enable new order alerts";
  const body = needsMasterToggle
    ? "Enable push notifications so you never miss a new shopper order, even when ODOS is in the background."
    : "Keep the dedicated new-order alert switch on so ODOS can ring, vibrate, and remind you until the order is fulfilled.";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push("/(root)/screens/profileScreens/personalization/Notification" as any)
      }
      style={[
        promptStyles.shell,
        {
          backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
          borderColor: isDark ? "#4338CA" : "#C7D2FE",
        },
      ]}
    >
      <View style={[promptStyles.iconShell, { backgroundColor: isDark ? colors.pill : "#FFFFFF" }]}>
        <Ionicons name="notifications" size={rMS(20)} color={colors.primary} />
      </View>
      <View style={promptStyles.copy}>
        <Text style={[promptStyles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[promptStyles.body, { color: colors.textMuted }]}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" size={rMS(18)} color={colors.primary} />
    </TouchableOpacity>
  );
}

function VendorStoreMetricTile({ tile }: { tile: MetricTile }) {
  const palette = useMetricPalette(tile.tone);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={tile.onPress}
      style={[
        metricStyles.tile,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={[metricStyles.accentBar, { backgroundColor: palette.accent }]} />
      <View style={metricStyles.topRow}>
        <View style={[metricStyles.iconShell, { backgroundColor: palette.iconBg }]}>
          <Ionicons name={tile.icon} size={rMS(16)} color={palette.icon} />
        </View>
      </View>
      <Text style={[metricStyles.value, { color: palette.value }]} numberOfLines={1}>
        {tile.value}
      </Text>
      <Text style={[metricStyles.label, { color: palette.label }]} numberOfLines={1}>
        {tile.label}
      </Text>
      {tile.hint ? (
        <Text style={[metricStyles.hint, { color: palette.label }]} numberOfLines={1}>
          {tile.hint}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function VendorTabHub({
  store,
  businessName,
  vendorStatus,
  stats,
  insights,
  unreadChats = 0,
  isLoading,
  isRefreshing = false,
  onRefresh,
  onOpenDashboard,
  onOpenSettings,
}: VendorTabHubProps) {
  const { colors, isDark } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const workspaceMode = useWorkspaceModeStore((state) => state.mode);
  const sellOnly = workspaceMode === "sell_only";

  const pendingOrders = stats?.pendingOrders ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const outOfStockCount = stats?.outOfStockCount ?? 0;
  const storeName = store?.name?.trim() || stats?.storeName?.trim() || "My store";
  const isLive = store?.status === "active";
  const onVacation = Boolean(stats?.isOnVacation || store?.isOnVacation);

  const openOrders = useCallback(
    (tab?: string) => {
      if (sellOnly) {
        router.push({
          pathname: "/(root)/(tabs)/seller-orders" as any,
          params: tab ? { tab } : undefined,
        });
        return;
      }
      router.push({
        pathname: "/vendor/orders" as any,
        params: tab ? { tab } : undefined,
      });
    },
    [sellOnly],
  );

  const openProducts = useCallback(() => {
    if (sellOnly) {
      router.push("/(root)/(tabs)/seller-products" as any);
      return;
    }
    router.push("/vendor/products" as any);
  }, [sellOnly]);

  const openInventory = useCallback(() => {
    if (sellOnly) {
      router.push("/(root)/(tabs)/seller-inventory" as any);
      return;
    }
    router.push("/vendor/inventory" as any);
  }, [sellOnly]);

  const todayMetrics = useMemo<MetricTile[]>(
    () => [
      {
        key: "today-sales",
        label: "Sales",
        value: formatCompactSales(stats?.todaySales ?? 0, stats?.currency),
        hint: `${stats?.todayOrders ?? 0} order${(stats?.todayOrders ?? 0) === 1 ? "" : "s"}`,
        icon: "cash-outline",
        tone: "success",
        onPress: () => router.push("/vendor/analytics" as any),
      },
      {
        key: "today-orders",
        label: "Orders",
        value: String(stats?.todayOrders ?? 0),
        hint: `${stats?.completedOrders ?? 0} done`,
        icon: "bag-check-outline",
        tone: "accent",
        onPress: () => openOrders(),
      },
      {
        key: "pending",
        label: "To confirm",
        value: String(pendingOrders),
        hint: pendingOrders > 0 ? "Act now" : "Clear",
        icon: "hourglass-outline",
        tone: pendingOrders > 0 ? "warning" : "default",
        onPress: () => openOrders("new"),
      },
    ],
    [openOrders, pendingOrders, stats],
  );

  const attentionItems = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      value: string;
      onPress: () => void;
    }> = [];

    if (pendingOrders > 0) {
      items.push({
        key: "confirm",
        label: "Awaiting confirmation",
        value: String(pendingOrders),
        onPress: () => openOrders("new"),
      });
    }
    if ((stats?.processingOrders ?? 0) > 0) {
      items.push({
        key: "ship",
        label: "Awaiting shipment",
        value: String(stats?.processingOrders ?? 0),
        onPress: () => openOrders("active"),
      });
    }
    if (lowStockCount + outOfStockCount > 0) {
      items.push({
        key: "stock",
        label: outOfStockCount > 0 ? "Out of stock" : "Low stock",
        value: String(lowStockCount + outOfStockCount),
        onPress: openInventory,
      });
    }
    if (unreadChats > 0) {
      items.push({
        key: "chats",
        label: "Unread messages",
        value: String(unreadChats),
        onPress: () => router.push("/vendor/chats" as any),
      });
    }
    if (insights.operations.openReturns > 0) {
      items.push({
        key: "returns",
        label: "Open returns",
        value: String(insights.operations.openReturns),
        onPress: () => router.push("/vendor/returns" as any),
      });
    }

    return items.slice(0, 4);
  }, [
    insights.operations.openReturns,
    lowStockCount,
    openInventory,
    openOrders,
    outOfStockCount,
    pendingOrders,
    stats?.processingOrders,
    unreadChats,
  ]);

  const quickTiles = useMemo<QuickTile[]>(
    () => [
      {
        key: "add-product",
        icon: "add-circle-outline",
        label: "Add",
        onPress: () => router.push("/vendor/products/new" as any),
      },
      {
        key: "orders",
        icon: "receipt-outline",
        label: "Orders",
        badge: pendingOrders > 0 ? String(pendingOrders) : undefined,
        badgeTone: "warning",
        onPress: () => openOrders(),
      },
      {
        key: "products",
        icon: "cube-outline",
        label: "Products",
        onPress: openProducts,
      },
      {
        key: "inventory",
        icon: "layers-outline",
        label: "Stock",
        badge:
          lowStockCount + outOfStockCount > 0
            ? String(lowStockCount + outOfStockCount)
            : undefined,
        badgeTone: "warning",
        onPress: openInventory,
      },
      {
        key: "chats",
        icon: "chatbubble-ellipses-outline",
        label: "Chats",
        badge: unreadChats > 0 ? String(unreadChats) : undefined,
        badgeTone: unreadChats > 0 ? "warning" : "neutral",
        onPress: () => router.push("/vendor/chats" as any),
      },
      {
        key: "wallet",
        icon: "wallet-outline",
        label: "Wallet",
        onPress: () => router.push("/vendor/wallet" as any),
      },
    ],
    [
      lowStockCount,
      openInventory,
      openOrders,
      openProducts,
      outOfStockCount,
      pendingOrders,
      unreadChats,
    ],
  );

  const manageShortcuts = useMemo(
    () => [
      {
        key: "analytics",
        icon: "bar-chart-outline" as const,
        label: "Analytics",
        onPress: () => router.push("/vendor/analytics" as any),
      },
      {
        key: "reviews",
        icon: "star-outline" as const,
        label: "Reviews",
        onPress: () => router.push("/vendor/reviews" as any),
      },
      {
        key: "customers",
        icon: "people-outline" as const,
        label: "Customers",
        onPress: () => router.push("/vendor/customers" as any),
      },
      {
        key: "promotions",
        icon: "ticket-outline" as const,
        label: "Vouchers",
        onPress: () => router.push("/vendor/vouchers" as any),
      },
      {
        key: "campaigns",
        icon: "megaphone-outline" as const,
        label: "Campaigns",
        onPress: () => router.push("/vendor/campaigns" as any),
      },
      {
        key: "flash-sales",
        icon: "flash-outline" as const,
        label: "Flash sales",
        onPress: () => router.push("/vendor/flash-sales" as any),
      },
      {
        key: "returns",
        icon: "return-down-back-outline" as const,
        label: "Returns",
        onPress: () => router.push("/vendor/returns" as any),
      },
      {
        key: "store",
        icon: "storefront-outline" as const,
        label: "Store",
        onPress: () => router.push("/vendor/store" as any),
      },
      {
        key: "dashboard",
        icon: "grid-outline" as const,
        label: "Ops desk",
        onPress: onOpenDashboard,
      },
      {
        key: "settings",
        icon: "settings-outline" as const,
        label: "Settings",
        onPress: () =>
          onOpenSettings ? onOpenSettings() : router.push("/vendor/settings" as any),
      },
    ],
    [onOpenDashboard, onOpenSettings],
  );

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.screen }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={Boolean(isRefreshing)} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: tabBarInset,
          },
        ]}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <VendorStoreTabHero
            storeName={storeName}
            businessName={businessName}
            vendorStatus={vendorStatus}
            isLive={isLive && !onVacation}
            onOpenSettings={onOpenSettings}
          />

          {onVacation ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/vendor/store" as any)}
              style={[
                styles.vacationBanner,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : "#FEF3C7",
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="pause-circle-outline" size={rS(18)} color="#B45309" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.vacationTitle, { color: colors.text }]}>
                  Store on vacation
                </Text>
                <Text style={[styles.vacationCopy, { color: colors.textMuted }]}>
                  {store?.vacationMessage?.trim() ||
                    "Your storefront is hidden from shoppers until you turn vacation mode off."}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {attentionItems.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Needs attention</Text>
              <View style={styles.attentionChips}>
                {attentionItems.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.86}
                    onPress={item.onPress}
                    style={[
                      styles.attentionChip,
                      {
                        backgroundColor: isDark ? colors.surfaceSubtle : "#FFF7ED",
                        borderColor: isDark ? colors.border : "#FED7AA",
                      },
                    ]}
                  >
                    <Text style={[styles.attentionValue, { color: "#B45309" }]}>{item.value}</Text>
                    <Text style={[styles.attentionLabel, { color: colors.text }]} numberOfLines={2}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <VendorNotificationsPrompt />

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

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today</Text>
            <View style={styles.metricRow}>
              {todayMetrics.map((tile) => (
                <VendorStoreMetricTile key={tile.key} tile={tile} />
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick actions</Text>
            <View style={styles.quickIconGrid}>
              {quickTiles.map((tile) => (
                <TouchableOpacity
                  key={tile.key}
                  activeOpacity={0.86}
                  onPress={tile.onPress}
                  style={styles.quickIconItem}
                >
                  <View
                    style={[
                      styles.quickIconShell,
                      {
                        backgroundColor: isDark ? colors.surfaceSubtle : colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <Ionicons name={tile.icon} size={rMS(22)} color={colors.primary} />
                    {tile.badge ? (
                      <View
                        style={[
                          styles.quickBadge,
                          {
                            backgroundColor:
                              tile.badgeTone === "warning" ? "#F59E0B" : colors.text,
                          },
                        ]}
                      >
                        <Text style={[styles.quickBadgeText, { color: colors.onPrimary }]}>
                          {tile.badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.quickIconLabel, { color: colors.text }]} numberOfLines={1}>
                    {tile.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage</Text>
            <View style={styles.manageGrid}>
              {manageShortcuts.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.86}
                  onPress={item.onPress}
                  style={[
                    styles.manageItem,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={rMS(18)} color={colors.primary} />
                  <Text style={[styles.manageLabel, { color: colors.text }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    paddingTop: rV(8),
  },
  content: {
    width: "100%",
    alignSelf: "center",
    gap: SECTION_GAP,
  },
  loaderWrap: {
    minHeight: rV(200),
    justifyContent: "center",
  },
  vacationBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
    padding: rS(14),
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
  },
  vacationTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  vacationCopy: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    marginTop: rV(2),
  },
  sectionBlock: {
    gap: rV(10),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(20),
  },
  attentionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  attentionChip: {
    width: "48%",
    flexGrow: 1,
    minWidth: rS(140),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    gap: rV(4),
  },
  attentionValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  attentionLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(16),
  },
  metricRow: {
    flexDirection: "row",
    gap: rS(8),
  },
  quickIconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: rV(14),
  },
  quickIconItem: {
    width: "31%",
    alignItems: "center",
    gap: rV(6),
  },
  quickIconShell: {
    width: rMS(52),
    height: rMS(52),
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  quickBadge: {
    position: "absolute",
    top: -rS(4),
    right: -rS(4),
    minWidth: rMS(18),
    height: rMS(18),
    borderRadius: rMS(9),
    paddingHorizontal: rS(4),
    alignItems: "center",
    justifyContent: "center",
  },
  quickBadgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10),
  },
  quickIconLabel: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
  },
  manageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  manageItem: {
    width: "48%",
    flexGrow: 1,
    minWidth: rS(140),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(12),
    paddingVertical: rV(14),
  },
  manageLabel: {
    flex: 1,
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
});

const heroStyles = StyleSheet.create({
  shell: {
    borderRadius: rMS(22),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    gap: rV(14),
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
  },
  greetingBlock: {
    flex: 1,
    minWidth: 0,
    gap: rV(4),
  },
  greeting: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(18),
  },
  storeName: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
    letterSpacing: -0.3,
    lineHeight: rMS(30),
  },
  businessName: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(18),
  },
  settingsButton: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    borderRadius: rMS(999),
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  badgeText: {
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
  },
  liveDot: {
    width: rS(7),
    height: rS(7),
    borderRadius: rS(4),
    backgroundColor: "#22C55E",
  },
});

const metricStyles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(10),
    paddingVertical: rV(12),
    overflow: "hidden",
    gap: rV(4),
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: rS(3),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconShell: {
    width: rMS(28),
    height: rMS(28),
    borderRadius: rMS(9),
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    lineHeight: rMS(20),
  },
  label: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    lineHeight: rMS(14),
  },
  hint: {
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    lineHeight: rMS(13),
  },
});

const promptStyles = StyleSheet.create({
  shell: {
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  iconShell: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(12),
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: rV(2),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
});
