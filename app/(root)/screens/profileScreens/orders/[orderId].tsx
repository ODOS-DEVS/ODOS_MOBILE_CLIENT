import ScreenLoader from "@/components/loaders/ScreenLoader";
import CommerceImage from "@/components/media/CommerceImage";
import DeliveryCelebration from "@/components/orders/DeliveryCelebration";
import DeliveryFeedbackPrompt from "@/components/orders/DeliveryFeedbackPrompt";
import RescheduleRequestSheet from "@/components/orders/RescheduleRequestSheet";
import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountEmptyState,
  AccountListCard,
  AccountSectionCard,
  useAccountStyles,
  formatOrderMoney,
  getOrderLineItemImage,
  OrderProgressBar,
  OrderSummaryRow,
  OrderScreenFooter,
  estimateOrderScreenFooterHeight,
  useOrderStyles,
} from "@/components/orders/OrderUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppReviewPrompt } from "@/components/app-review/AppReviewPrompt";
import TextInputField from "@/components/TextInputField";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Order, OrderItem, ReturnRequest, useOrder, useOrders } from "@/hooks/useOrders";
import { getDeliveryMethodLabel } from "@/utils/delivery";
import { formatOrderTimelineDate, getOrderTimelineSteps } from "@/utils/orderTracking";
import { buildReviewComposerRoute } from "@/utils/reviewNavigation";
import { useReviews } from "@/hooks/useReviews";
import { useAppReview } from "@/hooks/useAppReview";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function getStatusMeta(order: Order, colors: ThemeColors) {
  if (order.status === "pending_payment") {
    return {
      label: "Awaiting Payment",
      backgroundColor: colors.warningSoft,
      textColor: colors.warningText,
      helperText:
        order.payment_status === "failed"
          ? "Payment was not completed successfully."
          : "We’re waiting for secure payment confirmation before preparation starts.",
    };
  }

  if (order.status === "delivered") {
    return {
      label: "Delivered",
      backgroundColor: colors.successSoft,
      textColor: colors.successText,
      helperText: order.delivered_at
        ? `Delivered on ${new Date(order.delivered_at).toLocaleDateString()}`
        : "Delivered successfully",
    };
  }

  if (order.status === "cancelled") {
    return {
      label: "Cancelled",
      backgroundColor: colors.dangerSoft,
      textColor: colors.dangerText,
      helperText: order.cancellation_reason || "Cancelled by customer",
    };
  }

  return {
    label: "Processing",
    backgroundColor: colors.infoSoft,
    textColor: colors.infoText,
    helperText: order.tracking_eta || "Estimated delivery in 2–3 days",
  };
}

const OPEN_RETURN_STATUSES = new Set(["requested", "under_review", "approved"]);

function getReturnStatusMeta(status: ReturnRequest["status"], colors: ThemeColors) {
  switch (status) {
    case "requested":
      return {
        label: "Requested",
        backgroundColor: colors.warningSoft,
        textColor: colors.warningText,
      };
    case "under_review":
      return {
        label: "Under Review",
        backgroundColor: colors.infoSoft,
        textColor: colors.infoText,
      };
    case "approved":
      return {
        label: "Approved",
        backgroundColor: colors.successSoft,
        textColor: colors.successText,
      };
    case "rejected":
      return {
        label: "Declined",
        backgroundColor: colors.dangerSoft,
        textColor: colors.dangerText,
      };
    case "refunded":
      return {
        label: "Refunded",
        backgroundColor: colors.successSoft,
        textColor: colors.successText,
      };
    case "exchanged":
      return {
        label: "Exchanged",
        backgroundColor: colors.infoSoft,
        textColor: colors.infoText,
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        backgroundColor: colors.surfaceMuted,
        textColor: colors.textSecondary,
      };
  }
}

