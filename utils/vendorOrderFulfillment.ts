import type { VendorOrder, VendorOrderQueueTab, VendorOrderStatus } from "@/types/store";

export const VENDOR_ORDER_NEXT_STATUS: Partial<
  Record<VendorOrderStatus, VendorOrderStatus>
> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered",
};

export const VENDOR_ORDER_STATUS_LABELS: Record<VendorOrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const VENDOR_ORDER_TIMELINE: VendorOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const NEW_STATUSES = new Set<VendorOrderStatus>(["pending", "confirmed"]);
const ACTIVE_STATUSES = new Set<VendorOrderStatus>([
  "processing",
  "ready",
  "out_for_delivery",
]);
const DONE_STATUSES = new Set<VendorOrderStatus>(["delivered", "cancelled"]);

export function formatVendorOrderStatus(status: VendorOrderStatus) {
  return VENDOR_ORDER_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function getVendorOrderAnchorTime(order: VendorOrder) {
  const paidAt = order.paidAt ? Date.parse(order.paidAt) : Number.NaN;
  if (Number.isFinite(paidAt)) {
    return paidAt;
  }
  const placedAt = order.placedAt ? Date.parse(order.placedAt) : Number.NaN;
  if (Number.isFinite(placedAt)) {
    return placedAt;
  }
  return Date.parse(order.createdAt) || Date.now();
}

export function getVendorOrderWaitMinutes(order: VendorOrder, now = Date.now()) {
  return Math.max(0, Math.floor((now - getVendorOrderAnchorTime(order)) / 60_000));
}

export function formatVendorOrderWaitLabel(order: VendorOrder, now = Date.now()) {
  const minutes = getVendorOrderWaitMinutes(order, now);
  if (minutes < 1) {
    return "Just placed";
  }
  if (minutes < 60) {
    return `Waiting ${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `Waiting ${hours}h ${remainder}m` : `Waiting ${hours}h`;
}

export function getVendorOrderSlaTone(order: VendorOrder, now = Date.now()) {
  const minutes = getVendorOrderWaitMinutes(order, now);
  if (order.status === "delivered" || order.status === "cancelled") {
    return "neutral" as const;
  }
  if (minutes >= 45) {
    return "danger" as const;
  }
  if (minutes >= 15) {
    return "warning" as const;
  }
  return "info" as const;
}

export function formatVendorDeliveryMethod(method?: string | null) {
  if (!method) {
    return "Standard delivery";
  }
  if (method === "express") {
    return "Express delivery";
  }
  if (method === "economy") {
    return "Economy delivery";
  }
  return method.replace(/_/g, " ");
}

export function formatVendorOrderAddress(order: VendorOrder) {
  return [order.addressStreet, order.addressCity, order.addressRegion]
    .filter(Boolean)
    .join(", ");
}

export function filterVendorOrdersByQueue(
  orders: VendorOrder[],
  tab: VendorOrderQueueTab,
) {
  const filtered = orders.filter((order) => {
    if (tab === "new") {
      return NEW_STATUSES.has(order.status);
    }
    if (tab === "active") {
      return ACTIVE_STATUSES.has(order.status);
    }
    return DONE_STATUSES.has(order.status);
  });

  if (tab === "done") {
    return filtered.sort(
      (a, b) => getVendorOrderAnchorTime(b) - getVendorOrderAnchorTime(a),
    );
  }

  return filtered.sort(
    (a, b) => getVendorOrderAnchorTime(a) - getVendorOrderAnchorTime(b),
  );
}

export function countVendorOrdersByQueue(orders: VendorOrder[]) {
  return {
    new: orders.filter((order) => NEW_STATUSES.has(order.status)).length,
    active: orders.filter((order) => ACTIVE_STATUSES.has(order.status)).length,
    done: orders.filter((order) => DONE_STATUSES.has(order.status)).length,
  };
}

export function canCancelVendorOrder(status: VendorOrderStatus) {
  return status === "pending" || status === "confirmed";
}

export function canAcknowledgeVendorOrder(status: VendorOrderStatus) {
  return NEW_STATUSES.has(status);
}

export function getVendorOrderNextActionLabel(status: VendorOrderStatus) {
  const next = VENDOR_ORDER_NEXT_STATUS[status];
  if (!next) {
    return null;
  }
  return `Mark ${formatVendorOrderStatus(next).toLowerCase()}`;
}

export function normalizePhoneForDialer(phone?: string | null) {
  if (!phone?.trim()) {
    return null;
  }
  const digits = phone.replace(/[^\d+]/g, "");
  return digits || null;
}
