import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorOrderDetailView from "@/components/vendor/VendorOrderDetailView";
import { VendorScreenShell, vendorStyles } from "@/components/vendor/VendorUi";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { VENDOR_ORDER_NEXT_STATUS } from "@/utils/vendorOrderFulfillment";
import { rV, useResponsive } from "@/styles/responsive";
import { Redirect, useLocalSearchParams } from "expo-router";
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
    notifyOrderDeparture,
    orders,
    updateOrderStatus,
    updatingOrderId,
    uploadOrderDispatchPhoto,
  } = useStoreStore();
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isAttachingPhoto, setIsAttachingPhoto] = useState(false);

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

  const handleAdvance = async (deliveryCode?: string) => {
    if (!order) {
      return;
    }
    const nextStatus = VENDOR_ORDER_NEXT_STATUS[order.status];
    if (!nextStatus) {
      return;
    }

    try {
      await updateOrderStatus(session, order.id, nextStatus, deliveryCode);
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

  const handleNotifyDeparture = async () => {
    if (!order) {
      return;
    }

    try {
      await notifyOrderDeparture(session, order.id);
      showToast("Customer notified you're on your way.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't send that heads-up.",
      );
    }
  };

  const handleAttachDispatchPhoto = async (photoUri: string) => {
    if (!order) {
      return;
    }

    setIsAttachingPhoto(true);
    try {
      await uploadOrderDispatchPhoto(session, order.id, photoUri);
      showToast("Photo attached to this order.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't attach that photo.",
      );
    } finally {
      setIsAttachingPhoto(false);
    }
  };

  if (isCheckingVendorAccess) {
    return <VendorScreenShell title="Order detail" loading loadingLabel="Loading order..." />;
  }

  if (!hasVendorAccess) {
    return <Redirect href="/(root)/(tabs)/profile" />;
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
        <VendorOrderDetailView
          order={order}
          isUpdating={isUpdating}
          isAttachingPhoto={isAttachingPhoto}
          onAdvance={(deliveryCode) => void handleAdvance(deliveryCode)}
          onCancel={() => void handleCancel()}
          onAcknowledge={() => void handleAcknowledge()}
          onNotifyDeparture={() => void handleNotifyDeparture()}
          onAttachDispatchPhoto={(photoUri) => void handleAttachDispatchPhoto(photoUri)}
        />
      </View>
    </VendorScreenShell>
  );
}
