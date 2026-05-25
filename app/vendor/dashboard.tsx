import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountEmptyState,
  formatVendorCurrency,
  QuickActionCard,
  StatCard,
  VendorFinanceCard,
  VendorFocusCard,
  VendorHelpCard,
  VendorHeroCard,
  VendorScreenShell,
  VendorSectionHeader,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
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
  const { fetchStoreProfile, storeProfile } = useStoreStore();
  const { error, fetchVendorDashboard, refreshVendorState, vendorDashboardStats } =
    useVendorStore();

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void refreshVendorState(session);
    void fetchVendorDashboard(session);
    void fetchStoreProfile(session);
  }, [
    fetchStoreProfile,
    fetchVendorDashboard,
    hasVendorAccess,
    refreshVendorState,
    session,
  ]);

  const storeLocation = useMemo(() => {
    const locationParts = [
      storeProfile?.location,
      [storeProfile?.city, storeProfile?.region].filter(Boolean).join(", "),
    ].filter((value) => typeof value === "string" && value.trim().length > 0);

    return locationParts[0] ?? "Store location pending";
  }, [storeProfile?.city, storeProfile?.location, storeProfile?.region]);

  const focusState = useMemo(() => {
    if (!vendorDashboardStats) {
      return null;
    }

    const { currency } = vendorDashboardStats;

    if (vendorDashboardStats.pendingOrders > 0) {
      return {
        eyebrow: "Priority now",
        title: "Fulfil your pending orders",
        body: `${vendorDashboardStats.pendingOrders} order${
          vendorDashboardStats.pendingOrders === 1 ? "" : "s"
        } still need attention before they move closer to delivery.`,
        actionLabel: "Open orders",
        onPress: () => router.push("/vendor/orders" as any),
      };
    }

    if (vendorDashboardStats.availableBalance > 0) {
      return {
        eyebrow: "Money ready",
        title: "Move settled funds into payout review",
        body: `${formatVendorCurrency(
          vendorDashboardStats.availableBalance,
          currency,
        )} is available in your wallet right now.`,
        actionLabel: "Open wallet",
        onPress: () => router.push("/vendor/wallet" as any),
      };
    }

    const inactiveCount =
      vendorDashboardStats.totalProducts - vendorDashboardStats.activeProducts;

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
  }, [vendorDashboardStats]);

  const businessActions = useMemo(
    () => [
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
    ],
    [],
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

  if (!vendorDashboardStats) {
    return (
      <VendorScreenShell title="Vendor Dashboard">
        <View style={styles.emptyWrap}>
          <AccountEmptyState
            icon="analytics-outline"
            title="Dashboard not ready yet"
            message="Your vendor profile is approved, but the dashboard data is still being prepared. Check your store profile in the meantime."
            actionLabel="Open Store Profile"
            onAction={() => router.push("/vendor/store" as any)}
          />
        </View>
      </VendorScreenShell>
    );
  }

  const currency = vendorDashboardStats.currency;

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
            storeName={storeProfile?.name || vendorDashboardStats.storeName}
            businessName={vendorProfile?.businessName || user?.full_name || "ODOS Vendor"}
            status={vendorStatus}
            category={storeProfile?.category || "Store"}
            location={storeLocation}
            totalSalesLabel={formatVendorCurrency(
              vendorDashboardStats.totalSales,
              currency,
            )}
            completedOrders={vendorDashboardStats.completedOrders}
            error={error}
          />

          {focusState ? <VendorFocusCard {...focusState} /> : null}

          <VendorFinanceCard
            balanceLabel={formatVendorCurrency(
              vendorDashboardStats.availableBalance,
              currency,
            )}
            body="This balance is what ODOS has already settled for withdrawal after delivered orders and commission deductions."
            metrics={[
              {
                label: "Pending withdrawals",
                value: formatVendorCurrency(
                  vendorDashboardStats.pendingWithdrawalBalance,
                  currency,
                ),
              },
              {
                label: "Lifetime earnings",
                value: formatVendorCurrency(
                  vendorDashboardStats.lifetimeEarnings,
                  currency,
                ),
              },
              {
                label: "ODOS commission",
                value: formatVendorCurrency(
                  vendorDashboardStats.totalCommission,
                  currency,
                ),
              },
            ]}
            onOpenWallet={() => router.push("/vendor/wallet" as any)}
            onReviewSettlements={() => router.push("/vendor/orders" as any)}
          />

          <View style={vendorStyles.sectionBlock}>
            <VendorSectionHeader
              eyebrow="Performance"
              title="Operations snapshot"
              description="A quick read on your catalog, order flow, and what is already working."
            />
            <View style={vendorStyles.statsRow}>
              <StatCard
                label="Total Products"
                value={String(vendorDashboardStats.totalProducts)}
                hint="All products attached to your store"
                tone="accent"
              />
              <StatCard
                label="Active Products"
                value={String(vendorDashboardStats.activeProducts)}
                hint="Live products visible to shoppers"
                tone="success"
              />
            </View>
            <View style={vendorStyles.statsRow}>
              <StatCard
                label="Pending Orders"
                value={String(vendorDashboardStats.pendingOrders)}
                hint="Orders still moving through fulfillment"
                tone="warning"
              />
              <StatCard
                label="Completed Orders"
                value={String(vendorDashboardStats.completedOrders)}
                hint="Delivered orders recorded by the app"
                tone="default"
              />
            </View>
          </View>

          <View style={vendorStyles.sectionBlock}>
            <VendorSectionHeader
              eyebrow="Execution"
              title="Run your store"
              description="The core actions you will use most often to manage sales and catalog growth."
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
