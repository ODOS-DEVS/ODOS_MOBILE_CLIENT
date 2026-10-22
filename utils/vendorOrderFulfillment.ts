import type { VendorOrder, VendorOrderQueueTab, VendorOrderStatus } from "@/types/store";

// "out_for_delivery" is deliberately not mapped to "delivered": the customer
// confirms delivery themselves in their own app (or it auto-releases after a
// grace window) — a vendor can't self-certify a handoff they have every
// incentive to claim happened.
export const VENDOR_ORDER_NEXT_STATUS: Partial<
  Record<VendorOrderStatus, VendorOrderStatus>
> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "ready",
  ready: "out_for_delivery",
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
    return `${minutes}m waiting`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainder = minutes % 60;
    return remainder > 0 ? `${hours}h ${remainder}m waiting` : `${hours}h waiting`;
  }

  // Past a day, hours stop being readable: "Waiting 758h 27m" is a number
  // nobody converts in their head. Days, then weeks, is what a late order
  // actually means to the person looking at it.
  const days = Math.floor(hours / 24);
  if (days < 14) {
    const remainderHours = hours % 24;
    return remainderHours > 0 ? `${days}d ${remainderHours}h waiting` : `${days}d waiting`;
  }
  return `${Math.floor(days / 7)}w waiting`;
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
  if (tab === "overdue") {
    return filterVendorOrdersOverdue(orders);
  }

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
    overdue: countVendorOrdersOverdue(orders),
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

/** Short imperative for the next step, for a button on a row. */
const VENDOR_ORDER_ACTION_LABELS: Partial<Record<VendorOrderStatus, string>> = {
  pending: "Confirm",
  confirmed: "Start prep",
  processing: "Mark ready",
  ready: "Dispatch",
};

export function getVendorOrderNextActionLabel(status: VendorOrderStatus) {
  return VENDOR_ORDER_ACTION_LABELS[status] ?? null;
}

export function normalizePhoneForDialer(phone?: string | null) {
  if (!phone?.trim()) {
    return null;
  }
  const digits = phone.replace(/[^\d+]/g, "");
  return digits || null;
}


/**
 * Minutes an unfulfilled order may wait before it counts as overdue.
 *
 * Matches the "danger" threshold `getVendorOrderSlaTone` already uses, so the
 * red tone on a card and its presence in the Overdue queue always agree.
 */
export const VENDOR_ORDER_OVERDUE_MINUTES = 45;

/**
 * Orders the vendor is late on.
 *
 * The queue tabs answer "where is this order in the flow". They cannot answer
 * "which of these is going cold" — a confirmed order sitting untouched for
 * three hours looks identical to one confirmed a minute ago once there are
 * eighty of them on screen. Done orders are excluded: nothing can be late
 * about an order that already arrived or was cancelled.
 */
export function isVendorOrderOverdue(order: VendorOrder, now = Date.now()) {
  if (DONE_STATUSES.has(order.status)) {
    return false;
  }
  return getVendorOrderWaitMinutes(order, now) >= VENDOR_ORDER_OVERDUE_MINUTES;
}

export function filterVendorOrdersOverdue(orders: VendorOrder[], now = Date.now()) {
  return orders
    .filter((order) => isVendorOrderOverdue(order, now))
    // Longest wait first — the one costing the most goodwill leads.
    .sort((a, b) => getVendorOrderAnchorTime(a) - getVendorOrderAnchorTime(b));
}

export function countVendorOrdersOverdue(orders: VendorOrder[], now = Date.now()) {
  return orders.reduce(
    (total, order) => total + (isVendorOrderOverdue(order, now) ? 1 : 0),
    0,
  );
}

export type VendorOrderSort = "oldest" | "newest" | "value_high";

export const VENDOR_ORDER_SORTS: { value: VendorOrderSort; label: string }[] = [
  { value: "oldest", label: "Longest waiting" },
  { value: "newest", label: "Most recent" },
  { value: "value_high", label: "Highest value" },
];

export function formatVendorOrderSortLabel(sort: VendorOrderSort) {
  return VENDOR_ORDER_SORTS.find((option) => option.value === sort)?.label ?? "Sort";
}

