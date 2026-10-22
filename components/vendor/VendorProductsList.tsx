import { AccountEmptyState } from "@/components/account/AccountUi";
import { CommerceSeeAllListFooter } from "@/components/browse/CommerceSeeAllUi";
import VendorListHeader from "@/components/vendor/VendorListHeader";
import VendorOptionSheet from "@/components/vendor/VendorOptionSheet";
import VendorPriceSheet from "@/components/vendor/VendorPriceSheet";
import VendorProductRow from "@/components/vendor/VendorProductRow";
import VendorProductSortSheet, {
  formatVendorSortLabel,
  type VendorProductSort,
} from "@/components/vendor/VendorProductSortSheet";
import { VendorRowActionsProvider, VendorRowSeparator } from "@/components/vendor/VendorRowUi";
import { vendorStyles } from "@/components/vendor/VendorUi";
import {
  VendorActionBar,
  VendorActionButton,
  VendorPulseBar,
  type VendorPulseMetric,
} from "@/components/vendor/VendorWorkspaceUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorProduct, VendorProductCatalogTab } from "@/types/store";
import { formatCurrencyCompact } from "@/utils/currency";
import {
  getVendorPeakUnitsSold,
  getVendorStockSignal,
  getVendorVelocityShare,
  summarizeVendorCatalogPerformance,
  type VendorStockSignal,
} from "@/utils/vendorInventoryIntelligence";
import {
  buildVendorCategoryOptions,
  buildVendorProductUpdateInput,
  countVendorProductsByCatalogTab,
  filterVendorProductsByCatalogTab,
} from "@/utils/vendorProductCatalog";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Ordering the catalog, including by how it trades.
 *
 * Takes a signal lookup rather than reading performance itself so the sort
 * stays a pure function of the rows handed to it — the list already computes
 * one signal per product for rendering, and recomputing them per comparison
 * would be quadratic on a long catalog.
 */
function sortProducts(
  products: VendorProduct[],
  sort: VendorProductSort,
  getSignal: (product: VendorProduct) => VendorStockSignal,
) {
  const sorted = [...products];
  switch (sort) {
    case "best_selling":
      return sorted.sort(
        (a, b) => getSignal(b).unitsSold - getSignal(a).unitsSold || a.name.localeCompare(b.name),
      );
    case "worst_selling":
      return sorted.sort(
        (a, b) => getSignal(a).unitsSold - getSignal(b).unitsSold || a.name.localeCompare(b.name),
      );
    case "cover_low":
      // Products with no sales have no runway to run out of, so they sort last
      // rather than ahead of a line that genuinely has two days left.
      return sorted.sort(
        (a, b) =>
          (getSignal(a).daysOfCover ?? Number.POSITIVE_INFINITY) -
          (getSignal(b).daysOfCover ?? Number.POSITIVE_INFINITY),
      );
    case "stock_low":
      return sorted.sort((a, b) => a.stock - b.stock);
    case "stock_high":
      return sorted.sort((a, b) => b.stock - a.stock);
    case "price_low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_high":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }
}

type VendorProductsListProps = {
  contentPaddingBottom: number;
};

