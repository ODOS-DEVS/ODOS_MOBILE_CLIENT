import VendorAnalyticsPanel from "@/components/vendor/VendorAnalyticsPanel";
import { AccountEmptyState } from "@/components/account/AccountUi";
import {
  formatVendorCurrency,
  QuickActionCard,
  VendorFinanceCard,
  VendorFocusCard,
  VendorHelpCard,
  VendorHeroCard,
  VendorScreenShell,
  VendorSectionHeader,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import type { VendorDashboardStats } from "@/types/vendor";
import { buildVendorDashboardStatsFallback } from "@/utils/vendorAnalytics";
import { rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, isTablet } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session, vendorProfile, vendorStatus } =
    useRequireVendor();
  const { user } = useVendorSession();
  const { fetchStoreProfile, fetchOrders, orders, storeProfile } = useStoreStore();
  const { error, fetchVendorDashboard, refreshVendorState, vendorDashboardStats } =
    useVendorStore();
  const { insights } = useVendorAnalytics(session, hasVendorAccess);

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void refreshVendorState(session);
    void fetchVendorDashboard(session);
    void fetchStoreProfile(session);
    void fetchOrders(session);
  }, [
    fetchOrders,
    fetchStoreProfile,
    fetchVendorDashboard,
    hasVendorAccess,
    refreshVendorState,
    session,
  ]);

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

  const storeLocation = useMemo(() => {
    const locationParts = [
      storeProfile?.location,
      [storeProfile?.city, storeProfile?.region].filter(Boolean).join(", "),
    ].filter((value) => typeof value === "string" && value.trim().length > 0);

    return locationParts[0] ?? "Store location pending";
  }, [storeProfile?.city, storeProfile?.location, storeProfile?.region]);

  const focusState = useMemo(() => {
    if (!resolvedDashboardStats) {
      return null;
    }

    const { currency } = resolvedDashboardStats;

    if (resolvedDashboardStats.pendingOrders > 0) {
      return {
        eyebrow: "Priority now",
        title: "Fulfil your pending orders",
        body: `${resolvedDashboardStats.pendingOrders} order${
          resolvedDashboardStats.pendingOrders === 1 ? "" : "s"
        } still need attention before they move closer to delivery.`,
        actionLabel: "Open orders",
        onPress: () => router.push("/vendor/orders" as any),
      };
    }

    if (resolvedDashboardStats.availableBalance > 0) {
      return {
        eyebrow: "Money ready",
        title: "Move settled funds into payout review",
        body: `${formatVendorCurrency(
          resolvedDashboardStats.availableBalance,
          currency,
        )} is available in your wallet right now.`,
        actionLabel: "Open wallet",
        onPress: () => router.push("/vendor/wallet" as any),
      };
    }

    const inactiveCount =
      resolvedDashboardStats.totalProducts - resolvedDashboardStats.activeProducts;

    if (inactiveCount > 0) {
      return {
        eyebrow: "Catalog growth",
        title: "Bring more products live",
        body: `${inactiveCount} product${inactiveCount === 1 ? "" : "s"} are not active yet.`,
        actionLabel: "Review products",
        onPress: () => router.push("/vendor/products" as any),
      };
    }

    return {
      eyebrow: "Store health",
      title: "Keep your storefront fresh",
      body: "Update your store profile, respond to shoppers, and run new promotions to keep momentum going.",
      actionLabel: "Edit store profile",
      onPress: () => router.push("/vendor/store" as any),
    };
  }, [resolvedDashboardStats]);

  const businessActions = useMemo(
    () => [
      {
        icon: "bar-chart-outline" as const,
        title: "Analytics",
        subtitle: "Trends, top products, and fulfillment health.",
        tag: "Insights",
        highlight: true,
        onPress: () => router.push("/vendor/analytics" as any),
      },
      {
        icon: "wallet-outline" as const,
        title: "Wallet",
        subtitle: "Review settled earnings, payout details, and withdrawal requests.",
        tag: "Finance",
        highlight: true,
        onPress: () => router.push("/vendor/wallet" as any),
      },
      {
        icon: "receipt-outline" as const,
        title: "Orders",
        subtitle: "Track fulfillment and move every order through delivery smoothly.",
        tag: "Operations",
        onPress: () => router.push("/vendor/orders" as any),
      },
      {
        icon: "add-circle-outline" as const,
        title: "Add Product",
        subtitle: "Create a new product with images, stock, and return settings.",
        tag: "Catalog",
        onPress: () => router.push("/vendor/products/new" as any),
      },
      {
        icon: "pricetags-outline" as const,
        title: "My Products",
        subtitle: "Review live, pending, and hidden products in your catalog.",
        tag: "Catalog",
        onPress: () => router.push("/vendor/products" as any),
      },
      {
        icon: "ticket-outline" as const,
        title: "Promotions",
        subtitle: "Create vouchers and offers shoppers can claim or receive.",
        tag: "Growth",
        onPress: () => router.push("/vendor/vouchers" as any),
      },
      {
        icon: "return-down-back-outline" as const,
        title: "Returns",
        subtitle: insights.operations.openReturns
          ? `${insights.operations.openReturns} open return request${insights.operations.openReturns === 1 ? "" : "s"}`
          : "Monitor shopper return and refund requests.",
        tag: "Operations",
        onPress: () => router.push("/vendor/returns" as any),
      },
    ],
    [insights.operations.openReturns],
  );

  const relationshipActions = useMemo(
    () => [
      {
        icon: "chatbubble-ellipses-outline" as const,
        title: "Shopper Chats",
        subtitle: "Reply quickly to product questions and buying conversations.",
        tag: "Customers",
        onPress: () => router.push("/vendor/chats" as any),
      },
      {
        icon: "storefront-outline" as const,
        title: "Store Profile",
        subtitle: "Update the store details and visuals customers see first.",
        tag: "Brand",
        onPress: () => router.push("/vendor/store" as any),
      },
      {
        icon: "headset-outline" as const,
        title: "Admin Support",
        subtitle: "Escalate payout, approval, or store issues to the ODOS team.",
        tag: "Support",
        highlight: true,
        onPress: () =>
          router.push({
            pathname: "/screens/support/chat",
            params: {
              subject: "Vendor admin support",
              fallback: "/vendor/dashboard",
            },
          }),
      },
    ],
    [],
  );

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell title="Vendor Dashboard" loading loadingLabel="Preparing your vendor dashboard..." />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (!resolvedDashboardStats) {
    return (
      <VendorScreenShell title="Vendor Dashboard">
        <View style={styles.emptyWrap}>
          <AccountEmptyState
            icon="analytics-outline"
            title="Dashboard not ready yet"
            message="Your vendor profile is approved, but we could not load dashboard data yet. Open your store profile or pull to refresh on the Store tab."
            actionLabel="Open Store Profile"
            onAction={() => router.push("/vendor/store" as any)}
          />
        </View>
      </VendorScreenShell>
    );
  }

  const currency = resolvedDashboardStats.currency;

  return (
    <VendorScreenShell title="Vendor Dashboard">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.content,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(14) }]}>
          <VendorHeroCard
            storeName={storeProfile?.name || resolvedDashboardStats.storeName}
            businessName={vendorProfile?.businessName || user?.full_name || "ODOS Vendor"}
            status={vendorStatus}
            category={storeProfile?.category || "Store"}
            location={storeLocation}
            totalSalesLabel={formatVendorCurrency(
              resolvedDashboardStats.totalSales,
              currency,
            )}
            completedOrders={resolvedDashboardStats.completedOrders}
            error={error}
          />

          {focusState ? <VendorFocusCard {...focusState} /> : null}

          <VendorAnalyticsPanel
            insights={insights}
            variant="compact"
            onPress={() => router.push("/vendor/analytics" as any)}
          />

          <VendorFinanceCard
            balanceLabel={formatVendorCurrency(
              resolvedDashboardStats.availableBalance,
              currency,
            )}
            body="This balance is what ODOS has already settled for withdrawal after delivered orders are processed."
            metrics={[
              {
                label: "Pending withdrawals",
                value: formatVendorCurrency(
                  resolvedDashboardStats.pendingWithdrawalBalance,
                  currency,
                ),
              },
              {
                label: "Lifetime earnings",
                value: formatVendorCurrency(
                  resolvedDashboardStats.lifetimeEarnings,
                  currency,
                ),
              },
            ]}
            onOpenWallet={() => router.push("/vendor/wallet" as any)}
            onReviewSettlements={() => router.push("/vendor/orders" as any)}
          />

          <View style={vendorStyles.sectionBlock}>
            <VendorSectionHeader
              eyebrow="Execution"
              title="Run your store"
              description="Jump into the tools you use most."
            />
            <View style={[vendorStyles.actionsGrid, isTablet && styles.actionsGridTablet]}>
              {businessActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </View>
          </View>

          <View style={vendorStyles.sectionBlock}>
            <VendorSectionHeader
              eyebrow="Relationships"
              title="Support and storefront"
              description="Keep your store profile sharp and stay responsive to both shoppers and ODOS."
            />
            <View style={[vendorStyles.actionsGrid, isTablet && styles.actionsGridTablet]}>
              {relationshipActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </View>
          </View>

          <VendorHelpCard
            eyebrow="Need help with payouts?"
            title="Use Admin Support when money needs review"
            body="Reach out if a withdrawal needs follow-up, a settlement looks off, or you want ODOS to investigate a payout issue tied to an order."
          />
        </View>
      </ScrollView>
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  actionsGridTablet: {
    justifyContent: "space-between",
  },
});
