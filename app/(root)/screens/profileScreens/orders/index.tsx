import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountInsightCard,
  AccountSegmentedTabs,
  useAccountStyles,
} from "@/components/orders/OrderUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useOrders } from "@/hooks/useOrders";
import { rS, rV } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

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
  const params = useLocalSearchParams();
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab: OrderTab =
    requestedTab === "processing" || requestedTab === "cancelled" || requestedTab === "delivered"
      ? requestedTab
      : "delivered";
  const [activeTab, setActiveTab] = useState<OrderTab>(initialTab);
  const { orders, isLoadingOrders, isMutatingOrder, cancelOrder } = useOrders();

  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const processingOrders = orders.filter(
    (order) => order.status === "processing" || order.status === "pending_payment",
  );
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");

  const stats = useMemo(
    () => [
      { label: "Delivered", value: String(deliveredOrders.length) },
      { label: "Active", value: String(processingOrders.length) },
      { label: "Cancelled", value: String(cancelledOrders.length) },
    ],
    [cancelledOrders.length, deliveredOrders.length, processingOrders.length],
  );

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
              isMutatingOrder={isMutatingOrder}
              onCancelOrder={cancelOrder}
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
  tabContent: {
    minHeight: rV(240),
  },
});
