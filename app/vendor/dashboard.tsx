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
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Total Products"
              value={String(vendorDashboardStats.totalProducts)}
              hint="All products attached to your store"
            />
            <StatCard
              label="Active Products"
              value={String(vendorDashboardStats.activeProducts)}
              hint="Live products visible to shoppers"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Pending Orders"
              value={String(vendorDashboardStats.pendingOrders)}
              hint="Orders still moving through fulfillment"
            />
            <StatCard
              label="Completed Orders"
              value={String(vendorDashboardStats.completedOrders)}
              hint="Delivered orders recorded by the app"
            />
          </View>

          <View style={styles.salesCard}>
            <Text style={styles.salesLabel}>Total Sales</Text>
            <Text style={styles.salesValue}>
              {vendorDashboardStats.currency} {vendorDashboardStats.totalSales.toFixed(2)}
            </Text>
            <Text style={styles.salesHint}>
              Derived from delivered and in-progress orders while backend analytics are still evolving.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={[styles.actionsGrid, isTablet && styles.actionsGridTablet]}>
            <QuickActionCard
              icon="add-circle-outline"
              title="Add Product"
              subtitle="Create a new store item with price and stock."
              onPress={() => router.push("/vendor/products/new" as any)}
            />
            <QuickActionCard
              icon="pricetags-outline"
              title="My Products"
              subtitle="Review the product list and current stock snapshot."
              onPress={() => router.push("/vendor/products" as any)}
            />
            <QuickActionCard
              icon="receipt-outline"
              title="Orders"
              subtitle="Track vendor-only order activity and fulfillment."
              onPress={() => router.push("/vendor/orders" as any)}
            />
            <QuickActionCard
              icon="storefront-outline"
              title="Store Profile"
              subtitle="Update the store details customers see."
              onPress={() => router.push("/vendor/store" as any)}
            />
            <QuickActionCard
              icon="ticket-outline"
              title="Promotions"
              subtitle="Create store offers and gift vouchers to shoppers."
              onPress={() => router.push("/vendor/vouchers" as any)}
            />
            <QuickActionCard
              icon="chatbubble-ellipses-outline"
              title="Shopper Chats"
              subtitle="Reply to questions from customers browsing your store."
              onPress={() => router.push("/vendor/chats" as any)}
            />
            <QuickActionCard
              icon="headset-outline"
              title="Admin Support"
              subtitle="Message the admin team about approvals, payouts, or store issues."
              onPress={() =>
                router.push({
                  pathname: "/screens/support/chat",
                  params: {
                    subject: "Vendor admin support",
                    fallback: "/vendor/dashboard",
                  },
                })
              }
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What still depends on backend support</Text>
            <Text style={styles.bodyText}>
              Approval, analytics, and vendor-only order filtering already have frontend support, but the final live behavior will rely on the `/vendor/*` backend routes returning production data.
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
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
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
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
  },
  heroBody: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  errorText: {
    marginTop: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  statsRow: {
    flexDirection: "row",
    gap: rS(12),
    marginBottom: rV(12),
  },
  salesCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(18),
  },
  salesLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  salesValue: {
    marginTop: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
  },
  salesHint: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  sectionTitle: {
    marginBottom: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
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
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  bodyText: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
});
