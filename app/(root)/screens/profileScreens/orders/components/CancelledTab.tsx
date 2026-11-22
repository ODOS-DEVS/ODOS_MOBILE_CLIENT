import { useAutoLoadOnScrollEnd } from "@/hooks/useAutoLoadOnScrollEnd";
import {
  AccountActionButton,
  AccountBadge,
  AccountEmptyState,
  AccountListCard,
  formatOrderDateShort,
  formatOrderMoney,
  getOrderPrimaryItem,
  getOrderStatusPresentation,
  OrderThumbnail,
  useOrderStyles,
} from "@/components/orders/OrderUi";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { Order } from "@/hooks/useOrders";
import { cancellationReasonLabel } from "@/utils/orderState";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { rMS } from "@/styles/responsive";
import { useTheme } from "@/context/ThemeContext";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const ORDERS_PAGE_SIZE = 10;

/**
 * When it ended. Deliberately not "Cancelled <date>": this tab also holds
 * orders that expired unpaid or whose payment failed, and neither was
 * cancelled by anyone.
 */
function formatClosedDate(order: Order) {
  const value = order.cancelled_at ?? order.updated_at;
  return formatOrderDateShort(value);
}

export default function CancelledTab({ orders }: { orders: Order[] }) {
  const orderStyles = useOrderStyles();
  const { colors } = useTheme();
  const [visibleCount, setVisibleCount] = useState(ORDERS_PAGE_SIZE);
  const autoLoad = useAutoLoadOnScrollEnd(
    () => setVisibleCount((current) => current + ORDERS_PAGE_SIZE),
    { enabled: orders.length > visibleCount },
  );
  const visibleOrders = orders.slice(0, visibleCount);

  return (
    <ScrollView
      {...autoLoad}
      showsVerticalScrollIndicator={false} contentContainerStyle={orderStyles.tabContent}>
      {orders.length === 0 ? (
        <AccountEmptyState
          icon="close-circle-outline"
          title="Nothing here"
          message="Orders that were cancelled, expired before payment, or whose payment failed will appear here."
        />
      ) : (
        visibleOrders.map((order) => {
          const item = getOrderPrimaryItem(order);
          const status = getOrderStatusPresentation(order);
          // Only the stored code, never a guess. This line used to fall back
          // to "Cancelled by the store" on every order without one -- telling
          // shoppers the seller had cancelled orders they had cancelled
          // themselves, and orders that simply expired unpaid.
          const reason =
            cancellationReasonLabel(order.cancellation_reason_code) ??
            order.cancellation_reason ??
            null;

          return (
            <AccountListCard key={order.id}>
              <View style={orderStyles.orderTopRow}>
                <OrderThumbnail order={order} />
                <View style={orderStyles.orderInfo}>
                  <Text style={orderStyles.orderNumber}>#{order.order_number}</Text>
                  <Text style={orderStyles.orderTitle}>{item?.title ?? "Order item"}</Text>
                  <Text style={orderStyles.orderMeta}>{item?.category ?? "Product"}</Text>
                  <Text style={[orderStyles.orderMeta, orderStyles.orderMetaDanger]}>
                    {formatClosedDate(order)}
                  </Text>
                </View>
                <AccountBadge label={status.label} tone={status.tone} />
              </View>

              <View style={orderStyles.reasonRow}>
                <Ionicons name="alert-circle-outline" size={rMS(14)} color={colors.iconMuted} />
                <Text style={orderStyles.reasonText}>
                  {reason ? `Reason: ${reason}` : status.detail}
                </Text>
              </View>

              <View style={orderStyles.cardFooterRow}>
                <Text style={orderStyles.price}>{formatOrderMoney(order.total_amount)}</Text>
                <AccountActionButton
                  label="View Details"
                  variant="primary"
                  compact
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                      params: { orderId: order.id },
                    })
                  }
                />
              </View>
            </AccountListCard>
          );
        })
      )}
      {orders.length > visibleCount ? (
        <ShowMoreButton
          remainingCount={orders.length - visibleCount}
          onPress={() => setVisibleCount((current) => current + ORDERS_PAGE_SIZE)}
        />
      ) : null}
    </ScrollView>
  );
}
