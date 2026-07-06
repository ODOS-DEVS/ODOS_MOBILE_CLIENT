import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorAnalyticsPanel from "@/components/vendor/VendorAnalyticsPanel";
import {
  QuickActionCard,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import type { VendorDashboardStats } from "@/types/vendor";
import { buildVendorDashboardStatsFallback } from "@/utils/vendorAnalytics";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session, vendorProfile } = useRequireVendor();
  const { orders, storeProfile } = useStoreStore();
  const { vendorDashboardStats } = useVendorStore();
  const { insights, isLoading, refreshAnalytics } = useVendorAnalytics(
    session,
    hasVendorAccess,
  );

  const resolvedDashboardStats = useMemo<VendorDashboardStats | null>(() => {
    if (vendorDashboardStats) {
      return vendorDashboardStats;
    }

    if (orders.length === 0 && !storeProfile?.name && !vendorProfile?.storeName) {
      return null;
    }

    return buildVendorDashboardStatsFallback(
      orders,
      storeProfile?.name || vendorProfile?.storeName,
    );
  }, [orders, storeProfile?.name, vendorDashboardStats, vendorProfile?.storeName]);

  const shortcuts = useMemo(
    () => [
      {
        icon: "receipt-outline" as const,
        title: "Orders",
        subtitle: `${insights.operations.pending} pending · ${insights.operations.delivered} delivered`,
        tag: "Ops",
        onPress: () => router.push("/vendor/orders" as any),
      },
      {
        icon: "wallet-outline" as const,
        title: "Wallet",
        subtitle: "Settled earnings and withdrawals",
        tag: "Finance",
        highlight: true,
        onPress: () => router.push("/vendor/wallet" as any),
      },
      {
        icon: "return-down-back-outline" as const,
        title: "Returns",
        subtitle:
          insights.operations.openReturns > 0
            ? `${insights.operations.openReturns} open request${insights.operations.openReturns === 1 ? "" : "s"}`
            : "No open return requests",
        tag: "Ops",
        onPress: () => router.push("/vendor/returns" as any),
      },
      {
        icon: "cube-outline" as const,
        title: "Products",
        subtitle: `${insights.catalog.activeProducts} live listings`,
        tag: "Catalog",
        onPress: () => router.push("/vendor/products" as any),
      },
    ],
    [insights],
  );

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell title="Analytics" loading loadingLabel="Loading analytics..." />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  const hasData =
    insights.period.week.orders > 0 ||
    insights.period.month.orders > 0 ||
    insights.operations.delivered > 0 ||
    Boolean(resolvedDashboardStats);

  return (
    <VendorScreenShell title="Analytics">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => void refreshAnalytics()} />
        }
        contentContainerStyle={[
          vendorStyles.content,
          {
            paddingBottom: insets.bottom + rV(28),
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <View style={styles.wrap}>
          <VendorAnalyticsPanel insights={insights} variant="full" />

          {!hasData ? (
            <AccountEmptyState
              icon="bar-chart-outline"
              title="Your story starts here"
              message="Once shoppers place orders, this screen tracks sales momentum, fulfillment, and your best products."
              actionLabel="Add a product"
              onAction={() => router.push("/vendor/products/new" as any)}
            />
          ) : null}

          <View style={vendorStyles.sectionBlock}>
            <View style={styles.actionsGrid}>
              {shortcuts.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(14),
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rV(10),
  },
});
