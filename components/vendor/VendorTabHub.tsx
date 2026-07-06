import {
  AccountEmptyState,
  AccountListCard,
} from "@/components/account/AccountUi";
import VendorAnalyticsPanel from "@/components/vendor/VendorAnalyticsPanel";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import VendorStoreActionRow from "@/components/vendor/VendorStoreActionRow";
import VendorStorefrontPreview from "@/components/vendor/VendorStorefrontPreview";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import type { ManagedStoreProfile } from "@/types/store";
import type { VendorAnalyticsInsights, VendorDashboardStats, VendorStatus } from "@/types/vendor";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
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
  subtitle: string;
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

function useMetricPalette(tone: MetricTone = "default") {
  const { colors, isDark } = useTheme();

  return useMemo(() => {
    if (tone === "warning") {
      return {
        bg: isDark ? "#422006" : "#FFF7ED",
        border: isDark ? "#78350F" : "#FED7AA",
        accent: "#F59E0B",
        value: isDark ? "#FCD34D" : "#B45309",
        label: isDark ? "#FDE68A" : "#92400E",
        iconBg: isDark ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.14)",
        icon: "#F59E0B",
      };
    }
    if (tone === "success") {
      return {
        bg: isDark ? "#14532D" : "#ECFDF3",
        border: isDark ? "#166534" : "#BBF7D0",
        accent: "#22C55E",
        value: isDark ? "#86EFAC" : "#166534",
        label: isDark ? "#BBF7D0" : "#15803D",
        iconBg: isDark ? "rgba(34, 197, 94, 0.18)" : "rgba(34, 197, 94, 0.12)",
        icon: "#22C55E",
      };
    }
    if (tone === "accent") {
      return {
        bg: isDark ? "#1E1B4B" : "#EEF2FF",
        border: isDark ? "#4338CA" : "#C7D2FE",
        accent: colors.primary,
        value: isDark ? "#C7D2FE" : colors.primary,
        label: isDark ? colors.textMuted : "#4338CA",
        iconBg: isDark ? colors.pill : "rgba(99, 102, 241, 0.12)",
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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={sectionStyles.wrap}>
      <Text style={[sectionStyles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[sectionStyles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
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
    vendorStatus === "approved" ? "Approved vendor" : "Vendor account";

  return (
    <LinearGradient colors={gradientColors} style={heroStyles.shell}>
      <View style={heroStyles.topRow}>
        <View style={heroStyles.greetingBlock}>
          <Text style={[heroStyles.greeting, { color: colors.textMuted }]}>
            {getGreeting()}
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
    Boolean(user?.allow_notifications) && !user?.vendor_order_notifications;

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

function VendorStorePriorityBanner({
  pendingOrders,
  onPress,
}: {
  pendingOrders: number;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();

  if (pendingOrders <= 0) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        priorityStyles.shell,
        {
          backgroundColor: isDark ? "#422006" : "#FFFBEB",
          borderColor: isDark ? "#78350F" : "#FDE68A",
        },
      ]}
    >
      <View style={[priorityStyles.iconShell, { backgroundColor: isDark ? "#78350F" : "#FEF3C7" }]}>
        <Ionicons name="alert-circle" size={rMS(20)} color={isDark ? "#FCD34D" : "#D97706"} />
      </View>
      <View style={priorityStyles.copy}>
        <Text style={[priorityStyles.title, { color: isDark ? "#FCD34D" : "#92400E" }]}>
          {pendingOrders} pending order{pendingOrders === 1 ? "" : "s"} need attention
        </Text>
        <Text style={[priorityStyles.body, { color: isDark ? "#FDE68A" : "#B45309" }]}>
          Fulfill orders before they stall in delivery.
        </Text>
      </View>
      <View style={priorityStyles.action}>
        <Text style={[priorityStyles.actionText, { color: colors.primary }]}>Open</Text>
        <Ionicons name="chevron-forward" size={rMS(16)} color={colors.primary} />
      </View>
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
        <Ionicons name="chevron-forward" size={rMS(14)} color={palette.label} />
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

function VendorStoreQuickTile({ tile }: { tile: QuickTile }) {
  const { colors, isDark } = useTheme();

  const badgeColors =
    tile.badgeTone === "warning"
      ? { bg: isDark ? "#422006" : "#FEF3C7", text: isDark ? "#FCD34D" : "#92400E" }
      : tile.badgeTone === "success"
        ? { bg: isDark ? "#14532D" : "#DCFCE7", text: isDark ? "#86EFAC" : "#166534" }
        : { bg: isDark ? colors.pill : "#F3F4F6", text: colors.textMuted };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={tile.onPress}
      style={[
        quickStyles.tile,
        {
          backgroundColor: isDark ? colors.surfaceSubtle : colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={quickStyles.header}>
        <View style={[quickStyles.iconShell, { backgroundColor: isDark ? colors.pill : "#EEF2FF" }]}>
          <Ionicons name={tile.icon} size={rMS(18)} color={colors.primary} />
        </View>
        {tile.badge ? (
          <View style={[quickStyles.badge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[quickStyles.badgeText, { color: badgeColors.text }]}>{tile.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[quickStyles.label, { color: colors.text }]} numberOfLines={1}>
        {tile.label}
      </Text>
      <Text style={[quickStyles.subtitle, { color: colors.textMuted }]} numberOfLines={2}>
        {tile.subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function VendorStoreDashboardBanner({
  pendingOrders,
  onPress,
}: {
  pendingOrders: number;
  onPress: () => void;
}) {
  const { isDark } = useTheme();
  const gradientColors = isDark
    ? (["#312E81", "#1E1B4B", "#0F172A"] as const)
    : (["#4338CA", "#4F46E5", "#6366F1"] as const);

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
      <LinearGradient colors={gradientColors} style={dashboardStyles.shell}>
        <View style={dashboardStyles.copy}>
          <Text style={dashboardStyles.eyebrow}>Full control center</Text>
          <View style={dashboardStyles.titleRow}>
            <Text style={dashboardStyles.title}>Open vendor dashboard</Text>
            {pendingOrders > 0 ? (
              <View style={dashboardStyles.badge}>
                <Text style={dashboardStyles.badgeText}>{pendingOrders}</Text>
              </View>
            ) : null}
          </View>
          <Text style={dashboardStyles.subtitle}>
            Analytics, chats, promotions, finance, and advanced store controls.
          </Text>
        </View>
        <View style={dashboardStyles.arrowShell}>
          <Ionicons name="grid" size={rMS(22)} color="#FFFFFF" />
        </View>
      </LinearGradient>
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
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { contentMaxWidth, horizontalPadding } = useResponsive();

  const pendingOrders = stats?.pendingOrders ?? 0;
  const storeName = store?.name?.trim() || stats?.storeName?.trim() || "My store";
  const isLive = store?.status === "active";

  const quickTiles = useMemo<QuickTile[]>(
    () => [
      {
        key: "orders",
        icon: "receipt-outline",
        label: "Orders",
        subtitle: "Fulfillment and delivery tracking.",
        badge: pendingOrders > 0 ? String(pendingOrders) : undefined,
        badgeTone: "warning",
        onPress: () => router.push("/vendor/orders" as any),
      },
      {
        key: "products",
        icon: "cube-outline",
        label: "Products",
        subtitle: stats
          ? `${stats.activeProducts} active listing${stats.activeProducts === 1 ? "" : "s"}`
          : "Manage catalog and stock.",
        onPress: () => router.push("/vendor/products" as any),
      },
      {
        key: "chats",
        icon: "chatbubble-ellipses-outline",
        label: "Chats",
        subtitle: "Reply to shopper questions quickly.",
        badge: unreadChats > 0 ? String(unreadChats) : undefined,
        badgeTone: unreadChats > 0 ? "warning" : "neutral",
        onPress: () => router.push("/vendor/chats" as any),
      },
      {
        key: "wallet",
        icon: "wallet-outline",
        label: "Wallet",
        subtitle: stats
          ? `${formatCompactSales(stats.availableBalance, stats.currency)} available`
          : "Payouts and balance.",
        onPress: () => router.push("/vendor/wallet" as any),
      },
    ],
    [pendingOrders, stats, unreadChats],
  );

  const moreShortcuts = useMemo(
    () => [
      {
        key: "analytics",
        icon: "bar-chart-outline" as const,
        label: "Analytics",
        subtitle: "Full performance view with trends and rankings.",
        onPress: () => router.push("/vendor/analytics" as any),
      },
      {
        key: "dashboard",
        icon: "grid-outline" as const,
        label: "Dashboard",
        subtitle: "Finance, actions, and store command center.",
        onPress: onOpenDashboard,
      },
      {
        key: "profile",
        icon: "color-palette-outline" as const,
        label: "Store profile",
        subtitle: "Banner, logo, description, and contact details.",
        onPress: () => router.push("/vendor/store" as any),
      },
      {
        key: "add-product",
        icon: "add-circle-outline" as const,
        label: "Add product",
        subtitle: "Create a new listing with images and stock.",
        onPress: () => router.push("/vendor/products/new" as any),
      },
      {
        key: "flash-sales",
        icon: "flash-outline" as const,
        label: "Flash sales",
        subtitle: "Nominate products for featured events.",
        onPress: () => router.push("/vendor/flash-sales" as any),
      },
      {
        key: "returns",
        icon: "return-down-back-outline" as const,
        label: "Returns inbox",
        subtitle: "Read-only view of shopper return requests.",
        onPress: () => router.push("/vendor/returns" as any),
      },
      {
        key: "promotions",
        icon: "ticket-outline" as const,
        label: "Promotions",
        subtitle: "Vouchers and offers for shoppers.",
        onPress: () => router.push("/vendor/vouchers" as any),
      },
      {
        key: "wallet",
        icon: "wallet-outline" as const,
        label: "Wallet",
        subtitle: stats
          ? `${formatCompactSales(stats.availableBalance, stats.currency)} available`
          : "Payouts and balance.",
        onPress: () => router.push("/vendor/wallet" as any),
      },
      {
        key: "settings",
        icon: "settings-outline" as const,
        label: "Store settings",
        subtitle: "Preferences, payouts, and account controls.",
        onPress: () =>
          onOpenSettings ? onOpenSettings() : router.push("/vendor/settings" as any),
        isLast: true,
      },
    ],
    [onOpenDashboard, onOpenSettings, stats],
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

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.screen }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
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
            isLive={isLive}
            onOpenSettings={onOpenSettings}
          />

          {pendingOrders > 0 ? (
            <VendorStorePriorityBanner
              pendingOrders={pendingOrders}
              onPress={() =>
                router.push({
                  pathname: "/vendor/orders" as any,
                  params: { tab: "new" },
                })
              }
            />
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

          <View style={styles.sections}>
            {store ? (
              <VendorStorefrontPreview
                store={store}
                businessName={businessName}
                onPress={openStorefrontPreview}
                onEditPress={() => router.push("/vendor/store" as any)}
              />
            ) : null}

            <VendorAnalyticsPanel
              insights={insights}
              variant="compact"
              onPress={() => router.push("/vendor/analytics" as any)}
            />

            <View style={styles.sectionBlock}>
              <SectionHeader
                title="Manage store"
                description="Daily tools for running your business on ODOS."
              />
              <View style={styles.quickGrid}>
                {quickTiles.map((tile) => (
                  <VendorStoreQuickTile key={tile.key} tile={tile} />
                ))}
              </View>
            </View>

            <AccountListCard style={styles.moreCard}>
              <View style={[styles.moreHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.moreTitle, { color: colors.text }]}>More tools</Text>
                <Text style={[styles.moreDescription, { color: colors.textMuted }]}>
                  Profile, catalog, finance, and settings.
                </Text>
              </View>
              <View style={styles.moreList}>
                {moreShortcuts.map((item) => (
                  <VendorStoreActionRow
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    subtitle={item.subtitle}
                    onPress={item.onPress}
                    isLast={Boolean(item.isLast)}
                  />
                ))}
              </View>
            </AccountListCard>
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
  sections: {
    gap: SECTION_GAP,
  },
  sectionBlock: {
    gap: rV(10),
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  moreCard: {
    padding: 0,
    overflow: "hidden",
  },
  moreHeader: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(14),
    gap: rV(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  moreTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    lineHeight: rMS(20),
  },
  moreDescription: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  moreList: {
    paddingHorizontal: rS(16),
  },
});

const sectionStyles = StyleSheet.create({
  wrap: {
    gap: rV(4),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    lineHeight: rMS(21),
  },
  description: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
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
    gap: rS(5),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: rMS(999),
  },
  badgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.25,
  },
  liveDot: {
    width: rS(6),
    height: rS(6),
    borderRadius: rS(3),
    backgroundColor: "#22C55E",
  },
});

const priorityStyles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
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
    fontSize: rMS(13.5),
    lineHeight: rMS(18),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(2),
  },
  actionText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
  },
});

const metricStyles = StyleSheet.create({
  tile: {
    width: "48%",
    flexGrow: 1,
    minWidth: rS(148),
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    overflow: "hidden",
    gap: rV(6),
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
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    lineHeight: rMS(24),
  },
  label: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    lineHeight: rMS(16),
  },
  hint: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    lineHeight: rMS(15),
  },
});

const quickStyles = StyleSheet.create({
  tile: {
    width: "48%",
    flexGrow: 1,
    minWidth: rS(148),
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    gap: rV(8),
    minHeight: rV(118),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconShell: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(12),
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: rS(8),
    paddingVertical: rV(2),
    borderRadius: rMS(999),
  },
  badgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10),
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    lineHeight: rMS(18),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
});

const dashboardStyles = StyleSheet.create({
  shell: {
    borderRadius: rMS(20),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(14),
    overflow: "hidden",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: rV(4),
  },
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.45,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  title: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    lineHeight: rMS(22),
    color: "#FFFFFF",
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "rgba(255,255,255,0.82)",
  },
  badge: {
    minWidth: rS(22),
    height: rS(22),
    borderRadius: rS(11),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(6),
    backgroundColor: "#FCD34D",
  },
  badgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    color: "#78350F",
  },
  arrowShell: {
    width: rMS(48),
    height: rMS(48),
    borderRadius: rMS(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});

const promptStyles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconShell: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(13),
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: rV(3),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    lineHeight: rMS(18),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
});
