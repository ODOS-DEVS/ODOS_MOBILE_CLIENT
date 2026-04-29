import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useOrders } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CancelledTab from "./components/CancelledTab";
import DeliveredTab from "./components/delivered/DeliveredTab";
import ProcessingTab from "./components/ProcessingTab";

type OrderTab = "delivered" | "processing" | "cancelled";

const TABS: { key: OrderTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "delivered", label: "Delivered", icon: "checkmark-done-outline" },
  { key: "processing", label: "Processing", icon: "time-outline" },
  { key: "cancelled", label: "Cancelled", icon: "close-circle-outline" },
];

export default function OrdersScreen() {
  const params = useLocalSearchParams();
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab: OrderTab =
    requestedTab === "processing" || requestedTab === "cancelled" || requestedTab === "delivered"
      ? requestedTab
      : "delivered";
  const [activeTab, setActiveTab] = useState<OrderTab>(initialTab);
  const { orders, isLoadingOrders, isMutatingOrder, cancelOrder } = useOrders();

  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const processingOrders = orders.filter((order) => order.status === "processing");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");

  return (
    <View style={styles.container}>
      <ProfileHeader title="My Orders" />

      <View style={styles.topSection}>
        <Text style={styles.subTitle}>
          Track your order activity, delivery status, and receipts.
        </Text>
        <View style={styles.tabsWrapper}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon}
                  size={rMS(16)}
                  color={isActive ? AppColors.white : AppColors.secondary}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.content}>
        {isLoadingOrders ? (
          <ScreenLoader label="Loading your orders..." />
        ) : (
          <>
            {activeTab === "delivered" && <DeliveredTab orders={deliveredOrders} />}
            {activeTab === "processing" && (
              <ProcessingTab
                orders={processingOrders}
                isMutatingOrder={isMutatingOrder}
                onCancelOrder={cancelOrder}
              />
            )}
            {activeTab === "cancelled" && (
              <CancelledTab orders={cancelledOrders} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  topSection: {
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(8),
  },
  subTitle: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    marginBottom: rV(12),
  },
  tabsWrapper: {
    flexDirection: "row",
    gap: rS(8),
  },
  tabButton: {
    flex: 1,
    borderRadius: rMS(99),
    borderWidth: 1,
    borderColor: "#D4DAE2",
    backgroundColor: AppColors.white,
    paddingVertical: rV(10),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: rS(2),
  },
  tabButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  tabText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
  },
  tabTextActive: {
    color: AppColors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: rS(16),
    paddingBottom: rV(12),
  },
});
