import type { Order } from "@/hooks/useOrders";

export type OrderTimelineStepState = "done" | "active" | "pending" | "cancelled";

export type OrderTimelineStep = {
  key: string;
  title: string;
  caption: string;
  state: OrderTimelineStepState;
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

export function getOrderTimelineSteps(order: Order): OrderTimelineStep[] {
  const placedAt = formatOrderTimelineDate(order.placed_at);
  const deliveredAt = formatOrderTimelineDate(order.delivered_at);
  const cancelledAt = formatOrderTimelineDate(order.cancelled_at);

  if (order.status === "pending_payment") {
    return [
      {
        key: "placed",
        title: "Order reserved",
        caption: placedAt || "Your order has been created",
        state: "done",
      },
      {
        key: "payment",
        title: "Awaiting payment confirmation",
        caption:
          order.payment_status === "failed"
            ? "Payment failed, so preparation has not started."
            : "We’ll start preparing this order after payment clears.",
        state: "active",
      },
      {
        key: "processing",
        title: "Preparation starts",
        caption: "This begins once payment is verified.",
        state: "pending",
      },
    ];
  }

  if (order.status === "cancelled") {
    return [
      {
        key: "placed",
        title: "Order placed",
        caption: placedAt || "Your order was created",
        state: "done",
      },
      {
        key: "cancelled",
        title: "Order cancelled",
        caption: cancelledAt || order.cancellation_reason || "Cancelled by customer",
        state: "cancelled",
      },
    ];
  }

  if (order.status === "delivered") {
    return [
      {
        key: "placed",
        title: "Order placed",
        caption: placedAt || "Your order was created",
        state: "done",
      },
      {
        key: "processing",
        title: "Prepared for delivery",
        caption: "Packed and moved into delivery",
        state: "done",
      },
      {
        key: "delivered",
        title: "Delivered",
        caption: deliveredAt || "Delivered successfully",
        state: "done",
      },
    ];
  }

  return [
    {
      key: "placed",
      title: "Order placed",
      caption: placedAt || "Your order was created",
      state: "done",
    },
    {
      key: "processing",
      title: "Preparing your order",
      caption: order.tracking_eta || "We’re getting your items ready",
      state: (order.progress ?? 0) >= 0.9 ? "done" : "active",
    },
    {
      key: "out_for_delivery",
      title: "Out for delivery",
      caption:
        (order.progress ?? 0) >= 0.9 ||
        (order.tracking_eta ?? "").toLowerCase().includes("out for delivery")
          ? order.tracking_eta || "Your package is on the way"
          : "We’ll notify you when the courier is en route",
      state:
        (order.progress ?? 0) >= 0.9 ||
        (order.tracking_eta ?? "").toLowerCase().includes("out for delivery")
          ? "active"
          : "pending",
    },
    {
      key: "delivered",
      title: "Delivery confirmation",
      caption: "Confirm once the package arrives",
      state: "pending",
    },
  ];
}

export function getActiveOrderTimelineStep(order: Order): OrderTimelineStep | null {
  const steps = getOrderTimelineSteps(order);
  return (
    [...steps].reverse().find((step) => step.state === "active" || step.state === "done") ??
    steps[0] ??
    null
  );
}
