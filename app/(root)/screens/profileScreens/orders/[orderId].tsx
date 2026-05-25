import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountActionButton,
  AccountBadge,
  AccountEmptyState,
  AccountListCard,
  AccountSectionCard,
  accountStyles,
  formatOrderMoney,
  getOrderLineItemImage,
  OrderProgressBar,
  OrderSummaryRow,
  orderStyles,
} from "@/components/orders/OrderUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import TextInputField from "@/components/TextInputField";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Order, OrderItem, ReturnRequest, useOrder, useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function getStatusTone(order: Order): "success" | "danger" | "warning" | "info" {
  if (order.status === "pending_payment") {
    return "warning";
  }
  if (order.status === "delivered") {
    return "success";
  }
  if (order.status === "cancelled") {
    return "danger";
  }
  return "info";
}

function getStatusMeta(order: Order) {
  if (order.status === "pending_payment") {
    return {
      label: "Awaiting Payment",
      backgroundColor: "#FEF3C7",
      textColor: "#B45309",
      helperText:
        order.payment_status === "failed"
          ? "Payment was not completed successfully."
          : "We’re waiting for secure payment confirmation before preparation starts.",
    };
  }

  if (order.status === "delivered") {
    return {
      label: "Delivered",
      backgroundColor: "#DCFCE7",
      textColor: "#166534",
      helperText: order.delivered_at
        ? `Delivered on ${new Date(order.delivered_at).toLocaleDateString()}`
        : "Delivered successfully",
    };
  }

  if (order.status === "cancelled") {
    return {
      label: "Cancelled",
      backgroundColor: "#FEE2E2",
      textColor: "#B91C1C",
      helperText: order.cancellation_reason || "Cancelled by customer",
    };
  }

  return {
    label: "Processing",
    backgroundColor: "#DBEAFE",
    textColor: "#1D4ED8",
    helperText: order.tracking_eta || "Estimated delivery in 2–3 days",
  };
}

