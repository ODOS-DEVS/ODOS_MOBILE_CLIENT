export type VendorOrderAlertKind = "new" | "reminder";

export type VendorOrderAlertPayload = {
  orderId: string;
  orderNumber: string;
  productCount: number;
  totalAmount: number;
  customerName?: string | null;
  kind?: VendorOrderAlertKind;
  reminderMinutes?: number;
};

type VendorOrderAlertListener = (payload: VendorOrderAlertPayload) => void;

const listeners = new Set<VendorOrderAlertListener>();
const NEW_ORDER_COOLDOWN_MS = 12_000;
const REMINDER_COOLDOWN_MS = 60_000;
const recentAlertKeys = new Map<string, number>();

function buildAlertDedupeKey(payload: VendorOrderAlertPayload) {
  return `${payload.orderId}:${payload.kind ?? "new"}:${payload.reminderMinutes ?? 0}`;
}

export function shouldEmitVendorOrderAlert(payload: VendorOrderAlertPayload) {
  const cooldownKey = buildAlertDedupeKey(payload);
  const cooldownMs =
    payload.kind === "reminder" ? REMINDER_COOLDOWN_MS : NEW_ORDER_COOLDOWN_MS;
  const now = Date.now();
  const lastSeen = recentAlertKeys.get(cooldownKey) ?? 0;

  if (now - lastSeen < cooldownMs) {
    return false;
  }

  recentAlertKeys.set(cooldownKey, now);
  return true;
}

export function subscribeVendorOrderAlerts(listener: VendorOrderAlertListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitVendorOrderAlert(payload: VendorOrderAlertPayload) {
  if (!shouldEmitVendorOrderAlert(payload)) {
    return;
  }

  listeners.forEach((listener) => {
    listener(payload);
  });
}

export function vendorOrderAlertFromPushData(
  data: Record<string, unknown>,
): VendorOrderAlertPayload | null {
  const orderId =
    readString(data.orderId) ?? readString(data.routeTargetId) ?? null;
  const orderNumber = readString(data.orderNumber);

  if (!orderId || !orderNumber) {
    return null;
  }

  const pushType = readString(data.type);
  const alertKind =
    readString(data.alertKind) === "reminder" || pushType === "vendor_order_reminder"
      ? "reminder"
      : "new";

  return {
    orderId,
    orderNumber,
    productCount: readNumber(data.productCount) ?? 1,
    totalAmount: readNumber(data.totalAmount) ?? 0,
    customerName: readString(data.customerName),
    kind: alertKind,
    reminderMinutes: readNumber(data.reminderMinutes) ?? undefined,
  };
}

export function vendorOrderAlertFromRealtimePayload(
  payload: Record<string, unknown>,
): VendorOrderAlertPayload | null {
  const orderId = readString(payload.id);
  const orderNumber = readString(payload.order_number);

  if (!orderId || !orderNumber) {
    return null;
  }

  return {
    orderId,
    orderNumber,
    productCount: readNumber(payload.product_count) ?? 1,
    totalAmount: readNumber(payload.total_amount) ?? 0,
    customerName: readString(payload.customer_name),
    kind: "new",
  };
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
