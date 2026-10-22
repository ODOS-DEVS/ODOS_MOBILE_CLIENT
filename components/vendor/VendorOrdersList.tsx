import { AccountEmptyState } from "@/components/account/AccountUi";
import { CommerceSeeAllListFooter } from "@/components/browse/CommerceSeeAllUi";
import VendorListHeader from "@/components/vendor/VendorListHeader";
import VendorOptionSheet from "@/components/vendor/VendorOptionSheet";
import VendorOrderRow from "@/components/vendor/VendorOrderRow";
import VendorPackingSlipSheet from "@/components/vendor/VendorPackingSlipSheet";
import { VendorRowActionsProvider, VendorRowSeparator } from "@/components/vendor/VendorRowUi";
import { vendorStyles } from "@/components/vendor/VendorUi";
import {
  VendorActionBar,
  VendorActionButton,
  VendorPulseBar,
  type VendorPulseMetric,
} from "@/components/vendor/VendorWorkspaceUi";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import { useStoreStore } from "@/stores/storeStore";
import { rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorOrder, VendorOrderQueueTab, VendorOrderStatus } from "@/types/store";
import { formatCurrencyCompact } from "@/utils/currency";
import {
  countVendorOrdersByQueue,
  filterVendorOrdersByQueue,
  formatVendorOrderSortLabel,
  formatVendorOrderStatus,
  getVendorOrderNextActionLabel,
  groupVendorOrdersByAdvanceableStatus,
  normalizePhoneForDialer,
  sortVendorOrders,
  VENDOR_ORDER_NEXT_STATUS,
  VENDOR_ORDER_SORTS,
  type VendorOrderSort,
} from "@/utils/vendorOrderFulfillment";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Linking, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VENDOR_ORDER_QUEUE_TABS: VendorOrderQueueTab[] = [
  "overdue",
  "new",
  "active",
  "done",
];

function isVendorOrderQueueTab(value: string | null): value is VendorOrderQueueTab {
  return value !== null && (VENDOR_ORDER_QUEUE_TABS as string[]).includes(value);
}

type VendorOrdersListProps = {
  contentPaddingBottom: number;
  initialTab?: VendorOrderQueueTab;
  tabParam?: string | null;
};