function formatTimelineDate(value?: string | null) {
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

function getTimelineSteps(order: Order) {
  const placedAt = formatTimelineDate(order.placed_at);
  const deliveredAt = formatTimelineDate(order.delivered_at);
  const cancelledAt = formatTimelineDate(order.cancelled_at);

  if (order.status === "pending_payment") {
    return [
      {
        key: "placed",
        title: "Order reserved",
        caption: placedAt || "Your order has been created",
        state: "done" as const,
      },
      {
        key: "payment",
        title: "Awaiting payment confirmation",
        caption:
          order.payment_status === "failed"
            ? "Payment failed, so preparation has not started."
            : "We’ll start preparing this order after payment clears.",
        state: "active" as const,
      },
      {
        key: "processing",
        title: "Preparation starts",
        caption: "This begins once payment is verified.",
        state: "pending" as const,
      },
    ];
  }

  if (order.status === "cancelled") {
    return [
      {
        key: "placed",
        title: "Order placed",
        caption: placedAt || "Your order was created",
        state: "done" as const,
      },
      {
        key: "cancelled",
        title: "Order cancelled",
        caption: cancelledAt || order.cancellation_reason || "Cancelled by customer",
        state: "cancelled" as const,
      },
    ];
  }

  if (order.status === "delivered") {
    return [
      {
        key: "placed",
        title: "Order placed",
        caption: placedAt || "Your order was created",
        state: "done" as const,
      },
      {
        key: "processing",
        title: "Prepared for delivery",
        caption: "Packed and moved into delivery",
        state: "done" as const,
      },
      {
        key: "delivered",
        title: "Delivered",
        caption: deliveredAt || "Delivered successfully",
        state: "done" as const,
      },
    ];
  }

  return [
    {
      key: "placed",
      title: "Order placed",
      caption: placedAt || "Your order was created",
      state: "done" as const,
    },
    {
      key: "processing",
      title: "Preparing delivery",
      caption: order.tracking_eta || "We’re getting your items ready",
      state: "active" as const,
    },
    {
      key: "delivered",
      title: "Delivery confirmation",
      caption: "Confirm once the package arrives",
      state: "pending" as const,
    },
  ];
}

const OPEN_RETURN_STATUSES = new Set(["requested", "under_review", "approved"]);

function getReturnStatusMeta(status: ReturnRequest["status"]) {
  switch (status) {
    case "requested":
      return {
        label: "Requested",
        backgroundColor: "#FEF3C7",
        textColor: "#92400E",
      };
    case "under_review":
      return {
        label: "Under Review",
        backgroundColor: "#DBEAFE",
        textColor: "#1D4ED8",
      };
    case "approved":
      return {
        label: "Approved",
        backgroundColor: "#DCFCE7",
        textColor: "#166534",
      };
    case "rejected":
      return {
        label: "Declined",
        backgroundColor: "#FEE2E2",
        textColor: "#B91C1C",
      };
    case "refunded":
      return {
        label: "Refunded",
        backgroundColor: "#DCFCE7",
        textColor: "#166534",
      };
    case "exchanged":
      return {
        label: "Exchanged",
        backgroundColor: "#EDE9FE",
        textColor: "#6D28D9",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        backgroundColor: "#EEF2F6",
        textColor: AppColors.secondary,
      };
  }
}

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const orderId = getParam(params.orderId) ?? "";
  const { order, isLoadingOrder, refreshOrder } = useOrder(orderId);
  const { cancelOrder, confirmDelivery, createReturnRequest, removeOrder, isMutatingOrder } =
    useOrders();
  const { addItemsToCart } = useCart();
  const { showToast } = useToast();
  const { reviews: savedReviews } = useReviews();
  const reviewedItemKeys = React.useMemo(
    () => new Set(savedReviews.map((review) => `${review.orderId}:${review.productId}`)),
    [savedReviews],
  );
  const [returnTargetItem, setReturnTargetItem] = React.useState<OrderItem | null>(null);
  const [returnType, setReturnType] = React.useState<"refund" | "exchange" | "return">("refund");
  const [returnQuantity, setReturnQuantity] = React.useState(1);
  const [returnReason, setReturnReason] = React.useState("");
  const [returnDetails, setReturnDetails] = React.useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = React.useState(false);

  const latestReturnRequestsByItem = React.useMemo(() => {
    if (!order) {
      return new Map<string, ReturnRequest>();
    }

    const grouped = new Map<string, ReturnRequest>();
    for (const request of order.return_requests) {
      const existing = grouped.get(request.order_item_id);
      if (!existing) {
        grouped.set(request.order_item_id, request);
        continue;
      }

      if (new Date(request.created_at).getTime() > new Date(existing.created_at).getTime()) {
        grouped.set(request.order_item_id, request);
      }
    }

    return grouped;
  }, [order]);

  const handleError = (message: string) => {
    Alert.alert("Something went wrong", message);
  };

  const closeReturnModal = (force = false) => {
    if (isSubmittingReturn && !force) {
      return;
    }

    setReturnTargetItem(null);
    setReturnType("refund");
    setReturnQuantity(1);
    setReturnReason("");
    setReturnDetails("");
  };

  const openReturnModal = (item: OrderItem) => {
    setReturnTargetItem(item);
    setReturnType("refund");
    setReturnQuantity(1);
    setReturnReason("");
    setReturnDetails("");
  };

  const handleConfirmDelivery = async () => {
    if (!order) {
      return;
    }

    try {
      await confirmDelivery(order.id);
      await refreshOrder();
      Alert.alert(
        "Order delivered",
        "Nice — this order has been moved to your delivered list.",
      );
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "We couldn't update the delivery status right now.",
      );
    }
  };

  const handleCancelOrder = async () => {
    if (!order) {
      return;
    }

    try {
      await cancelOrder(order.id);
      router.replace({
        pathname: "/(root)/screens/profileScreens/orders" as any,
        params: { tab: "cancelled" },
      });
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "We couldn't cancel this order right now.",
      );
    }
  };

  const handleRemoveOrder = async () => {
    if (!order) {
      return;
    }

    try {
      await removeOrder(order.id);
      router.replace("/(root)/screens/profileScreens/orders" as any);
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "We couldn't remove this order right now.",
      );
    }
  };

  const handleReorder = async () => {
    if (!order || order.items.length === 0) {
      handleError("This order doesn't have any items available to reorder.");
      return;
    }

    try {
      await addItemsToCart(
        order.items.map((item) => ({
          id: item.product_id,
          title: item.title,
          category: item.category ?? undefined,
          price: item.unit_price,
          image: item.image_url ? { uri: item.image_url } : undefined,
          imageKey: item.image_key ?? undefined,
          quantity: item.quantity,
        })),
      );
      showToast("Items added back to cart.");
      router.replace("/(root)/(tabs)/cart" as any);
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "We couldn't add these items back to your cart right now.",
      );
    }
  };

  const handleSubmitReturnRequest = async () => {
    if (!order || !returnTargetItem) {
      return;
    }

    const trimmedReason = returnReason.trim();
    const trimmedDetails = returnDetails.trim();
    if (trimmedReason.length < 2) {
      handleError("Tell us the reason for this request before submitting it.");
      return;
    }

    setIsSubmittingReturn(true);
    try {
      await createReturnRequest(order.id, {
        order_item_id: returnTargetItem.id,
        request_type: returnType,
        quantity: returnQuantity,
        reason: trimmedReason,
        details: trimmedDetails || null,
      });
      await refreshOrder();
      closeReturnModal(true);
      showToast("Return request submitted.");
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "We couldn't submit that return request right now.",
      );
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  if (isLoadingOrder) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Order Details" />
        <ScreenLoader label="Loading order..." />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Order Details" />
        <View style={styles.emptyWrap}>
          <AccountEmptyState
            icon="receipt-outline"
            title="We couldn't find that order"
            message="It may have been removed, or the order details are no longer available."
            actionLabel="Back to My Orders"
            onAction={() => router.replace("/(root)/screens/profileScreens/orders" as any)}
          />
        </View>
      </View>
    );
  }

  const statusMeta = getStatusMeta(order);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const timelineSteps = getTimelineSteps(order);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Order Details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, styles.scrollContent]}
      >
        <AccountListCard>
          <View style={orderStyles.orderTopRow}>
            <View style={orderStyles.orderInfo}>
              <Text style={orderStyles.orderNumber}>#{order.order_number}</Text>
              <Text style={orderStyles.orderTitle}>
                Placed on {new Date(order.placed_at).toLocaleDateString()}
              </Text>
            </View>
            <AccountBadge label={statusMeta.label} tone={getStatusTone(order)} />
          </View>

          <Text style={styles.helperText}>{statusMeta.helperText}</Text>

          {order.status === "processing" ? (
            <OrderProgressBar progress={order.progress ?? 0.18} eta={order.tracking_eta} />
          ) : null}
        </AccountListCard>

        <AccountSectionCard title="Order journey">
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            const iconName =
              step.state === "done"
                ? "checkmark-circle"
                : step.state === "active"
                  ? "radio-button-on"
                  : step.state === "cancelled"
                    ? "close-circle"
                    : "ellipse-outline";
            const iconColor =
              step.state === "done"
                ? "#16A34A"
                : step.state === "active"
                  ? "#2563EB"
                  : step.state === "cancelled"
                    ? "#DC2626"
                    : "#B6C0CC";

            return (
              <View key={step.key} style={[styles.timelineRow, !isLast && styles.timelineRowSpaced]}>
                <View style={styles.timelineRailWrap}>
                  <Ionicons name={iconName} size={rMS(22)} color={iconColor} />
                  {!isLast ? <View style={[styles.timelineRail, step.state === "pending" && styles.timelineRailPending]} /> : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  <Text style={styles.timelineCaption}>{step.caption}</Text>
                </View>
              </View>
            );
          })}
        </AccountSectionCard>

        <AccountSectionCard title="Items">
          {order.items.map((item, index) => {
            const itemImage = getOrderLineItemImage(item);
            const latestRequest = latestReturnRequestsByItem.get(item.id);
            const hasOpenRequest = latestRequest
              ? OPEN_RETURN_STATUSES.has(latestRequest.status)
              : false;
            const latestRequestMeta = latestRequest ? getReturnStatusMeta(latestRequest.status) : null;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index !== order.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.itemRowTop}>
                  <View style={styles.imageWrap}>
                    {item.image_url || item.image_key ? (
                      <Image source={itemImage} style={styles.image} resizeMode="cover" />
                    ) : (
                      <Ionicons name="image-outline" size={rMS(24)} color={AppColors.subtext[100]} />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>
                      {item.category || "Product"} · Qty {item.quantity}
                    </Text>
                    {item.selected_color || item.selected_size ? (
                      <Text style={styles.itemVariant}>
                        {[item.selected_color && `Color: ${item.selected_color}`, item.selected_size && `Size: ${item.selected_size}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemAmount}>₵{item.line_total.toFixed(2)}</Text>
                </View>

                {order.status === "delivered" ? (
                  <View style={styles.itemActionRow}>
                    <View style={styles.itemInlineActionsRow}>
                      <TouchableOpacity
                        style={styles.reviewActionButton}
                        activeOpacity={0.88}
                        onPress={() =>
                          router.push({
                            pathname:
                              "/(root)/screens/profileScreens/Account/Reviews" as any,
                            params: {
                              orderId: order.id,
                              productId: item.product_id,
                            },
                          })
                        }
                      >
                        <Ionicons
                          name="star-outline"
                          size={rMS(14)}
                          color="#B45309"
                        />
                        <Text style={styles.reviewActionButtonText}>
                          {reviewedItemKeys.has(`${order.id}:${item.product_id}`)
                            ? "Edit review"
                            : "Write review"}
                        </Text>
                      </TouchableOpacity>

                      {hasOpenRequest && latestRequest && latestRequestMeta ? (
                        <View
                          style={[
                            styles.inlineStatusPill,
                            { backgroundColor: latestRequestMeta.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.inlineStatusPillText,
                              { color: latestRequestMeta.textColor },
                            ]}
                          >
                            {latestRequestMeta.label}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.inlineActionButton}
                          activeOpacity={0.88}
                          onPress={() => openReturnModal(item)}
                        >
                          <Ionicons name="refresh-outline" size={rMS(14)} color="#1D4ED8" />
                          <Text style={styles.inlineActionButtonText}>Request return</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {latestRequest ? (
                      <Text style={styles.inlineHelperText}>
                        Last request: {latestRequest.request_type} · {latestRequest.reason}
                      </Text>
                    ) : (
                      <Text style={styles.inlineHelperText}>
                        Share a product review or start a return if something was not right.
                      </Text>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </AccountSectionCard>

        {order.status === "delivered" || order.return_requests.length > 0 ? (
          <AccountSectionCard title="Returns & refunds">
            <Text style={styles.returnIntro}>
              Start a request per delivered item, then track review, approval, refund, or exchange updates here.
            </Text>

            {order.return_requests.length === 0 ? (
              <View style={styles.returnEmptyState}>
                <Ionicons name="swap-horizontal-outline" size={rMS(18)} color={AppColors.secondary} />
                <Text style={styles.returnEmptyText}>No return requests on this order yet.</Text>
              </View>
            ) : (
              order.return_requests
                .slice()
                .sort(
                  (left, right) =>
                    new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
                )
                .map((request) => {
                  const statusMeta = getReturnStatusMeta(request.status);
                  const item = order.items.find((candidate) => candidate.id === request.order_item_id);
                  return (
                    <View key={request.id} style={styles.returnRequestCard}>
                      <View style={styles.returnRequestTopRow}>
                        <View style={styles.returnRequestTitleWrap}>
                          <Text style={styles.returnRequestTitle}>
                            {item?.title || "Order item"}
                          </Text>
                          <Text style={styles.returnRequestMeta}>
                            {request.request_type} · Qty {request.quantity}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.inlineStatusPill,
                            { backgroundColor: statusMeta.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.inlineStatusPillText,
                              { color: statusMeta.textColor },
                            ]}
                          >
                            {statusMeta.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.returnRequestReason}>{request.reason}</Text>
                      {request.details ? (
                        <Text style={styles.returnRequestDetails}>{request.details}</Text>
                      ) : null}

                      <View style={styles.returnRequestFooter}>
                        <Text style={styles.returnRequestTimestamp}>
                          Sent {formatTimelineDate(request.created_at) || "just now"}
                        </Text>
                        {request.refund_amount !== null && request.refund_amount !== undefined ? (
                          <Text style={styles.returnRequestRefund}>
                            Refund ₵{request.refund_amount.toFixed(2)}
                          </Text>
                        ) : null}
                      </View>

                      {request.admin_note ? (
                        <View style={styles.returnAdminNote}>
                          <Text style={styles.returnAdminNoteLabel}>Admin note</Text>
                          <Text style={styles.returnAdminNoteText}>{request.admin_note}</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })
            )}
          </AccountSectionCard>
        ) : null}

        <AccountSectionCard title="Delivery">
          <Text style={styles.detailPrimary}>{order.address_full_name}</Text>
          <Text style={styles.detailText}>
            {order.address_street}, {order.address_city}, {order.address_region}
          </Text>
          <Text style={styles.detailText}>{order.address_phone}</Text>
        </AccountSectionCard>

        <AccountSectionCard title="Payment">
          <Text style={styles.detailPrimary}>{order.payment_label}</Text>
          <Text style={styles.detailText}>
            {order.payment_type === "card"
              ? `Card ending ${order.payment_last4 || "••••"}`
              : order.payment_network || "Mobile Money"}
          </Text>
          {order.payment_phone ? <Text style={styles.detailText}>{order.payment_phone}</Text> : null}
          {order.voucher_code ? (
            <Text style={styles.detailText}>
              Voucher: {order.voucher_code}
              {order.voucher_title ? ` · ${order.voucher_title}` : ""}
            </Text>
          ) : null}
        </AccountSectionCard>

        <AccountSectionCard title="Summary">
          <OrderSummaryRow
            label="Items"
            value={`${totalItems} item${totalItems === 1 ? "" : "s"}`}
          />
          <OrderSummaryRow label="Subtotal" value={formatOrderMoney(order.subtotal_amount)} />
          <OrderSummaryRow
            label="Shipping"
            value={
              order.shipping_amount === 0 ? "FREE" : formatOrderMoney(order.shipping_amount)
            }
            accent={order.shipping_amount === 0 ? "success" : "default"}
          />
          {order.discount_amount > 0 ? (
            <OrderSummaryRow
              label={`Voucher${order.voucher_code ? ` (${order.voucher_code})` : ""}`}
              value={`-${formatOrderMoney(order.discount_amount).slice(1)}`}
              accent="discount"
            />
          ) : null}
          <OrderSummaryRow label="Total" value={formatOrderMoney(order.total_amount)} last />

          <AccountActionButton
            label="View Receipt"
            variant="secondary"
            icon="receipt-outline"
            onPress={() =>
              router.push({
                pathname: "/(root)/screens/profileScreens/orders/receipt" as any,
                params: { orderId: order.id },
              })
            }
          />
        </AccountSectionCard>
      </ScrollView>

      <View style={orderStyles.stickyFooter}>
        {order.status === "processing" ? (
          <>
            <AccountActionButton
              label={isMutatingOrder ? "Updating..." : "Confirm Delivery"}
              variant="primary"
              disabled={isMutatingOrder}
              onPress={() =>
                Alert.alert(
                  "Confirm delivery?",
                  "Use this when the package has arrived and everything looks right.",
                  [
                    { text: "Not yet", style: "cancel" },
                    {
                      text: "Confirm",
                      onPress: () => {
                        void handleConfirmDelivery();
                      },
                    },
                  ],
                )
              }
            />
            <AccountActionButton
              label={isMutatingOrder ? "Updating..." : "Cancel Order"}
              variant="danger"
              disabled={isMutatingOrder}
              onPress={() =>
                Alert.alert(
                  "Cancel this order?",
                  "We'll stop processing it and move it to your cancelled orders list.",
                  [
                    { text: "Keep order", style: "cancel" },
                    {
                      text: "Cancel order",
                      style: "destructive",
                      onPress: () => {
                        void handleCancelOrder();
                      },
                    },
                  ],
                )
              }
            />
          </>
        ) : null}

        {order.status === "pending_payment" ? (
          <AccountActionButton
            label={isMutatingOrder ? "Updating..." : "Cancel Pending Order"}
            variant="danger"
            disabled={isMutatingOrder}
            onPress={() =>
              Alert.alert(
                "Cancel this pending order?",
                "This removes the payment hold request from your active orders list.",
                [
                  { text: "Keep order", style: "cancel" },
                  {
                    text: "Cancel order",
                    style: "destructive",
                    onPress: () => {
                      void handleCancelOrder();
                    },
                  },
                ],
              )
            }
          />
        ) : null}

        {order.status === "cancelled" ? (
          <>
            <AccountActionButton
              label="Reorder Items"
              variant="primary"
              onPress={() => {
                void handleReorder();
              }}
            />
            <AccountActionButton
              label={isMutatingOrder ? "Removing..." : "Remove from History"}
              variant="danger"
              disabled={isMutatingOrder}
              onPress={() =>
                Alert.alert(
                  "Remove this order?",
                  "This will remove the cancelled order from your history list.",
                  [
                    { text: "Keep it", style: "cancel" },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () => {
                        void handleRemoveOrder();
                      },
                    },
                  ],
                )
              }
            />
          </>
        ) : null}

        {order.status === "delivered" ? (
          <AccountActionButton
            label="Reorder Items"
            variant="primary"
            onPress={() => {
              void handleReorder();
            }}
          />
        ) : null}

        <AccountActionButton
          label="Back to My Orders"
          variant="secondary"
          onPress={() => router.push("/(root)/screens/profileScreens/orders" as any)}
        />
      </View>

      <Modal
        visible={Boolean(returnTargetItem)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => closeReturnModal()}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => closeReturnModal()}
              disabled={isSubmittingReturn}
            >
              <Text style={styles.modalHeaderAction}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Request return</Text>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                void handleSubmitReturnRequest();
              }}
              disabled={isSubmittingReturn}
            >
              <Text style={styles.modalHeaderAction}>
                {isSubmittingReturn ? "Sending..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {returnTargetItem ? (
              <>
                <View style={styles.modalCard}>
                  <Text style={styles.modalSectionTitle}>Selected item</Text>
                  <Text style={styles.modalProductTitle}>{returnTargetItem.title}</Text>
                  <Text style={styles.modalProductMeta}>
                    Qty delivered {returnTargetItem.quantity} · ₵{returnTargetItem.line_total.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.modalCard}>
                  <Text style={styles.modalSectionTitle}>What do you need?</Text>
                  <View style={styles.choiceRow}>
                    {(["refund", "exchange", "return"] as const).map((option) => {
                      const active = returnType === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[styles.choiceChip, active && styles.choiceChipActive]}
                          activeOpacity={0.88}
                          onPress={() => setReturnType(option)}
                        >
                          <Text
                            style={[
                              styles.choiceChipText,
                              active && styles.choiceChipTextActive,
                            ]}
                          >
                            {option === "refund"
                              ? "Refund"
                              : option === "exchange"
                                ? "Exchange"
                                : "Return"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.quantityCard}>
                    <View>
                      <Text style={styles.quantityLabel}>Quantity</Text>
                      <Text style={styles.quantityHint}>
                        Choose how many units from this item should be reviewed.
                      </Text>
                    </View>
                    <View style={styles.quantityStepper}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        activeOpacity={0.88}
                        disabled={returnQuantity <= 1}
                        onPress={() => setReturnQuantity((current) => Math.max(1, current - 1))}
                      >
                        <Ionicons name="remove" size={rMS(16)} color={AppColors.text} />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{returnQuantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        activeOpacity={0.88}
                        disabled={returnQuantity >= returnTargetItem.quantity}
                        onPress={() =>
                          setReturnQuantity((current) =>
                            Math.min(returnTargetItem.quantity, current + 1),
                          )
                        }
                      >
                        <Ionicons name="add" size={rMS(16)} color={AppColors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.modalCard}>
                  <TextInputField
                    label="Reason"
                    placeholder="What happened with this item?"
                    value={returnReason}
                    onChangeText={setReturnReason}
                    autoCapitalize="sentences"
                    helperText="Keep it clear so ODOS can review it quickly."
                  />
                  <TextInputField
                    label="Extra details"
                    placeholder="Add a little more context if needed"
                    value={returnDetails}
                    onChangeText={setReturnDetails}
                    autoCapitalize="sentences"
                    multiline
                    numberOfLines={5}
                    helperText="Optional, but helpful for support and refund decisions."
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: rS(16),
  },
  scrollContent: {
    paddingBottom: rV(150),
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    padding: rS(16),
    marginBottom: rV(12),
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(12),
  },
  orderNumber: {
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  orderDate: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  statusBadge: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  statusBadgeText: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
  },
  helperText: {
    marginTop: rV(12),
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  trackBar: {
    marginTop: rV(12),
    height: rMS(8),
    borderRadius: rMS(999),
    backgroundColor: "#E9EEF5",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: rMS(999),
  },
  progressText: {
    marginTop: rV(8),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    padding: rS(16),
    marginBottom: rV(12),
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
  },
  timelineRowSpaced: {
    marginBottom: rV(10),
  },
  timelineRailWrap: {
    width: rMS(24),
    alignItems: "center",
  },
  timelineRail: {
    width: 2,
    flex: 1,
    minHeight: rV(26),
    marginTop: rV(4),
    backgroundColor: "#D9E2EC",
    borderRadius: rMS(999),
  },
  timelineRailPending: {
    backgroundColor: "#E8EDF3",
  },
  timelineContent: {
    flex: 1,
    paddingBottom: rV(6),
  },
  timelineTitle: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  timelineCaption: {
    marginTop: rV(2),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  sectionTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    marginBottom: rV(12),
  },
  itemRow: {
    gap: rV(10),
    paddingBottom: rV(12),
  },
  itemRowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  itemRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7EBF0",
    marginBottom: rV(12),
  },
  imageWrap: {
    width: rMS(66),
    height: rMS(66),
    borderRadius: rMS(12),
    backgroundColor: "#F1F4F7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "84%",
    height: "84%",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  itemMeta: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  itemVariant: {
    marginTop: rV(3),
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.subtext[100],
  },
  itemAmount: {
    fontSize: rMS(13),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  itemActionRow: {
    marginLeft: rMS(78),
    gap: rV(6),
  },
  itemInlineActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: rS(8),
  },
  reviewActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(10),
    paddingVertical: rV(7),
    borderRadius: rMS(999),
    backgroundColor: "#FFFBEB",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FDE68A",
  },
  reviewActionButtonText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: "#B45309",
  },
  inlineActionButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(999),
    backgroundColor: "#EAF2FF",
  },
  inlineActionButtonText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: "#1D4ED8",
  },
  inlineHelperText: {
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(16),
  },
  inlineStatusPill: {
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  inlineStatusPillText: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
  },
  detailPrimary: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    marginBottom: rV(4),
  },
  detailText: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
    marginBottom: rV(2),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rV(9),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7EBF0",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  summaryLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  summaryValue: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  discountText: {
    color: "#166534",
  },
  summaryTotalLabel: {
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  summaryTotalValue: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  receiptButton: {
    marginTop: rV(14),
    minHeight: rV(46),
    borderRadius: rMS(14),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: rS(8),
  },
  receiptButtonText: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.primary,
  },
  returnIntro: {
    marginTop: -rV(4),
    marginBottom: rV(12),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  returnEmptyState: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    borderRadius: rMS(14),
    backgroundColor: "#F7F9FC",
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
  },
  returnEmptyText: {
    flex: 1,
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  returnRequestCard: {
    borderRadius: rMS(16),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E7EBF0",
    padding: rS(14),
    marginBottom: rV(10),
  },
  returnRequestTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: rS(10),
  },
  returnRequestTitleWrap: {
    flex: 1,
  },
  returnRequestTitle: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  returnRequestMeta: {
    marginTop: rV(3),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  returnRequestReason: {
    marginTop: rV(10),
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  returnRequestDetails: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(18),
  },
  returnRequestFooter: {
    marginTop: rV(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(10),
  },
  returnRequestTimestamp: {
    flex: 1,
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  returnRequestRefund: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: "#166534",
  },
  returnAdminNote: {
    marginTop: rV(10),
    borderRadius: rMS(12),
    backgroundColor: "#EEF4FF",
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
  },
  returnAdminNoteLabel: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
    color: "#1D4ED8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  returnAdminNoteText: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.text,
    lineHeight: rMS(18),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: rS(22),
  },
  emptyTitle: {
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: rV(8),
  },
  emptyText: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(20),
    textAlign: "center",
  },
  backToOrdersButton: {
    alignSelf: "center",
    marginTop: rV(18),
    backgroundColor: AppColors.primary,
    borderRadius: rMS(16),
    paddingHorizontal: rS(18),
    paddingVertical: rV(12),
  },
  backToOrdersButtonText: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(16),
    paddingTop: rV(14),
    paddingBottom: rV(24),
    gap: rV(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E7EBF0",
  },
  processingActions: {
    gap: rV(10),
  },
  primaryButton: {
    minHeight: rV(50),
    borderRadius: rMS(16),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  processingPrimaryButton: {
    backgroundColor: "#1D4ED8",
  },
  secondaryButton: {
    minHeight: rV(50),
    borderRadius: rMS(16),
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  destructiveButton: {
    minHeight: rV(50),
    borderRadius: rMS(16),
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FBCFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  destructiveButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: "#BE123C",
  },
  secondaryButtonText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  buttonDisabled: {
    backgroundColor: "#B8C1CC",
  },
  destructiveButtonDisabled: {
    backgroundColor: "#F6DDE3",
    borderColor: "#F6DDE3",
  },
  modalScreen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
    paddingBottom: rV(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E7EBF0",
    backgroundColor: AppColors.white,
  },
  modalHeaderAction: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.primary,
  },
  modalTitle: {
    fontSize: rMS(15),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  modalContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(28),
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    padding: rS(16),
    marginBottom: rV(12),
  },
  modalSectionTitle: {
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    marginBottom: rV(10),
  },
  modalProductTitle: {
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  modalProductMeta: {
    marginTop: rV(4),
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginBottom: rV(16),
  },
  choiceChip: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(9),
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    backgroundColor: "#F8FAFC",
  },
  choiceChipActive: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EAF2FF",
  },
  choiceChipText: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.secondary,
  },
  choiceChipTextActive: {
    color: "#1D4ED8",
  },
  quantityCard: {
    borderRadius: rMS(16),
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(12),
  },
  quantityLabel: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  quantityHint: {
    marginTop: rV(4),
    fontSize: rMS(11),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    lineHeight: rMS(16),
    maxWidth: "90%",
  },
  quantityStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  quantityButton: {
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(16),
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: "#D8DEE6",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    minWidth: rS(24),
    textAlign: "center",
    fontSize: rMS(14),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
});
