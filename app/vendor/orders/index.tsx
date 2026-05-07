import ProfileHeader from "@/components/profile/ProfileHeader";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { VendorEmptyState } from "@/components/vendor/VendorEmptyState";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorOrderStatus } from "@/types/store";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NEXT_STATUS: Partial<Record<VendorOrderStatus, VendorOrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "ready",
  ready: "delivered",
};

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

  if (isCheckingVendorAccess || isLoadingOrders) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="Vendor Orders" />
        <ScreenLoader label="Loading vendor orders..." />
      </View>
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

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

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Vendor Orders" />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <Text style={styles.pageTitle}>Fulfillment queue</Text>
            <Text style={styles.pageBody}>
              These are vendor-facing orders only. Update status as orders move from confirmation to delivery.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorEmptyState
              icon="receipt-outline"
              title="No vendor orders yet"
              message="Orders placed for your approved store will appear here with customer and fulfillment details."
            />
          </View>
        }
        renderItem={({ item }) => {
          const nextStatus = NEXT_STATUS[item.status];

          return (
            <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <View>
                    <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                    <Text style={styles.customerName}>
                      {item.customerName || "ODOS Customer"}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillLabel}>
                      {item.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaGrid}>
                  <Text style={styles.metaText}>Items: {item.productCount}</Text>
                  <Text style={styles.metaText}>Total: GHS {item.totalAmount.toFixed(2)}</Text>
                  <Text style={styles.metaText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {nextStatus ? (
                  <TouchableOpacity
                    style={[styles.primaryButton, isUpdatingOrder && styles.buttonDisabled]}
                    onPress={() => handleAdvance(item.id, item.status)}
                    disabled={isUpdatingOrder}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryButtonLabel}>
                      {isUpdatingOrder
                        ? "Updating..."
                        : `Mark as ${nextStatus.replace(/_/g, " ")}`}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  listContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  pageTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
  },
  pageBody: {
    marginTop: rV(8),
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  errorText: {
    marginBottom: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    marginBottom: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: rS(12),
  },
  orderNumber: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
  customerName: {
    marginTop: rV(4),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  statusPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(999),
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
  },
  statusPillLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
    textTransform: "capitalize",
  },
  metaGrid: {
    marginTop: rV(14),
    gap: rV(6),
  },
  metaText: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  primaryButton: {
    marginTop: rV(16),
    backgroundColor: AppColors.primary,
    borderRadius: rMS(999),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(14),
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  primaryButtonLabel: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    textTransform: "capitalize",
  },
});
