import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { QuickActionCard } from "@/components/vendor/QuickActionCard";
import { StatCard } from "@/components/vendor/StatCard";
import { StatusBadge } from "@/components/vendor/StatusBadge";
import { VendorEmptyState } from "@/components/vendor/VendorEmptyState";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatCurrency(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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
        body: `${formatCurrency(
          vendorDashboardStats.availableBalance,
          vendorDashboardStats.currency,
        )} is available in your wallet right now.`,
        actionLabel: "Open wallet",
        onPress: () => router.push("/vendor/wallet" as any),
      };
    }

    if (vendorDashboardStats.activeProducts < vendorDashboardStats.totalProducts) {
      return {
        eyebrow: "Catalog growth",
        title: "Bring more products live",
        body: `${vendorDashboardStats.totalProducts - vendorDashboardStats.activeProducts} product${
          vendorDashboardStats.totalProducts - vendorDashboardStats.activeProducts === 1
            ? ""
            : "s"
        } are not active yet.`,
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
      <View style={styles.screen}>
        <ProfileHeader title="Vendor Dashboard" />
        <ScreenLoader label="Preparing your vendor dashboard..." />
      </View>
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (!vendorDashboardStats) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Vendor Dashboard" />
        <View style={styles.innerWrap}>
          <VendorEmptyState
            icon="analytics-outline"
            title="Dashboard not ready yet"
            message="Your vendor profile is approved, but the dashboard data is still being prepared. Check your store profile in the meantime."
            actionLabel="Open Store Profile"
            onAction={() => router.push("/vendor/store" as any)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Vendor Dashboard" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
      >
        <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroTextWrap}>
                <Text style={styles.overline}>Store overview</Text>
                <Text style={styles.heroTitle}>
                  {storeProfile?.name || vendorDashboardStats.storeName}
                </Text>
                <Text style={styles.heroBody}>
                  {vendorProfile?.businessName || user?.full_name || "ODOS Vendor"}
                </Text>
              </View>
              <StatusBadge status={vendorStatus} />
            </View>
            <View style={styles.heroPillsRow}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>
                  {storeProfile?.category || "Store"}
                </Text>
              </View>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>{storeLocation}</Text>
              </View>
            </View>
            <View style={styles.heroMetricsRow}>
              <View style={styles.heroMetricChip}>
                <Text style={styles.heroMetricLabel}>Total sales</Text>
                <Text style={styles.heroMetricValue}>
                  {formatCurrency(
                    vendorDashboardStats.totalSales,
                    vendorDashboardStats.currency,
                  )}
                </Text>
              </View>
              <View style={styles.heroMetricChip}>
                <Text style={styles.heroMetricLabel}>Delivered orders</Text>
                <Text style={styles.heroMetricValue}>
                  {vendorDashboardStats.completedOrders}
                </Text>
              </View>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {focusState ? (
            <View style={styles.focusCard}>
              <View style={styles.focusTextWrap}>
                <Text style={styles.focusEyebrow}>{focusState.eyebrow}</Text>
                <Text style={styles.focusTitle}>{focusState.title}</Text>
                <Text style={styles.focusBody}>{focusState.body}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.focusAction}
                onPress={focusState.onPress}
              >
                <Text style={styles.focusActionLabel}>{focusState.actionLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.financeCard}>
            <View style={styles.financeIntroRow}>
              <View style={styles.financeTextWrap}>
                <Text style={styles.financeOverline}>Finance</Text>
                <Text style={styles.financeTitle}>Payout-ready wallet balance</Text>
                <Text style={styles.financeValue}>
                  {formatCurrency(
                    vendorDashboardStats.availableBalance,
                    vendorDashboardStats.currency,
                  )}
                </Text>
                <Text style={styles.financeBody}>
                  This balance is what ODOS has already settled for withdrawal after
                  delivered orders and commission deductions.
                </Text>
              </View>
            </View>

            <View style={styles.financeMetricsGrid}>
              <View style={styles.financeMetricCard}>
                <Text style={styles.financeMetricLabel}>Pending withdrawals</Text>
                <Text style={styles.financeMetricValue}>
                  {formatCurrency(
                    vendorDashboardStats.pendingWithdrawalBalance,
                    vendorDashboardStats.currency,
                  )}
                </Text>
              </View>
              <View style={styles.financeMetricCard}>
                <Text style={styles.financeMetricLabel}>Lifetime earnings</Text>
                <Text style={styles.financeMetricValue}>
                  {formatCurrency(
                    vendorDashboardStats.lifetimeEarnings,
                    vendorDashboardStats.currency,
                  )}
                </Text>
              </View>
              <View style={styles.financeMetricCard}>
                <Text style={styles.financeMetricLabel}>ODOS commission</Text>
                <Text style={styles.financeMetricValue}>
                  {formatCurrency(
                    vendorDashboardStats.totalCommission,
                    vendorDashboardStats.currency,
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.financeActionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryFinanceAction}
                onPress={() => router.push("/vendor/wallet" as any)}
              >
                <Text style={styles.primaryFinanceActionLabel}>
                  Open wallet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryFinanceAction}
                onPress={() => router.push("/vendor/orders" as any)}
              >
                <Text style={styles.secondaryFinanceActionLabel}>
                  Review order settlements
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionEyebrow}>Performance</Text>
            <Text style={styles.sectionTitle}>Operations snapshot</Text>
            <Text style={styles.sectionDescription}>
              A quick read on your catalog, order flow, and what is already working.
            </Text>
            <View style={styles.statsRow}>
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

            <View style={styles.statsRow}>
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

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionEyebrow}>Execution</Text>
            <Text style={styles.sectionTitle}>Run your store</Text>
            <Text style={styles.sectionDescription}>
              The core actions you will use most often to manage sales and catalog growth.
            </Text>
            <View style={[styles.actionsGrid, isTablet && styles.actionsGridTablet]}>
              {businessActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  tag={action.tag}
                  highlight={action.highlight}
                  onPress={action.onPress}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionEyebrow}>Relationships</Text>
            <Text style={styles.sectionTitle}>Support and storefront</Text>
            <Text style={styles.sectionDescription}>
              Keep your store profile sharp and stay responsive to both shoppers and ODOS.
            </Text>
            <View style={[styles.actionsGrid, isTablet && styles.actionsGridTablet]}>
              {relationshipActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  tag={action.tag}
                  highlight={action.highlight}
                  onPress={action.onPress}
                />
              ))}
            </View>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpEyebrow}>Need help with payouts?</Text>
            <Text style={styles.helpTitle}>Use Admin Support when money needs review</Text>
            <Text style={styles.bodyText}>
              Reach out if a withdrawal needs follow-up, a settlement looks off, or you
              want ODOS to investigate a payout issue tied to an order.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  innerWrap: {
    flex: 1,
    paddingHorizontal: rS(16),
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#0B1526",
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    marginBottom: rV(16),
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: rS(12),
  },
  heroTextWrap: {
    flex: 1,
  },
  overline: {
    color: "#AAB7C8",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: rV(8),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
  },
  heroBody: {
    marginTop: rV(6),
    color: "#D6DEEA",
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  heroPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(12),
  },
  heroPill: {
    borderRadius: rMS(999),
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: rS(11),
    paddingVertical: rV(6),
  },
  heroPillText: {
    color: "rgba(255,255,255,0.84)",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
  },
  heroMetricsRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(16),
  },
  heroMetricChip: {
    flex: 1,
    borderRadius: rMS(18),
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
  },
  heroMetricLabel: {
    color: "#AAB7C8",
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  heroMetricValue: {
    marginTop: rV(6),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  errorText: {
    marginTop: rV(10),
    color: "#FCA5A5",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  focusCard: {
    backgroundColor: "#F8EFE4",
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    marginBottom: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E8D4BC",
  },
  focusTextWrap: {
    flex: 1,
  },
  focusEyebrow: {
    color: "#8B5E34",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  focusTitle: {
    marginTop: rV(8),
    color: "#24180B",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
  },
  focusBody: {
    marginTop: rV(7),
    color: "#5A4630",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  focusAction: {
    alignSelf: "flex-start",
    marginTop: rV(14),
    borderRadius: rMS(999),
    backgroundColor: "#24180B",
    paddingHorizontal: rS(15),
    paddingVertical: rV(10),
  },
  focusActionLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  statsRow: {
    flexDirection: "row",
    gap: rS(12),
    marginBottom: rV(12),
  },
  financeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(18),
  },
  financeIntroRow: {
    gap: rS(14),
  },
  financeTextWrap: {
    flex: 1,
  },
  financeOverline: {
    color: "#8B5E34",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  financeTitle: {
    marginTop: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  financeValue: {
    marginTop: rV(6),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(27),
  },
  financeBody: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  financeMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
    marginTop: rV(16),
  },
  financeMetricCard: {
    flex: 1,
    minWidth: rS(104),
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
  },
  financeMetricLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  financeMetricValue: {
    marginTop: rV(6),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
  },
  financeActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
    marginTop: rV(16),
  },
  primaryFinanceAction: {
    flex: 1,
    minWidth: rS(150),
    backgroundColor: AppColors.primary,
    borderRadius: rMS(999),
    paddingVertical: rV(13),
    alignItems: "center",
    justifyContent: "center",
  },
  primaryFinanceActionLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  secondaryFinanceAction: {
    flex: 1,
    minWidth: rS(150),
    backgroundColor: "#EEF2F7",
    borderRadius: rMS(999),
    paddingVertical: rV(13),
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryFinanceActionLabel: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(16),
  },
  sectionEyebrow: {
    color: "#8B5E34",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  sectionDescription: {
    marginTop: rV(6),
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  sectionBlock: {
    marginBottom: rV(18),
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(12),
    marginBottom: rV(18),
  },
  actionsGridTablet: {
    justifyContent: "space-between",
  },
  helpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  helpEyebrow: {
    color: "#8B5E34",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  helpTitle: {
    marginTop: rV(8),
    marginBottom: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  bodyText: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
});
