import { AccountEmptyState, AccountListCard } from "@/components/account/AccountUi";
import { CommerceSeeAllListFooter } from "@/components/browse/CommerceSeeAllUi";
import VendorListHeader from "@/components/vendor/VendorListHeader";
import VendorMovementFeedSheet, {
  formatVendorMovementReason,
} from "@/components/vendor/VendorMovementFeedSheet";
import VendorOptionSheet from "@/components/vendor/VendorOptionSheet";
import { VendorRowActionsProvider, VendorRowSeparator } from "@/components/vendor/VendorRowUi";
import VendorStockRow from "@/components/vendor/VendorStockRow";
import { vendorStyles } from "@/components/vendor/VendorUi";
import { VendorPulseBar, type VendorPulseMetric } from "@/components/vendor/VendorWorkspaceUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  fetchVendorInventoryFeed,
  fetchVendorProductInventoryMovements,
  type VendorInventoryFeedEntry,
  type VendorInventoryMovement,
} from "@/services/storeService";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorProduct } from "@/types/store";
import { formatCurrencyCompact } from "@/utils/currency";
import {
  getVendorStockSignal,
  sortByRestockUrgency,
  summarizeVendorInventory,
  type VendorStockSignal,
} from "@/utils/vendorInventoryIntelligence";
import {
  buildVendorCategoryOptions,
  isLowStockProduct,
  isOutOfStockProduct,
} from "@/utils/vendorProductCatalog";
import {
  buildVendorStockCsv,
  buildVendorStockCsvFilename,
} from "@/utils/vendorStockExport";
import { router, useFocusEffect } from "expo-router";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Stock, organised around the only question it has to answer: what do I reorder?
 *
 * The panel used to be a filtered list of on-hand counts, which is a readout
 * rather than a tool — a vendor could see "12" on forty rows and still not
 * know which of them to buy more of. Every addition here exists to close that
 * gap: urgency bands derived from sales velocity, a suggested quantity per
 * line, the capital tied up in stock that is not moving, and a movement feed
 * for when the numbers simply disagree with reality.
 */

type InventoryFilter = "reorder" | "out" | "low" | "all";

type StockSort = "urgency" | "stock_low" | "stock_high" | "value_high" | "name" | "updated";

const STOCK_SORTS: { value: StockSort; label: string }[] = [
  { value: "urgency", label: "Needs restocking first" },
  { value: "value_high", label: "Highest stock value" },
  { value: "stock_low", label: "Lowest stock first" },
  { value: "stock_high", label: "Highest stock first" },
  { value: "name", label: "Name A–Z" },
  { value: "updated", label: "Recently updated" },
];

function sortStock(
  products: VendorProduct[],
  sort: StockSort,
  performance: Parameters<typeof sortByRestockUrgency>[1],
  windowDays: number,
) {
  if (sort === "urgency") {
    return sortByRestockUrgency(products, performance, windowDays);
  }

  const sorted = [...products];
  if (sort === "value_high") {
    return sorted.sort(
      (a, b) => b.price * b.stock - a.price * a.stock || a.name.localeCompare(b.name),
    );
  }
  if (sort === "stock_high") {
    return sorted.sort((a, b) => b.stock - a.stock || a.name.localeCompare(b.name));
  }
  if (sort === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "updated") {
    return sorted.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }
  return sorted.sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
}

type VendorInventoryPanelProps = {
  contentPaddingBottom: number;
};

