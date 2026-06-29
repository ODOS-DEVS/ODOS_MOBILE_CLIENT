import {
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
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

function formatDeliveredText(order: Order) {
  const value = order.delivered_at ?? order.placed_at;
  return `Delivered ${formatOrderDateShort(value)}`;
}

export default function DeliveredTab({ orders }: { orders: Order[] }) {
  const orderStyles = useOrderStyles();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={orderStyles.tabContent}>
      {orders.length === 0 ? (
        <AccountEmptyState
          icon="checkmark-done-outline"
          title="No delivered orders yet"
          message="Once orders are completed, their receipts and delivery details will show up here."
        />
      ) : (
        orders.map((order) => {
          const item = getOrderPrimaryItem(order);

          return (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.86}
              onPress={() =>
                router.push({
                  pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                  params: { orderId: order.id },
                })
              }
            >
              <AccountListCard>
                <View style={orderStyles.orderTopRow}>
                  <OrderThumbnail order={order} />
                  <View style={orderStyles.orderInfo}>
                    <Text style={orderStyles.orderNumber}>#{order.order_number}</Text>
                    <Text style={orderStyles.orderTitle}>{item?.title ?? "Order item"}</Text>
                    <Text style={orderStyles.orderMeta}>{item?.category ?? "Product"}</Text>
                    <Text style={[orderStyles.orderMeta, orderStyles.orderMetaSuccess]}>
                      {formatDeliveredText(order)}
                    </Text>
                  </View>
                  <View style={orderStyles.rightColumn}>
                    <AccountBadge label="Delivered" tone="success" />
                    <Text style={orderStyles.price}>{formatOrderMoney(order.total_amount)}</Text>
                    <Ionicons name="chevron-forward" size={rMS(16)} color="#D1D5DB" />
                  </View>
                </View>
              </AccountListCard>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}