export function sortVendorOrders(orders: VendorOrder[], sort: VendorOrderSort) {
  const sorted = [...orders];
  if (sort === "newest") {
    return sorted.sort(
      (a, b) => getVendorOrderAnchorTime(b) - getVendorOrderAnchorTime(a),
    );
  }
  if (sort === "value_high") {
    return sorted.sort((a, b) => b.totalAmount - a.totalAmount);
  }
  return sorted.sort(
    (a, b) => getVendorOrderAnchorTime(a) - getVendorOrderAnchorTime(b),
  );
}

/**
 * What the vendor actually receives for an order.
 *
 * `totalAmount` is what the shopper paid, which is not what lands in the
 * vendor's wallet once commission is taken. Showing only the gross figure
 * across the fulfilment queue overstates every order, so the row and the
 * day's takings both resolve the net through here.
 *
 * Falls back to gross-minus-commission, then to the total, because older
 * orders predate the settlement fields and must still render a number rather
 * than a blank.
 */
export function getVendorOrderNetAmount(order: VendorOrder) {
  if (typeof order.netAmount === "number" && Number.isFinite(order.netAmount)) {
    return order.netAmount;
  }
  const gross =
    typeof order.grossAmount === "number" && Number.isFinite(order.grossAmount)
      ? order.grossAmount
      : order.totalAmount;
  const commission =
    typeof order.commissionAmount === "number" && Number.isFinite(order.commissionAmount)
      ? order.commissionAmount
      : 0;
  return Math.max(0, gross - commission);
}

/** True when the order has a next step the vendor can take themselves. */
export function canAdvanceVendorOrder(status: VendorOrderStatus) {
  return VENDOR_ORDER_NEXT_STATUS[status] !== undefined;
}

/**
 * Orders that can all be moved one step by a single bulk action.
 *
 * Grouped by *current* status rather than advanced individually, because
 * "confirm these six" is a coherent instruction while "advance these six",
 * across a mix of statuses, would scatter them through the pipeline and leave
 * the vendor unable to say what they just did.
 */
export function groupVendorOrdersByAdvanceableStatus(orders: VendorOrder[]) {
  const groups = new Map<VendorOrderStatus, VendorOrder[]>();
  for (const order of orders) {
    if (!canAdvanceVendorOrder(order.status)) {
      continue;
    }
    const existing = groups.get(order.status);
    if (existing) {
      existing.push(order);
    } else {
      groups.set(order.status, [order]);
    }
  }
  return groups;
}

export function countVendorOrderItems(order: VendorOrder) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * A plain-text picking list for one order.
 *
 * Text rather than a rendered PDF because the job it serves is physical: the
 * vendor is standing at a shelf with a phone, and needs the lines, the
 * quantities and the variants in a form they can read at arm's length, paste
 * into WhatsApp for a packer, or send to a thermal printer app.
 *
 * Variants are spelled out next to their line — a box packed with the wrong
 * size is a return, and the size is the one field most easily lost between
 * the order screen and the shelf.
 */
export function buildVendorPackingSlip(order: VendorOrder) {
  const lines: string[] = [];

  lines.push(`ORDER ${order.orderNumber}`);
  if (order.customerName) {
    lines.push(order.customerName);
  }
  if (order.customerPhone) {
    lines.push(order.customerPhone);
  }

  const address = formatVendorOrderAddress(order);
  if (address) {
    lines.push(address);
  }
  lines.push(formatVendorDeliveryMethod(order.deliveryMethod));
  if (order.deliveryInstructions?.trim()) {
    lines.push(`Note: ${order.deliveryInstructions.trim()}`);
  }

  lines.push("");
  lines.push("ITEMS");
  for (const item of order.items) {
    const variant = [item.selectedSize, item.selectedColor].filter(Boolean).join(" / ");
    lines.push(
      `${item.quantity} x ${item.title}${variant ? ` (${variant})` : ""}`,
    );
  }

  lines.push("");
  lines.push(`${countVendorOrderItems(order)} item(s)`);
  lines.push(`Customer paid ${order.totalAmount.toFixed(2)}`);
  lines.push(`Your payout ${getVendorOrderNetAmount(order).toFixed(2)}`);

  return lines.join("\n");
}
