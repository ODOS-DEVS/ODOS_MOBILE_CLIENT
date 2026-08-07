import type { Order, OrderStatusEvent, OrderTimelineStage } from "@/hooks/useOrders";

export type OrderTimelineStepState = "done" | "active" | "pending" | "cancelled";

export type OrderTimelineStep = {
  key: string;
  title: string;
  caption: string;
  state: OrderTimelineStepState;
  timestamp: string | null;
};

// The full forward path a normal (non-cancelled) order walks through.
// "pending" has no backend event of its own — it's the implicit starting
// vendor_status the moment payment clears — everything else is sourced
// straight from order.timeline (app/services/order_timeline_service.py on
// the backend is the single source of truth these labels mirror).
const STAGE_SEQUENCE: OrderTimelineStage[] = [
  "pending_payment",
  "payment_confirmed",
  "pending",
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const STAGE_RANK: Record<string, number> = STAGE_SEQUENCE.reduce(
  (map, stage, index) => ({ ...map, [stage]: index }),
  {} as Record<string, number>,
);

const STAGE_TITLES: Record<string, string> = {
  pending_payment: "Order placed",
  payment_confirmed: "Payment confirmed",
  pending: "Order received",
  confirmed: "Confirmed by seller",
  processing: "Preparing your order",
  ready: "Ready for handoff",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

const STAGE_UPCOMING_CAPTIONS: Record<string, string> = {
  payment_confirmed: "We'll start once payment clears",
  pending: "We've received your order",
  confirmed: "The seller will confirm your order shortly",
  processing: "This begins once your order is confirmed",
  ready: "Packed and ready to hand off",
  out_for_delivery: "We'll notify you the moment it's on the way",
  delivered: "Confirm (or share your delivery code) once it arrives",
};

const STAGE_ACTIVE_CAPTIONS: Record<string, string> = {
  pending: "The seller has been notified and will confirm shortly",
  confirmed: "The seller has confirmed and will start preparing soon",
};

export function formatOrderTimelineDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function findEvent(events: OrderStatusEvent[], stage: string): OrderStatusEvent | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (events[i].status === stage) {
      return events[i];
    }
  }
  return null;
}

// Orders created before this feature shipped won't have any timeline rows —
// fall back to the coarse progress/ETA heuristic rather than render nothing.
function getLegacyOrderTimelineSteps(order: Order): OrderTimelineStep[] {
  const placedAt = formatOrderTimelineDate(order.placed_at);
  const processingDone = (order.progress ?? 0) >= 0.9;
  const outForDeliveryActive =
    (order.progress ?? 0) >= 0.9 ||
    (order.tracking_eta ?? "").toLowerCase().includes("out for delivery");

  return [
    { key: "placed", title: "Order placed", caption: placedAt || "Your order was created", state: "done", timestamp: order.placed_at },
    {
      key: "processing",
      title: "Preparing your order",
      caption: order.tracking_eta || "We're getting your items ready",
      state: processingDone ? "done" : "active",
      timestamp: null,
    },
    {
      key: "out_for_delivery",
      title: "Out for delivery",
      caption: outForDeliveryActive ? order.tracking_eta || "Your package is on the way" : "We'll notify you when it's en route",
      state: outForDeliveryActive ? "active" : "pending",
      timestamp: null,
    },
    { key: "delivered", title: "Delivery confirmation", caption: "Confirm once the package arrives", state: "pending", timestamp: null },
  ];
}

export function getOrderTimelineSteps(order: Order): OrderTimelineStep[] {
  const events = order.timeline ?? [];
  const cancelEvent = findEvent(events, "cancelled");

  if (order.status === "cancelled" || cancelEvent) {
    const placedEvent = findEvent(events, "pending_payment");
    return [
      {
        key: "placed",
        title: "Order placed",
        caption: formatOrderTimelineDate(placedEvent?.occurred_at ?? order.placed_at) || "Your order was created",
        state: "done",
        timestamp: placedEvent?.occurred_at ?? order.placed_at,
      },
      {
        key: "cancelled",
        title: "Order cancelled",
        caption:
          formatOrderTimelineDate(cancelEvent?.occurred_at ?? order.cancelled_at) ||
          order.cancellation_reason ||
          "Cancelled",
        state: "cancelled",
        timestamp: cancelEvent?.occurred_at ?? order.cancelled_at,
      },
    ];
  }

  if (events.length === 0) {
    return getLegacyOrderTimelineSteps(order);
  }

  const currentStageKey = order.status === "pending_payment" ? "pending_payment" : order.vendor_status;
  const currentRank =
    currentStageKey === "delivered"
      ? Number.POSITIVE_INFINITY
      : (STAGE_RANK[currentStageKey] ?? STAGE_RANK.pending);

  return STAGE_SEQUENCE.map((stage) => {
    const event = findEvent(events, stage);
    const rank = STAGE_RANK[stage];
    const state: OrderTimelineStepState = rank < currentRank ? "done" : rank === currentRank ? "active" : "pending";

    let caption: string;
    if (event) {
      caption = formatOrderTimelineDate(event.occurred_at) || STAGE_TITLES[stage];
    } else if (state === "active") {
      caption = order.tracking_eta || STAGE_ACTIVE_CAPTIONS[stage] || STAGE_UPCOMING_CAPTIONS[stage] || "In progress";
    } else {
      caption = STAGE_UPCOMING_CAPTIONS[stage] || "";
    }

    return {
      key: stage,
      title: STAGE_TITLES[stage],
      caption,
      state,
      timestamp: event?.occurred_at ?? null,
    };
  }).filter((step) => step.key !== "payment_confirmed" || step.state === "done");
  // "Payment confirmed" is a blink-and-you-miss-it instant, not a stage anyone
  // actually waits in — only worth showing once it has really happened.
}

export function getActiveOrderTimelineStep(order: Order): OrderTimelineStep | null {
  const steps = getOrderTimelineSteps(order);
  return (
    [...steps].reverse().find((step) => step.state === "active" || step.state === "done") ??
    steps[0] ??
    null
  );
}
