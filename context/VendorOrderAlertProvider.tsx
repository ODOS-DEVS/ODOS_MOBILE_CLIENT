import VendorOrderAlertOverlay from "@/components/vendor/VendorOrderAlertOverlay";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/context/RealtimeContext";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorSession } from "@/hooks/useVendorSession";
import { playVendorOrderAlertEffects } from "@/utils/vendorOrderAlertEffects";
import {
  emitVendorOrderAlert,
  subscribeVendorOrderAlerts,
  type VendorOrderAlertPayload,
} from "@/utils/vendorOrderAlertBus";
import {
  cancelVendorOrderReminders,
  findDueForegroundReminders,
  scheduleVendorOrderReminders,
  syncVendorOrderReminderState,
} from "@/utils/vendorOrderReminders";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export function triggerVendorOrderAlert(payload: VendorOrderAlertPayload) {
  emitVendorOrderAlert(payload);
}

function canReceiveVendorOrderAlerts(user: ReturnType<typeof useAuth>["user"]) {
  const notifyOrders =
    user?.vendor_notify_orders ?? user?.vendor_order_notifications ?? false;
  return Boolean(
    user?.roles?.includes("vendor") && user.allow_notifications && notifyOrders,
  );
}

export function VendorOrderAlertProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { subscribe } = useRealtime();
  const { session } = useVendorSession();
  const orders = useStoreStore((state) => state.orders);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const fetchOrders = useStoreStore((state) => state.fetchOrders);
  const acknowledgeOrder = useStoreStore((state) => state.acknowledgeOrder);
  const [activeAlert, setActiveAlert] = useState<VendorOrderAlertPayload | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissAlert = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setActiveAlert(null);
  }, []);

  const showAlert = useCallback(
    (payload: VendorOrderAlertPayload) => {
      if (!canReceiveVendorOrderAlerts(user)) {
        return;
      }

      const itemLabel = payload.productCount === 1 ? "item" : "items";
      void playVendorOrderAlertEffects({
        title:
          payload.kind === "reminder"
            ? `Order #${payload.orderNumber} still waiting`
            : "New order on ODOS",
        body: `#${payload.orderNumber} · ${payload.productCount} ${itemLabel} · ${formatAmount(payload.totalAmount)}`,
        isReminder: payload.kind === "reminder",
      });

      if (payload.kind !== "reminder") {
        void scheduleVendorOrderReminders(payload);
      }

      setActiveAlert(payload);

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      dismissTimerRef.current = setTimeout(() => {
        setActiveAlert(null);
        dismissTimerRef.current = null;
      }, payload.kind === "reminder" ? 60_000 : 45_000);
    },
    [user],
  );

  useEffect(() => {
    return subscribeVendorOrderAlerts(showAlert);
  }, [showAlert]);

  useEffect(() => {
    if (!user?.roles?.includes("vendor")) {
      return undefined;
    }

    return subscribe("notification.created", (event) => {
      if (!event.payload || typeof event.payload !== "object") {
        return;
      }

      const payload = event.payload as Record<string, unknown>;
      const kind = payload.kind;
      if (
        kind !== "vendor_order_received" &&
        typeof kind === "string" &&
        !kind.startsWith("vendor_order_reminder_")
      ) {
        return;
      }

      const orderId = typeof payload.route_target_id === "string" ? payload.route_target_id : null;
      if (!orderId) {
        return;
      }

      const body = typeof payload.body === "string" ? payload.body : "";
      const orderNumberMatch = body.match(/Order #([^·]+)/i);
      const matchedOrder = ordersRef.current.find((item) => item.id === orderId);
      const orderNumber =
        matchedOrder?.orderNumber ?? orderNumberMatch?.[1]?.trim() ?? "New order";
      const reminderMinutes =
        typeof kind === "string" && kind.startsWith("vendor_order_reminder_")
          ? Number(kind.replace("vendor_order_reminder_", ""))
          : undefined;

      triggerVendorOrderAlert({
        orderId,
        orderNumber,
        productCount: matchedOrder?.productCount ?? 1,
        totalAmount: matchedOrder?.totalAmount ?? 0,
        customerName: matchedOrder?.customerName,
        kind: reminderMinutes ? "reminder" : "new",
        reminderMinutes: Number.isFinite(reminderMinutes) ? reminderMinutes : undefined,
      });
    });
  }, [showAlert, subscribe, user?.roles]);

  const reminderScanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.roles?.includes("vendor") || !canReceiveVendorOrderAlerts(user)) {
      return undefined;
    }

    let cancelled = false;

    const runReminderScan = async () => {
      await syncVendorOrderReminderState(orders);
      const due = await findDueForegroundReminders(orders);
      if (cancelled) {
        return;
      }
      due.forEach((payload) => {
        triggerVendorOrderAlert(payload);
      });
    };

    if (reminderScanTimeoutRef.current) {
      clearTimeout(reminderScanTimeoutRef.current);
    }

    reminderScanTimeoutRef.current = setTimeout(() => {
      reminderScanTimeoutRef.current = null;
      void runReminderScan();
    }, 400);

    const interval = setInterval(() => {
      void runReminderScan();
    }, 30_000);

    return () => {
      cancelled = true;
      if (reminderScanTimeoutRef.current) {
        clearTimeout(reminderScanTimeoutRef.current);
        reminderScanTimeoutRef.current = null;
      }
      clearInterval(interval);
    };
  }, [orders, user]);

  useEffect(() => {
    if (!user?.roles?.includes("vendor") || !session.accessToken) {
      return undefined;
    }

    const refresh = () => {
      void fetchOrders(session);
    };

    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchOrders, session, user?.roles]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const handleAcknowledgeAlert = useCallback(
    (payload: VendorOrderAlertPayload) => {
      if (!session.accessToken) {
        return;
      }
      void acknowledgeOrder(session, payload.orderId).catch(() => {
        // Order detail screen surfaces API errors; overlay stays dismissible.
      });
    },
    [acknowledgeOrder, session],
  );

  return (
    <>
      {children}
      <VendorOrderAlertOverlay
        alert={activeAlert}
        onDismiss={dismissAlert}
        onAcknowledge={handleAcknowledgeAlert}
      />
    </>
  );
}

function formatAmount(value: number) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export { cancelVendorOrderReminders };
