import type { VendorOrder } from "@/types/store";
import type { VendorOrderAlertPayload } from "@/utils/vendorOrderAlertBus";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

const STORAGE_KEY = "odos_vendor_order_reminder_state_v1";
const REMINDER_TIERS_MINUTES = [5, 15, 30, 45] as const;
const isExpoGo = Constants.appOwnership === "expo";

type ReminderState = Record<
  string,
  {
    firstSeenAt: number;
    sentTiers: number[];
    acknowledgedAt?: number;
  }
>;

const ACK_STORAGE_KEY = "odos_vendor_order_acknowledged_v1";

const ACTIVE_STATUSES = new Set([
  "pending",
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
]);

async function readState(): Promise<ReminderState> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as ReminderState;
  } catch {
    return {};
  }
}

async function writeState(state: ReminderState) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort persistence.
  }
}

function reminderNotificationId(orderId: string, minutes: number) {
  return `vendor-order-reminder-${orderId}-${minutes}`;
}

export async function acknowledgeVendorOrder(orderId: string) {
  await cancelVendorOrderReminders(orderId);

  const state = await readState();
  if (state[orderId]) {
    state[orderId].acknowledgedAt = Date.now();
    await writeState(state);
  }

  try {
    const existing = await SecureStore.getItemAsync(ACK_STORAGE_KEY);
    const acknowledged = existing ? (JSON.parse(existing) as string[]) : [];
    if (!acknowledged.includes(orderId)) {
      acknowledged.push(orderId);
      await SecureStore.setItemAsync(ACK_STORAGE_KEY, JSON.stringify(acknowledged));
    }
  } catch {
    // Best-effort local acknowledge marker.
  }
}

export async function isVendorOrderAcknowledgedLocally(orderId: string) {
  try {
    const state = await readState();
    if (state[orderId]?.acknowledgedAt) {
      return true;
    }
    const existing = await SecureStore.getItemAsync(ACK_STORAGE_KEY);
    if (!existing) {
      return false;
    }
    return (JSON.parse(existing) as string[]).includes(orderId);
  } catch {
    return false;
  }
}

export async function scheduleVendorOrderReminders(payload: VendorOrderAlertPayload) {
  if (isExpoGo || Platform.OS === "web") {
    return;
  }

  const state = await readState();
  state[payload.orderId] = {
    firstSeenAt: Date.now(),
    sentTiers: [],
  };
  await writeState(state);

  try {
    const Notifications = await import("expo-notifications");

    for (const minutes of REMINDER_TIERS_MINUTES) {
      await Notifications.scheduleNotificationAsync({
        identifier: reminderNotificationId(payload.orderId, minutes),
        content: {
          title:
            minutes >= 30
              ? `Urgent · Order #${payload.orderNumber}`
              : `Reminder · Order #${payload.orderNumber}`,
          body: `This order has been waiting ${minutes} minutes. Open Orders to fulfil it now.`,
          sound: "vendor-order.wav",
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            type: "vendor_order_reminder",
            routeType: "vendor_order",
            routeTargetId: payload.orderId,
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            productCount: payload.productCount,
            totalAmount: payload.totalAmount,
            reminderMinutes: minutes,
            alertKind: "reminder",
          },
          ...(Platform.OS === "android" ? { channelId: "vendor-orders" } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: minutes * 60,
        },
      });
    }
  } catch {
    // Scheduled reminders are best-effort on this device.
  }
}

export async function cancelVendorOrderReminders(orderId: string) {
  const state = await readState();
  delete state[orderId];
  await writeState(state);

  if (isExpoGo || Platform.OS === "web") {
    return;
  }

  try {
    const Notifications = await import("expo-notifications");
    await Promise.all(
      REMINDER_TIERS_MINUTES.map((minutes) =>
        Notifications.cancelScheduledNotificationAsync(
          reminderNotificationId(orderId, minutes),
        ),
      ),
    );
  } catch {
    // Ignore cancellation failures.
  }
}

export async function syncVendorOrderReminderState(orders: VendorOrder[]) {
  const activeIds = new Set(
    orders.filter((order) => ACTIVE_STATUSES.has(order.status)).map((order) => order.id),
  );

  const state = await readState();
  let changed = false;

  for (const orderId of Object.keys(state)) {
    if (!activeIds.has(orderId)) {
      delete state[orderId];
      changed = true;
      await cancelVendorOrderReminders(orderId);
    }
  }

  if (changed) {
    await writeState(state);
  }
}

export async function findDueForegroundReminders(
  orders: VendorOrder[],
): Promise<VendorOrderAlertPayload[]> {
  const now = Date.now();
  const state = await readState();
  const due: VendorOrderAlertPayload[] = [];

  for (const order of orders) {
    if (!ACTIVE_STATUSES.has(order.status)) {
      continue;
    }

    const entry = state[order.id];
    if (!entry || entry.acknowledgedAt) {
      continue;
    }

    const ageMinutes = (now - entry.firstSeenAt) / 60_000;

    for (const minutes of REMINDER_TIERS_MINUTES) {
      if (ageMinutes < minutes || entry.sentTiers.includes(minutes)) {
        continue;
      }

      entry.sentTiers.push(minutes);
      due.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        productCount: order.productCount,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        kind: "reminder",
        reminderMinutes: minutes,
      });
      break;
    }
  }

  await writeState(state);
  return due;
}

export function vendorOrderAlertToPayload(order: VendorOrder): VendorOrderAlertPayload {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    productCount: order.productCount,
    totalAmount: order.totalAmount,
    customerName: order.customerName,
    kind: "new",
  };
}
