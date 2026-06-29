import {
  AccountActionButton,
  AccountBadge,
  AccountEmptyState,
  AccountListCard,
  formatOrderDateShort,
  formatOrderMoney,
  getOrderPrimaryItem,
  OrderThumbnail,
  useOrderStyles,
} from "@/components/orders/OrderUi";
import { Order } from "@/hooks/useOrders";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { rMS } from "@/styles/responsive";
import React from "react";
import { ScrollView, Text, View } from "react-native";

function formatCancelledDate(order: Order) {
  const value = order.cancelled_at ?? order.updated_at;
  return `Cancelled ${formatOrderDateShort(value)}`;
}

export default function CancelledTab({ orders }: { orders: Order[] }) {
  const orderStyles = useOrderStyles();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={orderStyles.tabContent}>
      {orders.length === 0 ? (
        <AccountEmptyState
          icon="close-circle-outline"
          title="No cancelled orders"
          message="If an order is ever cancelled, the reason and total will appear here."
        />
      ) : (
        orders.map((order) => {
          const item = getOrderPrimaryItem(order);

          return (
            <AccountListCard key={order.id}>
              <View style={orderStyles.orderTopRow}>
                <OrderThumbnail order={order} />
                <View style={orderStyles.orderInfo}>
                  <Text style={orderStyles.orderNumber}>#{order.order_number}</Text>
                  <Text style={orderStyles.orderTitle}>{item?.title ?? "Order item"}</Text>
                  <Text style={orderStyles.orderMeta}>{item?.category ?? "Product"}</Text>
                  <Text style={[orderStyles.orderMeta, orderStyles.orderMetaDanger]}>
                    {formatCancelledDate(order)}
                  </Text>
                </View>
                <AccountBadge label="Cancelled" tone="danger" />
              </View>

              <View style={orderStyles.reasonRow}>
                <Ionicons name="alert-circle-outline" size={rMS(14)} color="#9CA3AF" />
                <Text style={orderStyles.reasonText}>
                  Reason: {order.cancellation_reason || "Cancelled by the store"}
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
    </ScrollView>
  );
}
