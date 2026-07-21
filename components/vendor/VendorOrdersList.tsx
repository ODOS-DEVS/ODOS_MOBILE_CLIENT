import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorListSearch from "@/components/vendor/VendorListSearch";
import VendorOrderCard from "@/components/vendor/VendorOrderCard";
import VendorOrderQueueTabs from "@/components/vendor/VendorOrderQueueTabs";
import {
  VendorPageIntro,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import type { VendorOrder, VendorOrderQueueTab } from "@/types/store";
import {
  countVendorOrdersByQueue,
  filterVendorOrdersByQueue,
} from "@/utils/vendorOrderFulfillment";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

function matchesOrderQuery(order: VendorOrder, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    order.orderNumber,
    order.id,
    order.customerName,
    order.customerPhone,
    ...order.items.map((item) => item.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

type VendorOrdersListProps = {
  introTitle: string;
  introSubtitle: string;
  contentPaddingBottom: number;
  initialTab?: VendorOrderQueueTab;
  tabParam?: string | null;
};

export default function VendorOrdersList({
  introTitle,
  introSubtitle,
  contentPaddingBottom,
  initialTab = "new",
  tabParam,
}: VendorOrdersListProps) {
  const { contentMaxWidth } = useResponsive();
  const { session } = useRequireVendor();
  const [activeTab, setActiveTab] = useState<VendorOrderQueueTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    error,
    fetchOrders,
    isLoadingOrders,
    isUpdatingOrder,
    updatingOrderId,
    orders,
  } = useStoreStore();

  useFocusEffect(
    useCallback(() => {
      void fetchOrders(session);
      return undefined;
    }, [fetchOrders, session]),
  );

  useEffect(() => {
    if (tabParam === "new" || tabParam === "active" || tabParam === "done") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const counts = useMemo(() => countVendorOrdersByQueue(orders), [orders]);
  const filteredOrders = useMemo(() => {
    const byQueue = filterVendorOrdersByQueue(orders, activeTab);
    return byQueue.filter((order) => matchesOrderQuery(order, searchQuery));
  }, [activeTab, orders, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders(session);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders, session]);

  const emptyTitle = searchQuery.trim()
    ? "No matching orders"
    : activeTab === "new"
      ? "No new orders"
      : activeTab === "active"
        ? "Nothing in progress"
        : "No completed orders yet";

  const emptyMessage = searchQuery.trim()
    ? "Try another order number, customer name, or product."
    : activeTab === "new"
      ? "New shopper orders will appear here with wait timers and alert badges."
      : activeTab === "active"
        ? "Orders you confirm will move here while you prepare and deliver them."
        : "Delivered and cancelled orders will show up in this history view.";

  return (
    <FlatList
      data={filteredOrders}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />
      }
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        vendorStyles.listContent,
        { paddingBottom: contentPaddingBottom },
      ]}
      ListHeaderComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(14) }]}>
          <VendorPageIntro
            title={introTitle}
            subtitle={introSubtitle}
            stats={[
              { value: counts.new, label: "New" },
              { value: counts.active, label: "Active" },
              { value: counts.done, label: "Done" },
            ]}
            error={error}
          />
          <VendorListSearch
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search orders, customers, products"
          />
          <VendorOrderQueueTabs
            activeTab={activeTab}
            counts={counts}
            onChange={setActiveTab}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountEmptyState
            icon="receipt-outline"
            title={isLoadingOrders ? "Loading orders" : emptyTitle}
            message={emptyMessage}
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <VendorOrderCard
            order={item}
            onPress={() =>
              router.push({
                pathname: "/vendor/orders/[orderId]" as any,
                params: { orderId: item.id },
              })
            }
          />
          {isUpdatingOrder && updatingOrderId === item.id ? (
            <View
              style={{
                marginTop: rV(8),
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ActivityIndicator size="small" />
              <Text style={{ fontSize: 12, color: "#6B7280" }}>Updating order...</Text>
            </View>
          ) : null}
        </View>
      )}
    />
  );
}
