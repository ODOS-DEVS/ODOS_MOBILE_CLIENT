import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorOrderDetailView from "@/components/vendor/VendorOrderDetailView";
import { VendorScreenShell, vendorStyles } from "@/components/vendor/VendorUi";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { VENDOR_ORDER_NEXT_STATUS } from "@/utils/vendorOrderFulfillment";
import { rV, useResponsive } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

type LoadState = "idle" | "loading" | "failed" | "ready";

export default function VendorOrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ orderId?: string | string[] }>();
  const orderId = getParam(params.orderId)?.trim() ?? null;
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const {
    acknowledgeOrder,
    fetchOrder,
    isUpdatingOrder,
    orders,
    updateOrderStatus,
    updatingOrderId,
  } = useStoreStore();
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const order = useMemo(
    () => (orderId ? orders.find((item) => item.id === orderId) ?? null : null),
    [orderId, orders],
  );

  const loadOrder = useCallback(async () => {
    if (!hasVendorAccess || !orderId) {
      return;
    }

    setLoadState("loading");
    try {
      await fetchOrder(session, orderId);
      setLoadState("ready");
    } catch (error) {
      setLoadState("failed");
      showToast(
        error instanceof Error ? error.message : "We couldn't load that order.",
      );
    }
  }, [fetchOrder, hasVendorAccess, orderId, session, showToast]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleAdvance = async () => {
    if (!order) {
      return;
    }
    const nextStatus = VENDOR_ORDER_NEXT_STATUS[order.status];
    if (!nextStatus) {
      return;
    }

    try {
      await updateOrderStatus(session, order.id, nextStatus);
      showToast(`Order moved to ${nextStatus.replace(/_/g, " ")}.`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't update that order.",
      );
    }
  };

  const handleCancel = async () => {
    if (!order) {
      return;
    }

    try {
      await updateOrderStatus(session, order.id, "cancelled");
      showToast("Order cancelled.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't cancel that order.",
      );
    }
  };

  const handleAcknowledge = async () => {
    if (!order) {
      return;
    }

    try {
      await acknowledgeOrder(session, order.id);
      showToast("Order acknowledged. Reminders paused.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't acknowledge that order.",
      );
    }
  };

  if (isCheckingVendorAccess) {
    return <VendorScreenShell title="Order detail" loading loadingLabel="Loading order..." />;
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (!orderId) {
    return (
      <VendorScreenShell title="Order detail">
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountEmptyState
            icon="alert-circle-outline"
            title="Order not found"
            message="This order link is invalid or has expired."
          />
        </View>
      </VendorScreenShell>
    );
  }

  if (loadState === "loading" && !order) {
    return <VendorScreenShell title="Order detail" loading loadingLabel="Loading order..." />;
  }

  if (loadState === "failed" && !order) {
    return (
      <VendorScreenShell title="Order detail">
        <View
          style={[
            vendorStyles.contentWrap,
            {
              maxWidth: contentMaxWidth,
              paddingBottom: insets.bottom + rV(24),
            },
          ]}
        >
          <AccountEmptyState
            icon="cloud-offline-outline"
            title="Couldn't load order"
            message="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => void loadOrder()}
          />
        </View>
      </VendorScreenShell>
    );
  }

  if (!order) {
    return <VendorScreenShell title="Order detail" loading loadingLabel="Loading order..." />;
  }

  const isUpdating = isUpdatingOrder && updatingOrderId === order.id;

  return (
    <VendorScreenShell title={order.orderNumber}>
      <View
        style={[
          vendorStyles.contentWrap,
          {
            maxWidth: contentMaxWidth,
            paddingBottom: insets.bottom + rV(24),
            flex: 1,
          },
        ]}
      >
        {isUpdating ? <ScreenLoader label="Updating order" /> : null}
        <VendorOrderDetailView
          order={order}
          isUpdating={isUpdating}
          onAdvance={() => void handleAdvance()}
          onCancel={() => void handleCancel()}
          onAcknowledge={() => void handleAcknowledge()}
        />
      </View>
    </VendorScreenShell>
  );
}
