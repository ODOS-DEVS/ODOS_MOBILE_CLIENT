import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AccountBadge } from "@/components/account/AccountUi";
import {
  AccountActionButton,
  AccountEmptyState,
  AccountListCard,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { AppColors } from "@/constants/Colors";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorOrderStatus } from "@/types/store";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NEXT_STATUS: Partial<Record<VendorOrderStatus, VendorOrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "ready",
  ready: "delivered",
};

function orderStatusTone(status: VendorOrderStatus): "neutral" | "warning" | "success" | "info" {
  if (status === "delivered") return "success";
  if (status === "pending") return "warning";
  if (status === "ready") return "info";
  return "neutral";
}

export default function VendorOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const {
    error,
    fetchOrders,
    isLoadingOrders,
    isUpdatingOrder,
    orders,
    updateOrderStatus,
  } = useStoreStore();

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void fetchOrders(session);
  }, [fetchOrders, hasVendorAccess, session]);

  const handleAdvance = async (orderId: string, status: VendorOrderStatus) => {
    const nextStatus = NEXT_STATUS[status];
    if (!nextStatus) {
      return;
    }

    try {
      await updateOrderStatus(session, orderId, nextStatus);
      showToast(`Order moved to ${nextStatus.replace(/_/g, " ")}.`);
    } catch (orderError) {
      showToast(
        orderError instanceof Error
          ? orderError.message
          : "We couldn't update that order right now.",
      );
    }
  };

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell title="Vendor Orders" loading loadingLabel="Loading vendor orders..." />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  const showLoader = isLoadingOrders && orders.length === 0;

  if (showLoader) {
    return (
      <VendorScreenShell title="Vendor Orders" loading loadingLabel="Loading vendor orders..." />
    );
  }

  return (
    <VendorScreenShell title="Vendor Orders">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title="Fulfillment queue"
              subtitle="Vendor-facing orders only. Update status as each order moves from confirmation to delivery."
              stats={[
                { value: orders.length, label: "Orders" },
                {
                  value: orders.filter((o) => o.status !== "delivered").length,
                  label: "Active",
                },
              ]}
              error={error}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="receipt-outline"
              title="No vendor orders yet"
              message="Orders placed for your approved store will appear here with customer and fulfillment details."
            />
          </View>
        }
        renderItem={({ item }) => {
          const nextStatus = NEXT_STATUS[item.status];

          return (
            <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
              <AccountListCard style={styles.orderCard}>
                <View style={styles.headerRow}>
                  <View style={styles.headerCopy}>
                    <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                    <Text style={styles.customerName}>
                      {item.customerName || "ODOS Customer"}
                    </Text>
                  </View>
                  <AccountBadge
                    label={item.status.replace(/_/g, " ")}
                    tone={orderStatusTone(item.status)}
                  />
                </View>

                <View style={styles.metaGrid}>
                  <Text style={styles.metaText}>Items: {item.productCount}</Text>
                  <Text style={styles.metaText}>Total: GHS {item.totalAmount.toFixed(2)}</Text>
                  <Text style={styles.metaText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {nextStatus ? (
                  <AccountActionButton
                    label={
                      isUpdatingOrder
                        ? "Updating..."
                        : `Mark as ${nextStatus.replace(/_/g, " ")}`
                    }
                    variant="primary"
                    onPress={() => handleAdvance(item.id, item.status)}
                    disabled={isUpdatingOrder}
                  />
                ) : null}
              </AccountListCard>
            </View>
          );
        }}
      />
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    marginBottom: rV(10),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: rS(12),
  },
  headerCopy: {
    flex: 1,
  },
  orderNumber: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  customerName: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  metaGrid: {
    marginTop: rV(12),
    gap: rV(5),
  },
  metaText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
});
