import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

import DeliveredTab from "./components/delivered/DeliveredTab";
import ProcessingTab from "./components/ProcessingTab";
import CancelledTab from "./components/CancelledTab";

type OrderTab = "delivered" | "processing" | "cancelled";

export default function MyOrderScreen() {
  const { orderId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<OrderTab>("delivered");

  const getTabColor = (tab: OrderTab): readonly [string, string] => {
    switch (tab) {
      case "delivered":
        return ["#10B981", "#059669"] as const;
      case "processing":
        return ["#3B82F6", "#2563EB"] as const;
      case "cancelled":
        return ["#EF4444", "#DC2626"] as const;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <View style={styles.backIconContainer}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </LinearGradient>

      {/* Top Tabs */}
      <View style={styles.tabsWrapper}>
        {(["delivered", "processing", "cancelled"] as OrderTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const colors = getTabColor(tab);

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Text style={styles.tabTextActive}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "delivered" && <DeliveredTab />}
        {activeTab === "processing" && <ProcessingTab />}
        {activeTab === "cancelled" && <CancelledTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  backButton: {
    marginRight: 16,
  },

  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  backIcon: {
    fontSize: 24,
    color: "#1F2937",
    fontWeight: "700",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },

  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  tabButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },

  tabButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  activeTabGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  tabTextActive: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
    padding: 16,
  },
});