export default function VendorProductsList({
  contentPaddingBottom,
}: VendorProductsListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { session } = useRequireVendor();
  const [activeTab, setActiveTab] = useState<VendorProductCatalogTab>("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<VendorProductSort>("best_selling");
  const [sortOpen, setSortOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStockDraft, setBulkStockDraft] = useState("");
  /**
   * Dead stock is an orthogonal filter, not a tab.
   *
   * "Not selling" cuts across live, hidden and pending — a vendor wants to see
   * the dead lines *inside* whichever part of the catalog they are working on,
   * and adding it as a sixth chip would have pushed the status row to scroll
   * for a view that is reached from the pulse metric instead.
   */
  const [onlyDeadStock, setOnlyDeadStock] = useState(false);
  const [priceProduct, setPriceProduct] = useState<VendorProduct | null>(null);
  /** Stock shown while a debounced write is still in flight. */
  const [pendingStock, setPendingStock] = useState<Record<string, number>>({});
  const stockTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(
    () => () => {
      for (const timer of Object.values(stockTimers.current)) {
        clearTimeout(timer);
      }
    },
    [],
  );

  const {
    bulkUpdateProducts,
    deleteProduct,
    error,
    fetchProductPerformance,
    fetchProducts,
    isLoadingMoreProducts,
    isLoadingProducts,
    isSavingProduct,
    loadMoreProducts,
    patchProductStock,
    performanceWindowDays,
    productPerformance,
    products,
    productsHasMore,
    setProductStatus,
    updateProduct,
    updatingProductId,
  } = useStoreStore();

  /**
   * Tapping the stepper five times is one request, not five.
   *
   * The row shows the optimistic value immediately so the control feels
   * direct, and the write lands once the vendor stops tapping.
   */
  const queueStockChange = useCallback(
    (product: VendorProduct, next: number) => {
      setPendingStock((current) => ({ ...current, [product.id]: next }));

      clearTimeout(stockTimers.current[product.id]);
      stockTimers.current[product.id] = setTimeout(() => {
        void (async () => {
          try {
            await patchProductStock(session, product.id, next);
          } catch (stockError) {
            showToast(
              stockError instanceof Error ? stockError.message : "We couldn't update stock.",
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
      }, 600);
    },
    [patchProductStock, session, showToast],
  );

  useFocusEffect(
    useCallback(() => {
      void fetchProducts(session);
      // Fired alongside rather than awaited: performance only annotates rows,
      // so the catalog must not wait on it to become readable.
      void fetchProductPerformance(session);
      return undefined;
    }, [fetchProductPerformance, fetchProducts, session]),
  );

  /**
   * Search runs on the server, debounced.
   *
   * With the list paged, an in-memory filter would only search the rows
   * already downloaded, so a product on page 7 could not be found by its own
   * name. The debounce keeps each keystroke from becoming a request.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts(session, { q: searchQuery });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const counts = useMemo(() => countVendorProductsByCatalogTab(products), [products]);
  const categoryOptions = useMemo(() => buildVendorCategoryOptions(products), [products]);

  /**
   * One signal per product, computed once per render pass.
   *
   * Both the rows and the sort comparator need it, and `getVendorStockSignal`
   * parses a date, so caching it here keeps a long catalog from recomputing
   * the same figures on every comparison.
   */
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

  const catalogSummary = useMemo(
    () => summarizeVendorCatalogPerformance(products, productPerformance, performanceWindowDays),
    [performanceWindowDays, productPerformance, products],
  );

  const peakUnitsSold = useMemo(
    () => getVendorPeakUnitsSold(products, productPerformance),
    [productPerformance, products],
  );

  const filteredProducts = useMemo(() => {
    const byTab = filterVendorProductsByCatalogTab(products, activeTab).filter(
      (product) => !categoryFilter || product.category === categoryFilter,
    );

    const scoped = onlyDeadStock
      ? byTab.filter((product) => getSignal(product).urgency === "dead")
      : byTab;

    // "Needs you" is already ordered worst-first; re-sorting it by name or
    // price would bury the sold-out items it exists to surface.
    const withPending = scoped.map((product) =>
      product.id in pendingStock
        ? { ...product, stock: pendingStock[product.id] }
        : product,
    );

    return activeTab === "attention"
      ? withPending
      : sortProducts(withPending, sortMode, getSignal);
  }, [
    activeTab,
    categoryFilter,
    getSignal,
    onlyDeadStock,
    pendingStock,
    products,
    sortMode,
  ]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchProducts(session),
        fetchProductPerformance(session),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProductPerformance, fetchProducts, session]);

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
    setBulkStockDraft("");
  };

  const visibleIds = useMemo(
    () => filteredProducts.map((product) => product.id),
    [filteredProducts],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  /**
   * Select every product currently in view, not every product in the catalog.
   *
   * Scoping it to the filtered list is what makes bulk work useful: filter to
   * "Needs you" in one category, select all, set stock — three taps instead of
   * ticking forty rows by hand.
   */
  const toggleSelectAllVisible = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const toggleSelect = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const runBulk = async (input: { stock?: number; status?: "active" | "hidden" }) => {
    if (selectedIds.length === 0) {
      showToast("Select at least one product.", "error");
      return;
    }
    try {
      await bulkUpdateProducts(session, { productIds: selectedIds, ...input });
      showToast(
        input.status === "hidden"
          ? `Hid ${selectedIds.length} products.`
          : input.status === "active"
            ? `Relisted ${selectedIds.length} products.`
            : `Updated stock on ${selectedIds.length} products.`,
        "success",
      );
      exitSelection();
    } catch (bulkError) {
      showToast(
        bulkError instanceof Error ? bulkError.message : "Bulk update failed.",
        "error",
      );
    }
  };

  const confirmBulkStock = () => {
    const next = Math.max(0, Math.floor(Number(bulkStockDraft)));
    if (!Number.isFinite(next)) {
      showToast("Enter a valid stock quantity.", "error");
      return;
    }
    Alert.alert(
      "Set stock for selected?",
      `Set on-hand stock to ${next} for ${selectedIds.length} products.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Update", onPress: () => void runBulk({ stock: next }) },
      ],
    );
  };

  /**
   * Save a price without touching anything else on the product.
   *
   * Routed through `buildVendorProductUpdateInput` because the update endpoint
   * is a whole-record write dressed as a PATCH — see that helper for the photo
   * loss it exists to prevent.
   */
  const savePrice = async (
    product: VendorProduct,
    input: { price: number; oldPrice?: number },
  ) => {
    try {
      await updateProduct(
        session,
        product.id,
        buildVendorProductUpdateInput(product, {
          price: input.price,
          oldPrice: input.oldPrice,
        }),
      );
      setPriceProduct(null);
      showToast("Price updated.", "success");
    } catch (priceError) {
      showToast(
        priceError instanceof Error ? priceError.message : "We couldn't update the price.",
        "error",
      );
    }
  };

  const pulseMetrics: VendorPulseMetric[] = [
    {
      key: "sales",
      label: `${performanceWindowDays}d sales`,
      value: formatCurrencyCompact(catalogSummary.grossSales),
    },
    {
      key: "units",
      label: "Units sold",
      value: String(catalogSummary.unitsSold),
    },
    {
      key: "selling",
      label: "Selling",
      value: String(catalogSummary.sellingCount),
      tone: "good",
    },
    {
      key: "dead",
      label: "Not selling",
      value: String(catalogSummary.deadCount),
      tone: catalogSummary.deadCount > 0 ? "warn" : "neutral",
      active: onlyDeadStock,
      // The metric is also the filter: reading "4 not selling" and then
      // hunting for those four rows is the same intent twice.
      onPress:
        catalogSummary.deadCount > 0 || onlyDeadStock
          ? () => setOnlyDeadStock((current) => !current)
          : undefined,
    },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bulkInput: {
          flex: 1,
          minWidth: rMS(56),
          paddingHorizontal: rMS(10),
          paddingVertical: rV(11),
          borderRadius: rMS(11),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.inputBorder,
          backgroundColor: colors.inputBg,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        deadBanner: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(10),
          paddingHorizontal: rS(12),
          paddingVertical: rV(10),
          borderRadius: rMS(11),
          backgroundColor: colors.warningSoft,
        },
        deadBannerText: {
          flex: 1,
          fontFamily: Fonts.title,
          fontSize: rMS(11.5),
          color: colors.warningText,
        },
        deadBannerClear: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
          color: colors.warningText,
        },
      }),
    [colors],
  );

  const list = (
    <FlatList
      style={{ flex: 1 }}
      data={filteredProducts}
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
        if (productsHasMore && !isLoadingMoreProducts) {
          void loadMoreProducts(session);
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <CommerceSeeAllListFooter
            hasMore={productsHasMore && filteredProducts.length > 0}
            shownCount={filteredProducts.length}
            totalCount={filteredProducts.length}
            noun="products"
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
            searchPlaceholder="Search products by name or category"
            chips={[
              { key: "attention", label: "Needs you", count: counts.attention, urgent: true },
              { key: "live", label: "Live", count: counts.live },
              { key: "all", label: "All", count: counts.all },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "hidden", label: "Hidden", count: counts.hidden },
            ]}
            activeChip={activeTab}
            onChipChange={(key) => setActiveTab(key as VendorProductCatalogTab)}
            summary={
              selectionMode
                ? `${selectedIds.length} selected`
                : filteredProducts.length === 1
                  ? "1 product"
                  : `${filteredProducts.length} products`
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
                : [
                    ...(categoryOptions.length > 1
                      ? [
                          {
                            label: categoryFilter || "All categories",
                            onPress: () => setCategorySheetOpen(true),
                            active: Boolean(categoryFilter),
                          },
                        ]
                      : []),
                    ...(activeTab === "attention"
                      ? []
                      : [
                          {
                            label: formatVendorSortLabel(sortMode),
                            onPress: () => setSortOpen(true),
                          },
                        ]),
                  ]
            }
          />

          {onlyDeadStock ? (
            <View style={styles.deadBanner}>
              <Text style={styles.deadBannerText}>
                Showing products with no sales in {performanceWindowDays} days. Try a
                lower price, a better photo, or hide them.
              </Text>
              <TouchableOpacity activeOpacity={0.75} onPress={() => setOnlyDeadStock(false)}>
                <Text style={styles.deadBannerClear}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          {/* An empty "Needs you" tab is good news, not an absence — saying
              "no products yet" to a vendor whose catalog is simply healthy
              reads as though something is broken. */}
          <AccountEmptyState
            icon={
              (activeTab === "attention" || onlyDeadStock) && !searchQuery.trim()
                ? "checkmark-circle-outline"
                : "cube-outline"
            }
            title={
              isLoadingProducts
                ? "Loading products"
                : searchQuery.trim()
                  ? "No matching products"
                  : onlyDeadStock
                    ? "Everything is selling"
                    : activeTab === "attention"
                      ? "Nothing needs you"
                      : activeTab === "live"
                        ? "No live products"
                        : activeTab === "pending"
                          ? "Nothing awaiting approval"
                          : activeTab === "hidden"
                            ? "No hidden products"
                            : "No products yet"
            }
            message={
              searchQuery.trim()
                ? "Try another keyword or switch catalog tabs."
                : onlyDeadStock
                  ? `Every product in this view has sold at least once in the last ${performanceWindowDays} days.`
                  : activeTab === "attention"
                    ? "Every live product has stock, a photo and a price. We'll flag anything that slips."
                    : activeTab === "all"
                      ? "Add your first product to start building the vendor catalog."
                      : "Switch tabs or add a new listing for your store."
            }
            actionLabel={
              !searchQuery.trim() && !onlyDeadStock && activeTab !== "attention"
                ? "Add product"
                : undefined
            }
            onAction={
              !searchQuery.trim() && !onlyDeadStock && activeTab !== "attention"
                ? () => router.push("/vendor/products/new" as any)
                : undefined
            }
          />
        </View>
      }
      ItemSeparatorComponent={VendorRowSeparator}
      renderItem={({ item }) => {
        const signal = getSignal(item);
        return (
          <VendorProductRow
            product={item}
            stock={pendingStock[item.id] ?? item.stock}
            signal={signal}
            velocityShare={getVendorVelocityShare(signal.unitsSold, peakUnitsSold)}
            isUpdating={updatingProductId === item.id || updatingProductId === "bulk"}
            selectionMode={selectionMode}
            selected={selectedIds.includes(item.id)}
            onToggleSelect={() => {
              if (!selectionMode) {
                setSelectionMode(true);
              }
              toggleSelect(item.id);
            }}
            onPress={() =>
              router.push({
                pathname: "/vendor/products/new" as any,
                params: { productId: item.id },
              })
            }
            onAdjustStock={(next) => queueStockChange(item, next)}
            onEditPrice={() => setPriceProduct(item)}
            onDuplicate={() =>
              router.push({
                pathname: "/vendor/products/new" as any,
                params: { duplicateFrom: item.id },
              })
            }
            onHide={() => {
              void (async () => {
                try {
                  await setProductStatus(session, item.id, "hidden");
                  showToast("Product hidden from your storefront.");
                } catch (updateError) {
                  showToast(
                    updateError instanceof Error
                      ? updateError.message
                      : "We couldn't hide that product.",
                    "error",
                  );
                }
              })();
            }}
            onUnhide={() => {
              void (async () => {
                try {
                  await setProductStatus(session, item.id, "active");
                  showToast("Product relisted on your storefront.");
                } catch (updateError) {
                  showToast(
                    updateError instanceof Error
                      ? updateError.message
                      : "We couldn't relist that product.",
                    "error",
                  );
                }
              })();
            }}
            onDelete={() => {
              Alert.alert("Delete product?", `"${item.name}" will be removed for good.`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    void (async () => {
                      try {
                        await deleteProduct(session, item.id);
                        showToast("Product removed.", "success");
                      } catch (deleteError) {
                        showToast(
                          deleteError instanceof Error
                            ? deleteError.message
                            : "We couldn't delete that product.",
                          "error",
                        );
                      }
                    })();
                  },
                },
              ]);
            }}
          />
        );
      }}
    />
  );

  return (
    <VendorRowActionsProvider>
      <View style={{ flex: 1 }}>
        {list}

        {/* Bulk actions sit at the bottom, where the thumb already is after
            ticking rows, and stay reachable while the list scrolls. */}
        {selectionMode ? (
          <VendorActionBar bottomInset={insets.bottom}>
            <VendorActionButton
              label="Hide"
              icon="eye-off-outline"
              onPress={() => void runBulk({ status: "hidden" })}
            />
            <VendorActionButton
              label="Relist"
              icon="eye-outline"
              onPress={() => void runBulk({ status: "active" })}
            />
            <TextInput
              value={bulkStockDraft}
              onChangeText={(text) => setBulkStockDraft(text.replace(/[^0-9]/g, ""))}
              placeholder="Stock"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.bulkInput}
            />
            <VendorActionButton label="Set" variant="solid" onPress={confirmBulkStock} />
          </VendorActionBar>
        ) : null}

        <VendorPriceSheet
          product={priceProduct}
          isSaving={isSavingProduct}
          onSave={(input) => {
            if (priceProduct) {
              void savePrice(priceProduct, input);
            }
          }}
          onClose={() => setPriceProduct(null)}
        />

        <VendorProductSortSheet
          visible={sortOpen}
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
      </View>
    </VendorRowActionsProvider>
  );
}