export default function VendorInventoryPanel({
  contentPaddingBottom,
}: VendorInventoryPanelProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { session } = useRequireVendor();
  const {
    fetchProductPerformance,
    fetchProducts,
    isLoadingMoreProducts,
    isLoadingProducts,
    loadMoreProducts,
    patchProductStock,
    performanceWindowDays,
    productPerformance,
    products,
    productsHasMore,
    updatingProductId,
  } = useStoreStore();
  const [filter, setFilter] = useState<InventoryFilter>("reorder");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortMode, setSortMode] = useState<StockSort>("urgency");
  const [sortOpen, setSortOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  /** Stock shown while a debounced write is still in flight. */
  const [pendingStock, setPendingStock] = useState<Record<string, number>>({});
  const stockTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [historyProduct, setHistoryProduct] = useState<VendorProduct | null>(null);
  const [historyRows, setHistoryRows] = useState<VendorInventoryMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedRows, setFeedRows] = useState<VendorInventoryFeedEntry[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchProducts(session);
      void fetchProductPerformance(session);
      return undefined;
    }, [fetchProductPerformance, fetchProducts, session]),
  );

  const signals = useMemo(() => {
    const map: Record<string, VendorStockSignal> = {};
    for (const product of products) {
      map[product.id] = getVendorStockSignal(
        product,
        productPerformance[product.id],
        performanceWindowDays,
      );
    }
    return map;
  }, [performanceWindowDays, productPerformance, products]);

  const getSignal = useCallback(
    (product: VendorProduct) =>
      signals[product.id] ??
      getVendorStockSignal(product, productPerformance[product.id], performanceWindowDays),
    [performanceWindowDays, productPerformance, signals],
  );

  const summary = useMemo(
    () => summarizeVendorInventory(products, productPerformance, performanceWindowDays),
    [performanceWindowDays, productPerformance, products],
  );

  const lowCount = useMemo(() => products.filter(isLowStockProduct).length, [products]);
  const outCount = useMemo(() => products.filter(isOutOfStockProduct).length, [products]);

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const list =
      filter === "reorder"
        ? products.filter((product) => {
            const urgency = getSignal(product).urgency;
            return urgency === "reorder_now" || urgency === "reorder_soon";
          })
        : filter === "low"
          ? products.filter(isLowStockProduct)
          : filter === "out"
            ? products.filter(isOutOfStockProduct)
            : [...products];

    const searched = needle
      ? list.filter((product) => {
          const name = product.name.toLowerCase();
          const category = (product.category || "").toLowerCase();
          const subcategory = (product.subcategory || "").toLowerCase();
          return (
            name.includes(needle) ||
            category.includes(needle) ||
            subcategory.includes(needle)
          );
        })
      : list;

    const scoped = categoryFilter
      ? searched.filter((product) => product.category === categoryFilter)
      : searched;

    return sortStock(scoped, sortMode, productPerformance, performanceWindowDays);
  }, [
    categoryFilter,
    filter,
    getSignal,
    performanceWindowDays,
    productPerformance,
    products,
    searchQuery,
    sortMode,
  ]);

  const categoryOptions = useMemo(() => buildVendorCategoryOptions(products), [products]);

  useEffect(
    () => () => {
      for (const timer of Object.values(stockTimers.current)) {
        clearTimeout(timer);
      }
    },
    [],
  );

  /**
   * One request per burst of taps, not one per tap.
   *
   * The reserved-stock guard still applies, but it is checked when the write
   * actually fires rather than on every increment — a vendor stepping from 0
   * to 6 should not be interrogated six times on the way past the threshold.
   */
  const queueStockChange = useCallback(
    (product: VendorProduct, next: number) => {
      setPendingStock((current) => ({ ...current, [product.id]: next }));

      clearTimeout(stockTimers.current[product.id]);
      stockTimers.current[product.id] = setTimeout(() => {
        const reserved = product.reservedStock ?? 0;
        const commit = () => {
          void (async () => {
            try {
              await patchProductStock(session, product.id, next);
            } catch (error) {
              showToast(
                error instanceof Error ? error.message : "Could not update stock",
                "error",
              );
            } finally {
              setPendingStock((current) => {
                const copy = { ...current };
                delete copy[product.id];
                return copy;
              });
            }
          })();
        };

        if (next < reserved) {
          Alert.alert(
            "Below reserved stock",
            `${reserved} unit${reserved === 1 ? " is" : "s are"} already committed to open orders for ${product.name}. Setting on-hand to ${next} means some of those orders may not be fulfillable.`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () =>
                  setPendingStock((current) => {
                    const copy = { ...current };
                    delete copy[product.id];
                    return copy;
                  }),
              },
              { text: "Set anyway", style: "destructive", onPress: commit },
            ],
          );
          return;
        }

        commit();
      }, 600);
    },
    [patchProductStock, session, showToast],
  );

  const openHistory = async (product: VendorProduct) => {
    setHistoryProduct(product);
    setHistoryRows([]);
    setHistoryLoading(true);
    try {
      const rows = await fetchVendorProductInventoryMovements(session, product.id, {
        limit: 40,
      });
      setHistoryRows(rows);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not load stock history",
        "error",
      );
      setHistoryProduct(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openFeed = async () => {
    setFeedOpen(true);
    setFeedLoading(true);
    try {
      setFeedRows(await fetchVendorInventoryFeed(session, { limit: 60 }));
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not load stock movements",
        "error",
      );
      setFeedOpen(false);
    } finally {
      setFeedLoading(false);
    }
  };

  /**
   * Hand the stock sheet to whatever the vendor reconciles in.
   *
   * Written to the cache directory rather than documents: it is a snapshot
   * that stops being true the moment the next order lands, so it should not
   * accumulate in the vendor's own file storage.
   */
  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const csv = buildVendorStockCsv(
        products,
        productPerformance,
        performanceWindowDays,
      );
      const file = new File(Paths.cache, buildVendorStockCsvFilename());
      // `overwrite` because exporting twice in one day is the same filename,
      // and `create` throws rather than replacing by default.
      file.create({ overwrite: true });
      file.write(csv);

      if (!(await Sharing.isAvailableAsync())) {
        showToast("Sharing isn't available on this device.", "error");
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Export stock",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not export stock.",
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const pulseMetrics: VendorPulseMetric[] = [
    {
      key: "value",
      label: "Stock value",
      value: formatCurrencyCompact(summary.stockValue),
    },
    {
      key: "units",
      label: "Units on hand",
      value: String(summary.unitsOnHand),
    },
    {
      key: "reorder",
      label: "Reorder now",
      value: String(summary.reorderNow),
      tone: summary.reorderNow > 0 ? "danger" : "neutral",
      active: filter === "reorder",
      onPress: () => setFilter("reorder"),
    },
    {
      key: "dead",
      label: "Dead capital",
      value: formatCurrencyCompact(summary.deadValue),
      tone: summary.deadValue > 0 ? "warn" : "neutral",
    },
  ];

  const emptyCopy = (() => {
    if (searchQuery.trim()) {
      return {
        icon: "layers-outline" as const,
        title: "No matching products",
        message: "Try another keyword or clear the category filter.",
      };
    }
    if (filter === "reorder") {
      return {
        icon: "checkmark-circle-outline" as const,
        title: "Nothing needs restocking",
        message: `Every selling product has more than two weeks of cover at its current rate.`,
      };
    }
    if (filter === "out") {
      return {
        icon: "checkmark-circle-outline" as const,
        title: "Nothing is out of stock",
        message: "Every product has at least one unit on hand.",
      };
    }
    if (filter === "low") {
      return {
        icon: "checkmark-circle-outline" as const,
        title: "No low stock",
        message: "No product is down to its last couple of units.",
      };
    }
    return {
      icon: "layers-outline" as const,
      title: "No products yet",
      message: "Add products to start managing stock.",
    };
  })();

  return (
    <VendorRowActionsProvider>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void Promise.all([
                fetchProducts(session),
                fetchProductPerformance(session),
              ]).finally(() => setIsRefreshing(false));
            }}
          />
        }
        // See the products list: vendorStyles.listContent's gap and padding
        // turned dense rows into separated blocks.
        contentContainerStyle={{ paddingBottom: contentPaddingBottom, flexGrow: 1 }}
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
              error={null}
              searchPlaceholder="Search stock by name or category"
              chips={[
                {
                  key: "reorder",
                  label: "Reorder",
                  count: summary.reorderNow + summary.reorderSoon,
                  urgent: true,
                },
                { key: "out", label: "Out of stock", count: outCount, urgent: true },
                { key: "low", label: "Low stock", count: lowCount },
                { key: "all", label: "All", count: products.length },
              ]}
              activeChip={filter}
              onChipChange={(key) => setFilter(key as InventoryFilter)}
              summary={filtered.length === 1 ? "1 product" : `${filtered.length} products`}
              controls={[
                ...(categoryOptions.length > 1
                  ? [
                      {
                        label: categoryFilter || "All categories",
                        onPress: () => setCategorySheetOpen(true),
                        active: Boolean(categoryFilter),
                      },
                    ]
                  : []),
                {
                  label:
                    STOCK_SORTS.find((option) => option.value === sortMode)?.label ?? "Sort",
                  onPress: () => setSortOpen(true),
                },
                {
                  label: "Movements",
                  icon: "time-outline" as const,
                  onPress: () => void openFeed(),
                },
                {
                  label: isExporting ? "Exporting…" : "Export",
                  icon: "download-outline" as const,
                  onPress: () => {
                    if (!isExporting) {
                      void exportCsv();
                    }
                  },
                },
              ]}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon={emptyCopy.icon}
              title={isLoadingProducts ? "Loading inventory" : emptyCopy.title}
              message={emptyCopy.message}
              actionLabel={products.length === 0 ? "Add product" : undefined}
              onAction={
                products.length === 0
                  ? () => router.push("/vendor/products/new" as any)
                  : undefined
              }
            />
          </View>
        }
        ItemSeparatorComponent={VendorRowSeparator}
        renderItem={({ item }) => (
          <VendorStockRow
            product={item}
            stock={pendingStock[item.id] ?? item.stock}
            signal={getSignal(item)}
            isUpdating={updatingProductId === item.id}
            onChangeStock={(next) => queueStockChange(item, next)}
            onOpenHistory={() => void openHistory(item)}
          />
        )}
        onEndReached={() => {
          if (productsHasMore && !isLoadingMoreProducts) {
            void loadMoreProducts(session);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <CommerceSeeAllListFooter
              hasMore={productsHasMore && filtered.length > 0}
              shownCount={filtered.length}
              totalCount={filtered.length}
              noun="products"
            />
          </View>
        }
      />

      <Modal
        visible={Boolean(historyProduct)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setHistoryProduct(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.screen,
            paddingTop: insets.top + rV(12),
            paddingBottom: insets.bottom + rV(16),
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: rV(12),
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  fontFamily: Fonts.titleBold,
                  fontSize: rMS(18),
                  color: colors.text,
                }}
                numberOfLines={2}
              >
                {historyProduct?.name ?? "Stock history"}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: Fonts.text,
                  fontSize: rMS(12),
                  color: colors.textMuted,
                }}
              >
                Inventory movements for this SKU
              </Text>
            </View>
            <TouchableOpacity onPress={() => setHistoryProduct(null)}>
              <Text
                style={{
                  fontFamily: Fonts.textBold,
                  fontSize: rMS(14),
                  color: colors.primary,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>

          {historyLoading ? (
            <View style={{ paddingTop: rV(40), alignItems: "center" }}>
              <ActivityIndicator color={colors.text} />
            </View>
          ) : (
            <FlatList
              data={historyRows}
              keyExtractor={(row) => row.id}
              ListEmptyComponent={
                <AccountEmptyState
                  icon="time-outline"
                  title="No movements yet"
                  message="Stock edits, sales, and bulk updates will appear here."
                />
              }
              renderItem={({ item: row }) => (
                <AccountListCard>
                  <Text
                    style={{
                      fontFamily: Fonts.textBold,
                      fontSize: rMS(13),
                      color: colors.text,
                    }}
                  >
                    {row.delta > 0 ? `+${row.delta}` : String(row.delta)} → {row.stockAfter} on hand
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: Fonts.text,
                      fontSize: rMS(12),
                      color: colors.textMuted,
                    }}
                  >
                    {formatVendorMovementReason(row.reason)}
                    {row.note ? ` · ${row.note}` : ""}
                  </Text>
                  <Text
                    style={{
                      marginTop: 2,
                      fontFamily: Fonts.text,
                      fontSize: rMS(11),
                      color: colors.textMuted,
                    }}
                  >
                    {new Date(row.createdAt).toLocaleString()}
                  </Text>
                </AccountListCard>
              )}
            />
          )}
        </View>
      </Modal>

      <VendorMovementFeedSheet
        visible={feedOpen}
        entries={feedRows}
        isLoading={feedLoading}
        onClose={() => setFeedOpen(false)}
      />

      <VendorOptionSheet
        visible={sortOpen}
        title="Sort stock"
        options={STOCK_SORTS}
        selected={sortMode}
        onSelect={setSortMode}
        onClose={() => setSortOpen(false)}
      />
      <VendorOptionSheet
        visible={categorySheetOpen}
        title="Filter by category"
        options={[
          { value: "", label: "All categories" },
          ...categoryOptions.map((option) => ({
            value: option.key,
            label: `${option.label} (${option.count})`,
          })),
        ]}
        selected={categoryFilter}
        onSelect={setCategoryFilter}
        onClose={() => setCategorySheetOpen(false)}
      />
    </VendorRowActionsProvider>
  );
}
