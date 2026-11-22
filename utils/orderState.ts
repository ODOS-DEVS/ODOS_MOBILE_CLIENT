import type { Order } from "@/hooks/useOrders";

/**
 * What an order's four state fields mean, said in words a shopper can act on.
 *
 * The API keeps `status`, `payment_status`, `cancellation_status` and
 * `refund_status` separate because they are separate facts. This turns the
 * combination into one honest sentence — never a raw column, and never a claim
 * that outruns what has actually happened. An order cancelled with its money
 * still in transit says exactly that.
 *
 * Mirrors `libs/order-state.ts` in web_odos; keep the two in step.
 */

export type OrderTone = "pending" | "active" | "good" | "warning" | "dead";

export type OrderStateCopy = {
  label: string;
  detail: string;
  tone: OrderTone;
};

const norm = (value?: string | null) => (value ?? "").trim().toLowerCase();

/**
 * Whether ODOS actually holds the money. Matches the API's
 * PAID_PAYMENT_STATUSES set rather than testing for "paid" alone, because the
 * gateway's wording has varied.
 */
export const orderIsPaid = (order: Order) =>
  ["paid", "success", "successful"].includes(norm(order.payment_status));

const CANCEL_REASONS: Record<string, string> = {
  ordered_by_mistake: "Ordered by mistake",
  found_better_price: "Found a better price",
  changed_my_mind: "Changed my mind",
  wrong_product: "Wrong product selected",
  wrong_delivery_details: "Incorrect delivery details",
  taking_too_long: "Delivery taking too long",
  duplicate_order: "Duplicate order",
  out_of_stock: "Out of stock",
  product_unavailable: "Product unavailable",
  listing_error: "Listing was incorrect",
  cannot_fulfil: "Seller could not fulfil it",
  other: "Other",
};

export const cancellationReasonLabel = (code?: string | null) =>
  code ? (CANCEL_REASONS[code] ?? code.replace(/_/g, " ")) : null;

/** Reasons a shopper can pick. Mirrors the API's CUSTOMER_REASONS set exactly. */
export const SHOPPER_CANCEL_REASONS: { value: string; label: string }[] = [
  { value: "changed_my_mind", label: "I changed my mind" },
  { value: "ordered_by_mistake", label: "I ordered this by mistake" },
  { value: "found_better_price", label: "I found a better price" },
  { value: "wrong_product", label: "I picked the wrong product" },
  { value: "wrong_delivery_details", label: "My delivery details are wrong" },
  { value: "taking_too_long", label: "It's taking too long" },
  { value: "duplicate_order", label: "I ordered this twice" },
  { value: "other", label: "Something else" },
];

/** Stages at which the vendor has not committed work. Mirrors BEFORE_VENDOR_ACCEPTS. */
const BEFORE_VENDOR_ACCEPTS = ["pending", ""];

/** Mirrors AFTER_DISPATCH. */
const AFTER_DISPATCH = ["out_for_delivery", "delivered"];

/**
 * The headline state. Order matters: the most consequential truth wins, so a
 * cancelled order never reads "processing" just because its fulfilment column
 * was never cleared.
 */
export function orderStateCopy(order: Order): OrderStateCopy {
  const status = norm(order.status);
  const cancellation = norm(order.cancellation_status);
  const refund = norm(order.refund_status) || "not_applicable";

  if (cancellation === "requested") {
    return {
      label: "Cancellation requested",
      detail:
        "We've received your request and it's being reviewed. We'll let you know as soon as there's a decision.",
      tone: "warning",
    };
  }

  if (status === "cancelled") {
    if (refund === "successful") {
      return {
        label: "Cancelled and refunded",
        detail: "This order was cancelled and your refund has been paid out.",
        tone: "dead",
      };
    }
    if (refund === "failed") {
      return {
        label: "Cancelled · refund needs attention",
        detail:
          "This order was cancelled but your refund didn't go through. We're looking into it and will be in touch.",
        tone: "warning",
      };
    }
    if (refund !== "not_applicable") {
      return {
        label: "Cancelled · refund on the way",
        detail:
          "This order was cancelled. Your refund has been started and we'll confirm here once the money has been sent.",
        tone: "warning",
      };
    }
    return {
      label: "Cancelled",
      detail: "This order was cancelled. Nothing was charged.",
      tone: "dead",
    };
  }

  if (status === "expired") {
    return {
      label: "Expired",
      detail:
        "This order expired because payment wasn't completed in time. Nothing was charged — you can order again any time.",
      tone: "dead",
    };
  }

  if (status === "payment_failed" || norm(order.payment_status) === "failed") {
    return {
      label: "Payment failed",
      detail: "Your payment didn't go through, so this order was never confirmed. You can try again.",
      tone: "dead",
    };
  }

  if (status === "pending_payment") {
    if (norm(order.payment_status) === "pending") {
      return {
        label: "Checking your payment",
        detail:
          "We're confirming your payment with the provider. Please don't pay again — we'll update this order as soon as we hear back.",
        tone: "pending",
      };
    }
    return {
      label: "Awaiting payment",
      detail:
        "We have your order details, but payment hasn't been completed — so this order isn't confirmed yet.",
      tone: "pending",
    };
  }

  if (status === "delivered" || status === "completed") {
    return { label: "Delivered", detail: "This order has been delivered.", tone: "good" };
  }

  // Alive and paid for: the vendor stage is the most useful thing to say.
  const stage = norm(order.vendor_status) || "pending";
  const STAGE: Record<string, { label: string; detail: string; tone: OrderTone }> = {
    pending: {
      label: "Confirmed",
      detail: "Your payment is confirmed. The seller has the order and hasn't accepted it yet.",
      tone: "active",
    },
    confirmed: {
      label: "Accepted",
      detail: "The seller has accepted your order and will start preparing it.",
      tone: "active",
    },
    processing: {
      label: "Being prepared",
      detail: "The seller is packing your order now.",
      tone: "active",
    },
    ready: {
      label: "Ready to go",
      detail: "Your order is packed and waiting to be picked up for delivery.",
      tone: "active",
    },
    out_for_delivery: {
      label: "On its way",
      detail: "Your order has left the seller and is on its way to you.",
      tone: "active",
    },
  };
  return (
    STAGE[stage] ?? {
      label: "In progress",
      detail: "Your payment is confirmed and the seller is working on your order.",
      tone: "active",
    }
  );
}

