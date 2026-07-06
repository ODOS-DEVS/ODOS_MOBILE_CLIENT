import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorOrderCard from "@/components/vendor/VendorOrderCard";
import VendorOrderQueueTabs from "@/components/vendor/VendorOrderQueueTabs";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import type { VendorOrderQueueTab } from "@/types/store";
import {
  countVendorOrdersByQueue,
  filterVendorOrdersByQueue,
} from "@/utils/vendorOrderFulfillment";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const QUEUE_TABS = new Set(["new", "active", "done"]);

export default function VendorOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const tabParam = getParam(params.tab);
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [activeTab, setActiveTab] = useState<VendorOrderQueueTab>("new");
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
      if (!hasVendorAccess) {
        return undefined;
      }
      void fetchOrders(session);
      return undefined;
    }, [fetchOrders, hasVendorAccess, session]),
  );

  useEffect(() => {
    if (tabParam && QUEUE_TABS.has(tabParam)) {
      setActiveTab(tabParam as VendorOrderQueueTab);
    }
  }, [tabParam]);

  const counts = useMemo(() => countVendorOrdersByQueue(orders), [orders]);
  const filteredOrders = useMemo(
    () => filterVendorOrdersByQueue(orders, activeTab),
    [activeTab, orders],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders(session);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders, session]);

  const openOrder = (orderId: string) => {
    router.push({
      pathname: "/vendor/orders/[orderId]" as any,
      params: { orderId },
    });
  };

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell title="Orders" loading loadingLabel="Loading orders..." />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (isLoadingOrders && orders.length === 0) {
    return <VendorScreenShell title="Orders" loading loadingLabel="Loading orders..." />;
  }

  return (
    <VendorScreenShell title="Orders">
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
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(14) }]}>
            <VendorPageIntro
              title="Order command center"
              subtitle="New orders first, with wait times and full customer details one tap away."
              stats={[
                { value: counts.new, label: "New" },
                { value: counts.active, label: "Active" },
                { value: counts.done, label: "Done" },
              ]}
              error={error}
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
              title={
                activeTab === "new"
                  ? "No new orders"
                  : activeTab === "active"
                    ? "Nothing in progress"
                    : "No completed orders yet"
              }
              message={
                activeTab === "new"
                  ? "New shopper orders will appear here with wait timers and alert badges."
                  : activeTab === "active"
                    ? "Orders you confirm will move here while you prepare and deliver them."
                    : "Delivered and cancelled orders will show up in this history view."
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorOrderCard order={item} onPress={() => openOrder(item.id)} />
            {isUpdatingOrder && updatingOrderId === item.id ? (
              <View style={{ marginTop: rV(8), alignItems: "center" }}>
                <ScreenLoader label="Updating order" />
              </View>
            ) : null}
          </View>
        )}
      />
    </VendorScreenShell>
  );
}