export default function OrderDetailScreen() {
  const accountStyles = useAccountStyles();
  const orderStyles = useOrderStyles();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const orderId = getParam(params.orderId) ?? "";
  const { order, isLoadingOrder, orderErrorKind, refreshOrder } = useOrder(orderId);
  const {
    cancelOrder,
    confirmDelivery,
    createReturnRequest,
    removeOrder,
    submitDeliveryRating,
    requestReschedule,
    isMutatingOrder,
  } = useOrders();
  const { addItemsToCart } = useCart();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const {
    visible: reviewPromptVisible,
    maybePromptAfterDelivery,
    handleRate: handleAppReviewRate,
    handleDismiss: handleAppReviewDismiss,
  } = useAppReview();
  const deliveredReviewCheckedRef = useRef<string | null>(null);
  const [showDeliveryCelebration, setShowDeliveryCelebration] = React.useState(false);
  const [showRescheduleSheet, setShowRescheduleSheet] = React.useState(false);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = React.useState(false);
  const prevOrderStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!order || order.status !== "delivered") {
      return;
    }
    if (deliveredReviewCheckedRef.current === order.id) {
      return;
    }
    deliveredReviewCheckedRef.current = order.id;
    void maybePromptAfterDelivery(order.id);
  }, [maybePromptAfterDelivery, order]);

  useEffect(() => {
    if (!order) {
      return;
    }
    const previousStatus = prevOrderStatusRef.current;
    if (previousStatus !== undefined && previousStatus !== "delivered" && order.status === "delivered") {
      setShowDeliveryCelebration(true);
    }
    prevOrderStatusRef.current = order.status;
  }, [order]);

  const handleRateDelivery = async (rating: number) => {
    if (!order) {
      return;
    }
    try {
      await submitDeliveryRating(order.id, rating);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't save that rating.",
      );
    }
  };

  const handleSubmitReschedule = async (note: string) => {
    if (!order) {
      return;
    }
    setIsSubmittingReschedule(true);
    try {
      await requestReschedule(order.id, note || undefined);
      setShowRescheduleSheet(false);
      showToast("We've let the seller know.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't send that just now.",
      );
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const footerActionRows = useMemo(() => {
    if (!order) {
      return 0;
    }

    if (
      order.status === "processing" ||
      order.status === "pending_payment" ||
      order.status === "delivered"
    ) {
      return 1;
    }

    if (order.status === "cancelled") {
      return 2;
    }

    return 0;
  }, [order]);

  const footerScrollPadding = useMemo(
    () => estimateOrderScreenFooterHeight(footerActionRows, insets.bottom),
    [footerActionRows, insets.bottom],
  );

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
      void maybePromptAfterDelivery(order.id);
      Alert.alert(
        "Order delivered",
        "Thanks for confirming. You can leave a review anytime from your account.",
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
    const isNetworkError = orderErrorKind === "network";
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Order Details" />
        <View style={styles.emptyWrap}>
          <AccountEmptyState
            icon={isNetworkError ? "cloud-offline-outline" : "receipt-outline"}
            title={isNetworkError ? "Couldn't load this order" : "We couldn't find that order"}
            message={
              isNetworkError
                ? "Check your connection and try again."
                : "It may have been removed, or the order details are no longer available."
            }
            actionLabel={isNetworkError ? "Retry" : "Back to My Orders"}
            onAction={
              isNetworkError
                ? () => void refreshOrder()
                : () => router.replace("/(root)/screens/profileScreens/orders" as any)
            }
          />
        </View>
      </View>
    );
  }

  const statusMeta = getStatusMeta(order, colors);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const timelineSteps = getOrderTimelineSteps(order);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Order Details" />

      <View style={styles.screenBody}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            accountStyles.content,
            styles.scrollContent,
            footerActionRows > 0 ? { paddingBottom: footerScrollPadding } : null,
          ]}
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

        {order.delivery_code && order.status !== "delivered" && order.status !== "cancelled" ? (
          <View style={styles.deliveryCodeCard}>
            <View style={styles.deliveryCodeCopy}>
              <Text style={styles.deliveryCodeLabel}>Your delivery code</Text>
              <Text style={styles.deliveryCodeHelper}>
                Share this with the seller when your order arrives so they can confirm the handoff.
              </Text>
            </View>
            <Text style={styles.deliveryCodeValue}>{order.delivery_code}</Text>
          </View>
        ) : null}

        {order.vendor_status === "out_for_delivery" ? (
          <TouchableOpacity
            style={styles.notHomeButton}
            activeOpacity={0.85}
            onPress={() => setShowRescheduleSheet(true)}
          >
            <Ionicons name="time-outline" size={rMS(16)} color={colors.warningText} />
            <Text style={styles.notHomeButtonText}>Not home right now? Let the seller know</Text>
          </TouchableOpacity>
        ) : null}

        {order.reschedule_requested_at ? (
          <View style={styles.rescheduleNotice}>
            <Ionicons name="checkmark-circle-outline" size={rMS(16)} color={colors.infoText} />
            <Text style={styles.rescheduleNoticeText}>
              The seller has been told you may not be available right now.
            </Text>
          </View>
        ) : null}

        {order.status === "delivered" && order.delivery_rating == null ? (
          <DeliveryFeedbackPrompt onRate={handleRateDelivery} />
        ) : null}

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
                ? colors.successText
                : step.state === "active"
                  ? colors.infoText
                  : step.state === "cancelled"
                    ? colors.dangerText
                    : colors.iconMuted;

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
            const latestRequestMeta = latestRequest
              ? getReturnStatusMeta(latestRequest.status, colors)
              : null;

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
                      <CommerceImage
                        source={itemImage}
                        style={styles.image}
                        contentFit="cover"
                        trackingId={`order-item-${item.id}`}
                        recyclingKey={item.image_url || item.image_key || item.id}
                        placeholderColor={colors.surfaceMuted}
                      />
                    ) : (
                      <Ionicons name="image-outline" size={rMS(24)} color={colors.iconMuted} />
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
                          router.push(
                            buildReviewComposerRoute({
                              orderId: order.id,
                              orderNumber: order.order_number,
                              productId: item.product_id,
                              title: item.title,
                              category: item.category,
                              imageKey: item.image_key,
                              imageUrl: item.image_url,
                              mode: reviewedItemKeys.has(`${order.id}:${item.product_id}`)
                                ? "edit"
                                : "create",
                            }),
                          )
                        }
                      >
                        <Ionicons
                          name="star-outline"
                          size={rMS(14)}
                          color={colors.ratingText}
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
                          <Ionicons name="refresh-outline" size={rMS(14)} color={colors.infoText} />
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
                <Ionicons name="swap-horizontal-outline" size={rMS(18)} color={colors.textSecondary} />
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
                  const statusMeta = getReturnStatusMeta(request.status, colors);
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
                          Sent {formatOrderTimelineDate(request.created_at) || "just now"}
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
          <Text style={styles.detailPrimary}>{getDeliveryMethodLabel(order.delivery_method)}</Text>
          <Text style={styles.detailText}>
            {order.tracking_eta || "Delivery updates will appear here"}
          </Text>
          <Text style={[styles.detailText, { marginTop: rV(8) }]}>
            {order.address_full_name}
          </Text>
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
            label={getDeliveryMethodLabel(order.delivery_method)}
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

        <AccountActionButton
          label="Back to My Orders"
          variant="secondary"
          onPress={() => router.push("/(root)/screens/profileScreens/orders" as any)}
        />
      </ScrollView>

      {footerActionRows > 0 ? (
        <View style={styles.stickyFooterShell} pointerEvents="box-none">
          <OrderScreenFooter>
        {order.status === "processing" ? (
          <AccountActionRow>
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
          </AccountActionRow>
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
        </OrderScreenFooter>
        </View>
      ) : null}
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
                        <Ionicons name="remove" size={rMS(16)} color={colors.text} />
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
                        <Ionicons name="add" size={rMS(16)} color={colors.text} />
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
      <AppReviewPrompt
        visible={reviewPromptVisible}
        title="Enjoying ODOS?"
        message="You just received your order. Would you mind rating the ODOS app?"
        onRate={() => void handleAppReviewRate()}
        onDismiss={() => void handleAppReviewDismiss()}
      />
      <DeliveryCelebration
        visible={showDeliveryCelebration}
        onDone={() => setShowDeliveryCelebration(false)}
      />
      <RescheduleRequestSheet
        visible={showRescheduleSheet}
        isSubmitting={isSubmittingReschedule}
        onClose={() => setShowRescheduleSheet(false)}
        onSubmit={(note) => void handleSubmitReschedule(note)}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: rS(16),
    },
    screenBody: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    stickyFooterShell: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },
    scrollContent: {
      paddingBottom: rV(16),
    },
    heroCard: {
      backgroundColor: colors.card,
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
      color: colors.text,
    },
    orderDate: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
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
      color: colors.text,
    },
    deliveryCodeCard: {
      backgroundColor: colors.inverseSurface,
      borderRadius: rMS(20),
      padding: rS(16),
      marginBottom: rV(12),
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
    },
    deliveryCodeCopy: {
      flex: 1,
    },
    deliveryCodeLabel: {
      fontSize: rMS(11),
      fontFamily: Fonts.titleBold,
      color: colors.mutedOnInverse,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    deliveryCodeHelper: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.onInverseSurface,
      lineHeight: rMS(17),
    },
    deliveryCodeValue: {
      fontSize: rMS(26),
      fontFamily: Fonts.titleBold,
      color: colors.onInverseSurface,
      letterSpacing: rMS(3),
    },
    notHomeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(8),
      backgroundColor: colors.warningSoft,
      borderRadius: rMS(16),
      paddingVertical: rV(12),
      marginBottom: rV(12),
    },
    notHomeButtonText: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.warningText,
    },
    rescheduleNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
      backgroundColor: colors.infoSoft,
      borderRadius: rMS(16),
      paddingVertical: rV(10),
      paddingHorizontal: rS(14),
      marginBottom: rV(12),
    },
    rescheduleNoticeText: {
      flex: 1,
      fontSize: rMS(12.5),
      fontFamily: Fonts.text,
      color: colors.infoText,
      lineHeight: rMS(17),
    },
    trackBar: {
      marginTop: rV(12),
      height: rMS(8),
      borderRadius: rMS(999),
      backgroundColor: colors.segmentBg,
      overflow: "hidden",
    },
    trackFill: {
      height: "100%",
      backgroundColor: colors.infoText,
      borderRadius: rMS(999),
    },
    progressText: {
      marginTop: rV(8),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.card,
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
      backgroundColor: colors.border,
      borderRadius: rMS(999),
    },
    timelineRailPending: {
      backgroundColor: colors.borderStrong,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: rV(6),
    },
    timelineTitle: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    timelineCaption: {
      marginTop: rV(2),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
      lineHeight: rMS(18),
    },
    sectionTitle: {
      fontSize: rMS(14),
      fontFamily: Fonts.titleBold,
      color: colors.text,
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
      borderBottomColor: colors.borderStrong,
      marginBottom: rV(12),
    },
    imageWrap: {
      width: rMS(66),
      height: rMS(66),
      borderRadius: rMS(12),
      backgroundColor: colors.surfaceMuted,
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
      color: colors.text,
    },
    itemMeta: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    itemVariant: {
      marginTop: rV(3),
      fontSize: rMS(11),
      fontFamily: Fonts.textBold,
      color: colors.textMuted,
    },
    itemAmount: {
      fontSize: rMS(13),
      fontFamily: Fonts.titleBold,
      color: colors.text,
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
      backgroundColor: colors.ratingSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.ratingBorder,
    },
    reviewActionButtonText: {
      fontSize: rMS(11),
      fontFamily: Fonts.textBold,
      color: colors.ratingText,
    },
    inlineActionButton: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
      paddingHorizontal: rS(12),
      paddingVertical: rV(8),
      borderRadius: rMS(999),
      backgroundColor: colors.infoSoft,
    },
    inlineActionButtonText: {
      fontSize: rMS(11),
      fontFamily: Fonts.textBold,
      color: colors.infoText,
    },
    inlineHelperText: {
      fontSize: rMS(11),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
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
      color: colors.text,
      marginBottom: rV(4),
    },
    detailText: {
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
      lineHeight: rMS(18),
      marginBottom: rV(2),
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: rV(9),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderStrong,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    summaryLabel: {
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    discountText: {
      color: colors.successText,
    },
    summaryTotalLabel: {
      fontSize: rMS(14),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    summaryTotalValue: {
      fontSize: rMS(15),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    receiptButton: {
      marginTop: rV(14),
      minHeight: rV(46),
      borderRadius: rMS(14),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: rS(8),
    },
    receiptButtonText: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.primary,
    },
    returnIntro: {
      marginTop: -rV(4),
      marginBottom: rV(12),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
      lineHeight: rMS(18),
    },
    returnEmptyState: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
      borderRadius: rMS(14),
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: rS(12),
      paddingVertical: rV(12),
    },
    returnEmptyText: {
      flex: 1,
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    returnRequestCard: {
      borderRadius: rMS(16),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.borderStrong,
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
      color: colors.text,
    },
    returnRequestMeta: {
      marginTop: rV(3),
      fontSize: rMS(11),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    returnRequestReason: {
      marginTop: rV(10),
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    returnRequestDetails: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
    },
    returnRequestRefund: {
      fontSize: rMS(11),
      fontFamily: Fonts.textBold,
      color: colors.successText,
    },
    returnAdminNote: {
      marginTop: rV(10),
      borderRadius: rMS(12),
      backgroundColor: colors.infoSoft,
      paddingHorizontal: rS(12),
      paddingVertical: rV(10),
    },
    returnAdminNoteLabel: {
      fontSize: rMS(10),
      fontFamily: Fonts.textBold,
      color: colors.infoText,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    returnAdminNoteText: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.text,
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
      color: colors.text,
      textAlign: "center",
      marginBottom: rV(8),
    },
    emptyText: {
      fontSize: rMS(13),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
      lineHeight: rMS(20),
      textAlign: "center",
    },
    backToOrdersButton: {
      alignSelf: "center",
      marginTop: rV(18),
      backgroundColor: colors.primary,
      borderRadius: rMS(16),
      paddingHorizontal: rS(18),
      paddingVertical: rV(12),
    },
    backToOrdersButtonText: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.onPrimary,
    },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.card,
      paddingHorizontal: rS(16),
      paddingTop: rV(14),
      paddingBottom: rV(24),
      gap: rV(10),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borderStrong,
    },
    processingActions: {
      gap: rV(10),
    },
    primaryButton: {
      minHeight: rV(50),
      borderRadius: rMS(16),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    processingPrimaryButton: {
      backgroundColor: colors.infoText,
    },
    secondaryButton: {
      minHeight: rV(50),
      borderRadius: rMS(16),
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    destructiveButton: {
      minHeight: rV(50),
      borderRadius: rMS(16),
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.dangerText,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.onPrimary,
    },
    destructiveButtonText: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.dangerText,
    },
    secondaryButtonText: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    buttonDisabled: {
      backgroundColor: colors.mutedOnInverse,
    },
    destructiveButtonDisabled: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.dangerSoft,
    },
    modalScreen: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: rS(16),
      paddingTop: rV(18),
      paddingBottom: rV(14),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderStrong,
      backgroundColor: colors.header,
    },
    modalHeaderAction: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.primary,
    },
    modalTitle: {
      fontSize: rMS(15),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    modalContent: {
      paddingHorizontal: rS(16),
      paddingTop: rV(16),
      paddingBottom: rV(28),
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: rMS(18),
      padding: rS(16),
      marginBottom: rV(12),
    },
    modalSectionTitle: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.text,
      marginBottom: rV(10),
    },
    modalProductTitle: {
      fontSize: rMS(16),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    modalProductMeta: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
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
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    choiceChipActive: {
      borderColor: colors.infoText,
      backgroundColor: colors.infoSoft,
    },
    choiceChipText: {
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.textSecondary,
    },
    choiceChipTextActive: {
      color: colors.infoText,
    },
    quantityCard: {
      borderRadius: rMS(16),
      backgroundColor: colors.surfaceSubtle,
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
      color: colors.text,
    },
    quantityHint: {
      marginTop: rV(4),
      fontSize: rMS(11),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    quantityValue: {
      minWidth: rS(24),
      textAlign: "center",
      fontSize: rMS(14),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
  });
}
