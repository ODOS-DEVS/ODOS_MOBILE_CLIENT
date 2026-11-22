import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountEmptyState,
  AccountInsightCard,
  AccountSegmentedTabs,
  useAccountStyles,
} from "@/components/orders/OrderUi";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useOrders } from "@/hooks/useOrders";
import { isOrderClosed, isOrderDelivered, isOrderLive } from "@/utils/orderState";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { openSignInFromApp } from "@/utils/authNavigation";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CancelledTab from "./components/CancelledTab";
import DeliveredTab from "./components/delivered/DeliveredTab";
import ProcessingTab from "./components/ProcessingTab";

type OrderTab = "delivered" | "processing" | "cancelled";

const TAB_OPTIONS: Array<{ key: OrderTab; label: string }> = [
  { key: "delivered", label: "Delivered" },
  { key: "processing", label: "Processing" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersScreen() {
  const accountStyles = useAccountStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab: OrderTab =
    requestedTab === "processing" || requestedTab === "cancelled" || requestedTab === "delivered"
      ? requestedTab
      : "delivered";
  const [activeTab, setActiveTab] = useState<OrderTab>(initialTab);
  const { orders, isLoadingOrders, ordersError, refreshOrders } = useOrders();

  // From utils/orderState rather than a list of statuses per screen. The old
  // filters named "processing" and "pending_payment" explicitly, so an order
  // that expired unpaid or whose payment failed appeared in no tab at all.
  const deliveredOrders = orders.filter(isOrderDelivered);
  const processingOrders = orders.filter(isOrderLive);
  const cancelledOrders = orders.filter(isOrderClosed);

  const stats = useMemo(
    () => [
      { label: "Delivered", value: String(deliveredOrders.length) },
      { label: "Active", value: String(processingOrders.length) },
      { label: "Cancelled", value: String(cancelledOrders.length) },
    ],
    [cancelledOrders.length, deliveredOrders.length, processingOrders.length],
  );

  if (!user) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="My Orders" />
        <AccountEmptyState
          icon="receipt-outline"
          title="Sign in to view your orders"
          message="Your order history, tracking, and receipts are tied to your account."
          actionLabel="Sign in"
          onAction={() => openSignInFromApp(router)}
        />
      </View>
    );
  }

  if (isLoadingOrders) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="My Orders" />
        <ScreenLoader label="Loading your orders..." />
      </View>
    );
  }

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="My Orders" />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AccountInsightCard
          title="Order activity"
          subtitle="Track delivery status, receipts, and returns in one place."
          stats={stats}
        />

        {ordersError ? (
          <View style={styles.errorBannerWrap}>
            <FeedbackBanner
              tone="warning"
              title="Couldn't refresh orders"
              message={ordersError}
            />
            <TouchableOpacity
              onPress={() => void refreshOrders()}
              accessibilityRole="button"
              style={[styles.retryButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.retryButtonText, { color: colors.primary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <AccountSegmentedTabs
          options={TAB_OPTIONS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        <View style={styles.tabContent}>
          {activeTab === "delivered" && <DeliveredTab orders={deliveredOrders} />}
          {activeTab === "processing" && (
            <ProcessingTab
              orders={processingOrders}
            />
          )}
          {activeTab === "cancelled" && <CancelledTab orders={cancelledOrders} />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(24),
    gap: rV(12),
  },
  errorBannerWrap: {
    gap: rV(8),
  },
  retryButton: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: rMS(10),
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
  },
  retryButtonText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  tabContent: {
    minHeight: rV(240),
  },
});
