import { useAutoLoadOnScrollEnd } from "@/hooks/useAutoLoadOnScrollEnd";
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
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { Order } from "@/hooks/useOrders";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const ORDERS_PAGE_SIZE = 10;

export default function ProcessingTab({ orders }: { orders: Order[] }) {
  const orderStyles = useOrderStyles();
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
          icon="time-outline"
          title="No active orders yet"
          message="Orders you place will show up here while they're being prepared and delivered."
        />
      ) : (
        visibleOrders.map((order) => {
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
                {/* Cancelling lives on the detail screen, which collects the
                    reason the seller is shown and says what will actually
                    happen -- whether the order stops now or the request goes
                    to the seller, and whether a refund follows. This card
                    said "we'll move it to your cancelled orders list" and
                    sent no reason at all. */}
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
      {orders.length > visibleCount ? (
        <ShowMoreButton
          remainingCount={orders.length - visibleCount}
          onPress={() => setVisibleCount((current) => current + ORDERS_PAGE_SIZE)}
        />
      ) : null}
    </ScrollView>
  );
}
