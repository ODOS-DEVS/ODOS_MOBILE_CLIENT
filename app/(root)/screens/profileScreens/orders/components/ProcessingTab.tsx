import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountEmptyState,
  AccountListCard,
  formatOrderDateShort,
  getOrderPrimaryItem,
  getOrderStatusPresentation,
  OrderProgressBar,
  OrderThumbnail,
  OrderTrackingPreview,
  useOrderStyles,
} from "@/components/orders/OrderUi";
import { Order } from "@/hooks/useOrders";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";

export default function ProcessingTab({
  orders,
  onCancelOrder,
  isMutatingOrder,
}: {
  orders: Order[];
  onCancelOrder: (orderId: string) => Promise<unknown>;
  isMutatingOrder: boolean;
}) {
  const orderStyles = useOrderStyles();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={orderStyles.tabContent}>
      {orders.length === 0 ? (
        <AccountEmptyState
          icon="time-outline"
          title="No active orders yet"
          message="Orders you place will show up here while they're being prepared and delivered."
        />
      ) : (
        orders.map((order) => {
          const item = getOrderPrimaryItem(order);
          const status = getOrderStatusPresentation(order);

          return (
            <AccountListCard key={order.id}>
              <View style={orderStyles.orderTopRow}>
                <OrderThumbnail order={order} />
                <View style={orderStyles.orderInfo}>
                  <Text style={orderStyles.orderNumber}>#{order.order_number}</Text>
                  <Text style={orderStyles.orderTitle}>{item?.title ?? "Order item"}</Text>
                  <Text style={orderStyles.orderMeta}>
                    {item?.category ?? "Product"} · Placed {formatOrderDateShort(order.placed_at)}
                  </Text>
                </View>
                <AccountBadge label={status.label} tone={status.tone} />
              </View>

              <OrderProgressBar
                progress={order.progress ?? 0.18}
                eta={order.tracking_eta}
              />

              <OrderTrackingPreview order={order} />

              <AccountActionRow>
                <AccountActionButton
                  label={isMutatingOrder ? "Updating..." : "Cancel Order"}
                  variant="secondary"
                  disabled={isMutatingOrder}
                  onPress={() =>
                    Alert.alert(
                      "Cancel this order?",
                      "We'll move it to your cancelled orders list.",
                      [
                        { text: "Keep order", style: "cancel" },
                        {
                          text: "Cancel order",
                          style: "destructive",
                          onPress: () => {
                            void onCancelOrder(order.id);
                          },
                        },
                      ],
                    )
                  }
                />
                <AccountActionButton
                  label="View Details"
                  variant="primary"
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/screens/profileScreens/orders/[orderId]" as any,
                      params: { orderId: order.id },
                    })
                  }
                />
              </AccountActionRow>
            </AccountListCard>
          );
        })
      )}
    </ScrollView>
  );
}