export type Cancellability = {
  can: boolean;
  /** Why not — or, when `can`, what will actually happen. Null when nothing needs saying. */
  reason: string | null;
  /** True when the request goes to the seller or waits on the payment provider. */
  requiresReview: boolean;
};

/**
 * Whether the shopper may ask to cancel, and whether saying yes ends the order
 * or only files a request.
 *
 * Mirrors `can_request_cancellation` in `app/services/order_state_service.py`
 * clause for clause, reading the same order-level `vendor_status` the server
 * reads — so the button never appears on an order the API will refuse, and
 * never promises an outright cancellation when the seller has to agree.
 */
export function cancellability(order: Order): Cancellability {
  const status = norm(order.status);
  const stage = norm(order.vendor_status) || "pending";
  const cancellation = norm(order.cancellation_status);

  if (cancellation === "requested") {
    return {
      can: false,
      reason: "A cancellation request for this order is already being reviewed.",
      requiresReview: false,
    };
  }
  if (cancellation === "completed" || status === "cancelled") {
    return { can: false, reason: null, requiresReview: false };
  }
  if (["expired", "payment_failed"].includes(status)) {
    return { can: false, reason: null, requiresReview: false };
  }

  if (AFTER_DISPATCH.includes(stage) || ["delivered", "completed"].includes(status)) {
    if (["delivered", "completed"].includes(status)) {
      return {
        can: false,
        reason: "This order has been delivered. Start a return instead and we'll refund you once it's back.",
        requiresReview: false,
      };
    }
    return {
      can: false,
      reason:
        "This order is already on its way. Contact support to try to intercept it, or refuse the delivery and we'll refund you.",
      requiresReview: false,
    };
  }

  // Payment in flight: the provider has been asked and hasn't answered, so the
  // server records the request and settles it once the outcome is known.
  if (status === "pending_payment" && norm(order.payment_status) === "pending") {
    return {
      can: true,
      reason:
        "Your payment is still being confirmed. We'll finish the cancellation as soon as we know the outcome.",
      requiresReview: true,
    };
  }

  if (!orderIsPaid(order)) {
    return { can: true, reason: null, requiresReview: false };
  }

  if (BEFORE_VENDOR_ACCEPTS.includes(stage)) {
    return { can: true, reason: null, requiresReview: false };
  }

  return {
    can: true,
    reason: "The seller has already started preparing this order, so they need to approve the cancellation.",
    requiresReview: true,
  };
}

/**
 * The payment in plain words.
 *
 * `payment_status` has historically held values that answer the wrong question
 * — "cancelled" says nothing about whether money moved — so nothing raw from
 * that column is ever shown to a shopper.
 */
export function paymentStateLabel(order: Order): string {
  const status = norm(order.payment_status);
  if (["paid", "success", "successful"].includes(status)) return "Paid";
  if (status === "failed") return "Payment failed";
  if (status === "expired") return "Payment window closed";
  if (status === "pending") return "Awaiting confirmation";
  if (status === "refunded") return "Refunded";
  return "Not paid";
}

/** A refund status in words. "Paid back" requires proof the money actually moved. */
export function refundStateLabel(refund: {
  status: string;
  confirmed_at?: string | null;
}): string {
  const status = norm(refund.status);
  if (status === "successful" && refund.confirmed_at) return "Paid back";
  if (status === "successful") return "Being sent";
  if (status === "failed") return "Didn't go through";
  if (status === "processing") return "Being sent";
  if (status === "approved") return "Approved";
  if (status === "pending") return "Being prepared";
  return "In progress";
}

/**
 * Whether the order is still going somewhere.
 *
 * Decided from the lifecycle rather than guessed at the call site, so the
 * "Processing" tab can't quietly drop an order into no tab at all — which is
 * what happened to `expired` and `payment_failed` orders when each screen
 * listed the statuses it happened to know about.
 */
export function isOrderLive(order: Order): boolean {
  const status = norm(order.status);
  return !["cancelled", "expired", "payment_failed", "delivered", "completed"].includes(status);
}

export function isOrderDelivered(order: Order): boolean {
  const status = norm(order.status);
  return ["delivered", "completed"].includes(status);
}

/**
 * Over without arriving: cancelled, expired, or the payment failed. Grouped
 * because a shopper looking for an order that didn't happen looks in one
 * place; each card still states which of the three it actually was.
 */
export function isOrderClosed(order: Order): boolean {
  return ["cancelled", "expired", "payment_failed"].includes(norm(order.status));
}
