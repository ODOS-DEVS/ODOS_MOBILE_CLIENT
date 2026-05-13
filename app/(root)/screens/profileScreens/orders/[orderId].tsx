import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import { resolveCatalogImage } from "@/constants/catalogImages";
import Fonts from "@/constants/Fonts";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Order, useOrder, useOrders } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function getStatusMeta(order: Order) {
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

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const orderId = getParam(params.orderId) ?? "";
  const { order, isLoadingOrder, refreshOrder } = useOrder(orderId);
  const { cancelOrder, confirmDelivery, removeOrder, isMutatingOrder } = useOrders();
  const { addItemsToCart } = useCart();
  const { showToast } = useToast();

  const handleError = (message: string) => {
    Alert.alert("Something went wrong", message);
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

  if (isLoadingOrder) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Order Details" />
        <ScreenLoader label="Loading order..." />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Order Details" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>We couldn’t find that order</Text>
          <Text style={styles.emptyText}>
            It may have been removed, or the order details are no longer available.
          </Text>
          <TouchableOpacity
            style={styles.backToOrdersButton}
            activeOpacity={0.85}
            onPress={() => router.replace("/(root)/screens/profileScreens/orders" as any)}
          >
            <Text style={styles.backToOrdersButtonText}>Back to My Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusMeta = getStatusMeta(order);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const timelineSteps = getTimelineSteps(order);

  return (
    <View style={styles.container}>
      <ProfileHeader title="Order Details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.orderNumber}>#{order.order_number}</Text>
              <Text style={styles.orderDate}>
                Placed on {new Date(order.placed_at).toLocaleDateString()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusMeta.backgroundColor },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusMeta.textColor }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          <Text style={styles.helperText}>{statusMeta.helperText}</Text>

          {order.status === "processing" ? (
            <>
              <View style={styles.trackBar}>
                <View
                  style={[
                    styles.trackFill,
                    { width: `${Math.round((order.progress ?? 0.18) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((order.progress ?? 0.18) * 100)}% on the way
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Journey</Text>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, index) => {
            const itemImage =
              item.image_key ? resolveCatalogImage(item.image_key) : item.image_url ? { uri: item.image_url } : null;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index !== order.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.imageWrap}>
                  {itemImage ? (
                    <Image source={itemImage} style={styles.image} resizeMode="contain" />
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
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <Text style={styles.detailPrimary}>{order.address_full_name}</Text>
          <Text style={styles.detailText}>
            {order.address_street}, {order.address_city}, {order.address_region}
          </Text>
          <Text style={styles.detailText}>{order.address_phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₵{order.subtotal_amount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {order.shipping_amount === 0 ? "FREE" : `₵${order.shipping_amount.toFixed(2)}`}
            </Text>
          </View>
          {order.discount_amount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Voucher{order.voucher_code ? ` (${order.voucher_code})` : ""}
              </Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -₵{order.discount_amount.toFixed(2)}
              </Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>₵{order.total_amount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.receiptButton}
            activeOpacity={0.88}
            onPress={() =>
              router.push({
                pathname: "/(root)/screens/profileScreens/orders/receipt" as any,
                params: { orderId: order.id },
              })
            }
          >
            <Ionicons name="receipt-outline" size={rMS(16)} color={AppColors.primary} />
            <Text style={styles.receiptButtonText}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {order.status === "processing" ? (
          <View style={styles.processingActions}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.processingPrimaryButton, isMutatingOrder && styles.buttonDisabled]}
              activeOpacity={0.88}
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
            >
              <Text style={styles.primaryButtonText}>
                {isMutatingOrder ? "Updating..." : "Confirm Delivery"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.destructiveButton, isMutatingOrder && styles.destructiveButtonDisabled]}
              activeOpacity={0.88}
              disabled={isMutatingOrder}
              onPress={() =>
                Alert.alert(
                  "Cancel this order?",
                  "We’ll stop processing it and move it to your cancelled orders list.",
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
            >
              <Text style={styles.destructiveButtonText}>
                {isMutatingOrder ? "Updating..." : "Cancel Order"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {order.status === "cancelled" ? (
          <View style={styles.processingActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.88}
              onPress={() => {
                void handleReorder();
              }}
            >
              <Text style={styles.primaryButtonText}>Reorder Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.destructiveButton, isMutatingOrder && styles.destructiveButtonDisabled]}
              activeOpacity={0.88}
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
            >
              <Text style={styles.destructiveButtonText}>
                {isMutatingOrder ? "Removing..." : "Remove from History"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {order.status === "delivered" ? (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => {
              void handleReorder();
            }}
          >
            <Text style={styles.primaryButtonText}>Reorder Items</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.88}
          onPress={() => router.push("/(root)/screens/profileScreens/orders" as any)}
        >
          <Text style={styles.secondaryButtonText}>Back to My Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(14),
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
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingBottom: rV(12),
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
});