export default function VendorOrdersList({
  contentPaddingBottom,
  initialTab = "new",
  tabParam,
}: VendorOrdersListProps) {
  const { contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const { session, hasVendorAccess } = useRequireVendor();
  const { showToast } = useToast();
  /**
   * The chosen tab, tagged with the URL param it was chosen under.
   *
   * The tab used to be plain state synced from `tabParam` in an effect, which
   * meant every deep link rendered the wrong queue once and then re-rendered —
   * and tripped `react-hooks/set-state-in-effect`. Tagging the vendor's choice
   * with the param it was made under lets a *new* param discard a stale
   * choice automatically, so the tab is derived rather than synchronised.
   */
  const [chosenTab, setChosenTab] = useState<{
    param: string | null;
    tab: VendorOrderQueueTab;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<VendorOrderSort>("oldest");
  const [sortOpen, setSortOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkAdvancing, setIsBulkAdvancing] = useState(false);
  const [packingSlipOrder, setPackingSlipOrder] = useState<VendorOrder | null>(null);
  const {
    error,
    fetchOrders,
    isLoadingOrders,
    isLoadingMoreOrders,
    isUpdatingOrder,
    loadMoreOrders,
    ordersHasMore,
    updateOrderStatus,
    updatingOrderId,
    orders,
  } = useStoreStore();

  /**
   * Today's takings come from the analytics endpoint, not from these rows.
   *
   * The queue is paged, so summing the loaded orders would report whatever
   * happens to be downloaded — a vendor scrolling further would watch their
   * daily total climb. The endpoint aggregates server-side over every order,
   * and the hook falls back to a local estimate only when it cannot be
   * reached.
   */
  const { analytics } = useVendorAnalytics(session, hasVendorAccess);

  useFocusEffect(
    useCallback(() => {
      void fetchOrders(session);
      return undefined;
    }, [fetchOrders, session]),
  );

  /**
   * Search runs on the server, debounced.
   *
   * Now that the list is paged, filtering in memory would only ever search the
   * rows already downloaded — an order on page 4 would be invisible to its own
   * number. The debounce keeps a keystroke from becoming a request.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders(session, { q: searchQuery });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const paramKey = tabParam ?? null;
  const activeTab: VendorOrderQueueTab =
    chosenTab && chosenTab.param === paramKey
      ? chosenTab.tab
      : isVendorOrderQueueTab(paramKey)
        ? paramKey
        : initialTab;
  const setActiveTab = (tab: VendorOrderQueueTab) =>
    setChosenTab({ param: paramKey, tab });

  const counts = useMemo(() => countVendorOrdersByQueue(orders), [orders]);
  const filteredOrders = useMemo(() => {
    const byQueue = filterVendorOrdersByQueue(orders, activeTab);

    // Overdue is already ordered longest-waiting first; re-sorting it by value
    // or recency would bury the orders it exists to surface.
    return activeTab === "overdue" ? byQueue : sortVendorOrders(byQueue, sortMode);
  }, [activeTab, orders, sortMode]);

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const visibleIds = useMemo(
    () => filteredOrders.map((order) => order.id),
    [filteredOrders],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const toggleSelect = (orderId: string) => {
    setSelectedIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedIds.includes(order.id)),
    [orders, selectedIds],
  );

  /**
   * The bulk actions available for the current selection.
   *
   * One per current status rather than a single "advance everything", so the
   * button says what will actually happen — "Confirm 4" and "Dispatch 2" are
   * two different promises, and collapsing them into one would scatter the
   * selection across the pipeline with no way to describe the result.
   */
  const advanceGroups = useMemo(
    () => groupVendorOrdersByAdvanceableStatus(selectedOrders),
    [selectedOrders],
  );

  /** Move one order to its next status straight from the list. */
  const advanceOrder = useCallback(
    async (order: VendorOrder) => {
      const next = VENDOR_ORDER_NEXT_STATUS[order.status];
      if (!next) {
        return;
      }
      try {
        await updateOrderStatus(session, order.id, next);
        showToast(`${order.orderNumber} → ${formatVendorOrderStatus(next)}`, "success");
      } catch (updateError) {
        showToast(
          updateError instanceof Error
            ? updateError.message
            : "We couldn't update that order.",
          "error",
        );
      }
    },
    [session, showToast, updateOrderStatus],
  );

  /**
   * Advance a whole status group in one gesture.
   *
   * Issued as one request per order because there is no bulk order endpoint
   * yet — `allSettled` rather than `all` so one rejected order cannot discard
   * the ones that already succeeded, and the toast reports the split honestly
   * instead of claiming a clean sweep.
   */
  const runBulkAdvance = async (status: VendorOrderStatus, group: VendorOrder[]) => {
    const next = VENDOR_ORDER_NEXT_STATUS[status];
    if (!next) {
      return;
    }

    const actionLabel = getVendorOrderNextActionLabel(status) ?? "Advance";
    Alert.alert(
      `${actionLabel} ${group.length} order${group.length === 1 ? "" : "s"}?`,
      `They will all move to ${formatVendorOrderStatus(next)}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionLabel,
          onPress: () => {
            void (async () => {
              setIsBulkAdvancing(true);
              try {
                const results = await Promise.allSettled(
                  group.map((order) => updateOrderStatus(session, order.id, next)),
                );
                const failed = results.filter(
                  (result) => result.status === "rejected",
                ).length;
                const moved = results.length - failed;

                if (failed === 0) {
                  showToast(
                    `${moved} order${moved === 1 ? "" : "s"} → ${formatVendorOrderStatus(next)}`,
                    "success",
                  );
                  exitSelection();
                } else {
                  showToast(
                    `${moved} moved, ${failed} failed. Pull to refresh and retry.`,
                    "error",
                  );
                  // The selection is kept so the vendor can retry the
                  // remainder rather than re-tick every row.
                }
              } finally {
                setIsBulkAdvancing(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders(session);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders, session]);

  const callCustomer = (order: VendorOrder) => {
    const dialable = normalizePhoneForDialer(order.customerPhone);
    if (!dialable) {
      return;
    }
    void Linking.openURL(`tel:${dialable}`);
  };

  const pulseMetrics: VendorPulseMetric[] = [
    {
      key: "today",
      label: "Today",
      value: formatCurrencyCompact(analytics.todaySales),
    },
    {
      key: "orders",
      label: "Orders today",
      value: String(analytics.todayOrders),
    },
    {
      key: "open",
      label: "To fulfil",
      value: String(counts.new + counts.active),
    },
    {
      key: "late",
      label: "Late",
      value: String(counts.overdue),
      tone: counts.overdue > 0 ? "danger" : "neutral",
      active: activeTab === "overdue",
      // Reading "2 late" and then hunting for the overdue queue is the same
      // intent twice, so the number is the way in.
      onPress: counts.overdue > 0 ? () => setActiveTab("overdue") : undefined,
    },
  ];

  const emptyTitle = searchQuery.trim()
    ? "No matching orders"
    : activeTab === "overdue"
      ? "Nothing is overdue"
      : activeTab === "new"
        ? "No new orders"
        : activeTab === "active"
          ? "Nothing in progress"
          : "No completed orders yet";

  const emptyMessage = searchQuery.trim()
    ? "Try another order number, customer name, or product."
    : activeTab === "overdue"
      ? "Every open order is still inside its response window. We'll flag any that slip."
      : activeTab === "new"
        ? "New shopper orders will appear here with wait timers and alert badges."
        : activeTab === "active"
          ? "Orders you confirm will move here while you prepare and deliver them."
          : "Delivered and cancelled orders will show up in this history view.";

  const list = (
    <FlatList
      style={{ flex: 1 }}
      data={filteredOrders}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={7}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />
      }
      contentInsetAdjustmentBehavior="automatic"
      // Deliberately not vendorStyles.listContent: that carries gap:12 and
      // horizontal padding, which on top of each row's own padding rendered
      // the "dense" list as a column of separated, double-indented blocks.
      // Rows run flush and own their padding; the separator draws the line.
      contentContainerStyle={{ paddingBottom: contentPaddingBottom, flexGrow: 1 }}
      onEndReached={() => {
        if (ordersHasMore && !isLoadingMoreOrders) {
          void loadMoreOrders(session);
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <CommerceSeeAllListFooter
            hasMore={ordersHasMore && filteredOrders.length > 0}
            shownCount={filteredOrders.length}
            totalCount={filteredOrders.length}
            noun="orders"
          />
        </View>
      }
      ListHeaderComponent={
        <View
          style={[
            vendorStyles.contentWrap,
            {
              paddingHorizontal: rS(16),
              maxWidth: contentMaxWidth,
              paddingTop: rV(12),
              paddingBottom: rV(14),
              gap: rV(12),
            },
          ]}
        >
          <VendorPulseBar metrics={pulseMetrics} />

          <VendorListHeader
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            error={error}
            searchPlaceholder="Search orders, customers, products"
            chips={[
              { key: "overdue", label: "Overdue", count: counts.overdue, urgent: true },
              { key: "new", label: "New", count: counts.new },
              { key: "active", label: "In progress", count: counts.active },
              { key: "done", label: "Done", count: counts.done },
            ]}
            activeChip={activeTab}
            onChipChange={(key) => setActiveTab(key as VendorOrderQueueTab)}
            summary={
              selectionMode
                ? `${selectedIds.length} selected`
                : filteredOrders.length === 1
                  ? "1 order"
                  : `${filteredOrders.length} orders`
            }
            controls={
              selectionMode
                ? [
                    {
                      label: allVisibleSelected ? "Clear all" : "Select all",
                      onPress: toggleSelectAllVisible,
                      active: true,
                    },
                    { label: "Done", onPress: exitSelection, active: true },
                  ]
                : activeTab === "overdue"
                  ? undefined
                  : [
                      {
                        label: formatVendorOrderSortLabel(sortMode),
                        onPress: () => setSortOpen(true),
                      },
                    ]
            }
          />
        </View>
      }
      ListEmptyComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountEmptyState
            icon={
              activeTab === "overdue" && !searchQuery.trim()
                ? "checkmark-circle-outline"
                : "receipt-outline"
            }
            title={isLoadingOrders ? "Loading orders" : emptyTitle}
            message={emptyMessage}
          />
        </View>
      }
      ItemSeparatorComponent={VendorRowSeparator}
      renderItem={({ item }) => (
        <VendorOrderRow
          order={item}
          isAdvancing={
            (isUpdatingOrder && updatingOrderId === item.id) ||
            (isBulkAdvancing && selectedIds.includes(item.id))
          }
          selectionMode={selectionMode}
          selected={selectedIds.includes(item.id)}
          onToggleSelect={() => {
            if (!selectionMode) {
              setSelectionMode(true);
            }
            toggleSelect(item.id);
          }}
          onAdvance={() => void advanceOrder(item)}
          onPress={() =>
            router.push({
              pathname: "/vendor/orders/[orderId]" as any,
              params: { orderId: item.id },
            })
          }
          onPackingSlip={() => setPackingSlipOrder(item)}
          onCall={
            normalizePhoneForDialer(item.customerPhone) ? () => callCustomer(item) : null
          }
        />
      )}
    />
  );

  return (
    <VendorRowActionsProvider>
      <View style={{ flex: 1 }}>
        {list}

        {selectionMode ? (
          <VendorActionBar bottomInset={insets.bottom}>
            {advanceGroups.size === 0 ? (
              <VendorActionButton
                label="Nothing to advance"
                onPress={exitSelection}
                disabled
                grow
              />
            ) : (
              Array.from(advanceGroups.entries()).map(([status, group], index) => (
                <VendorActionButton
                  key={status}
                  label={`${getVendorOrderNextActionLabel(status)} ${group.length}`}
                  // The largest group leads as the filled button; the rest stay
                  // quiet so the common case reads as one obvious action.
                  variant={index === 0 ? "solid" : "ghost"}
                  disabled={isBulkAdvancing}
                  grow
                  onPress={() => void runBulkAdvance(status, group)}
                />
              ))
            )}
          </VendorActionBar>
        ) : null}

        <VendorPackingSlipSheet
          order={packingSlipOrder}
          onClose={() => setPackingSlipOrder(null)}
        />

        <VendorOptionSheet
          visible={sortOpen}
          title="Sort orders"
          options={VENDOR_ORDER_SORTS}
          selected={sortMode}
          onSelect={setSortMode}
          onClose={() => setSortOpen(false)}
        />
      </View>
    </VendorRowActionsProvider>
  );
}
