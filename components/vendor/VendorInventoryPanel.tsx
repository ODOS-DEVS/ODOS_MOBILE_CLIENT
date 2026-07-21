import { AccountEmptyState, AccountListCard } from "@/components/account/AccountUi";
import VendorListSearch from "@/components/vendor/VendorListSearch";
import {
  VendorPageIntro,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  fetchVendorProductInventoryMovements,
  type VendorInventoryMovement,
} from "@/services/storeService";
import { useStoreStore } from "@/stores/storeStore";
import type { VendorProduct } from "@/types/store";
import {
  isLowStockProduct,
  isOutOfStockProduct,
  LOW_STOCK_THRESHOLD,
} from "@/utils/vendorProductCatalog";
import { rMS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type InventoryFilter = "all" | "low" | "out";

function formatMovementReason(reason: string) {
  switch (reason) {
    case "manual":
      return "Manual adjustment";
    case "bulk":
      return "Bulk update";
    case "order_sale":
      return "Order sale";
    case "return_restock":
      return "Return restock";
    case "system":
      return "System";
    default:
      return reason.replace(/_/g, " ");
  }
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
  const { fetchProducts, patchProductStock, products, isLoadingProducts, updatingProductId } =
    useStoreStore();
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draftStock, setDraftStock] = useState<Record<string, string>>({});
  const [historyProduct, setHistoryProduct] = useState<VendorProduct | null>(null);
  const [historyRows, setHistoryRows] = useState<VendorInventoryMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchProducts(session);
      return undefined;
    }, [fetchProducts, session]),
  );

  const lowCount = useMemo(
    () => products.filter(isLowStockProduct).length,
    [products],
  );
  const outCount = useMemo(
    () => products.filter(isOutOfStockProduct).length,
    [products],
  );

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const list =
      filter === "low"
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
    return searched.sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
  }, [filter, products, searchQuery]);

  const saveStock = async (product: VendorProduct) => {
    const raw = draftStock[product.id] ?? String(product.stock);
    const next = Math.max(0, Math.floor(Number(raw)));
    if (!Number.isFinite(next) || next === product.stock) return;
    try {
      await patchProductStock(session, product.id, next);
      showToast(`Updated ${product.name} on-hand stock to ${next}`, "success");
      setDraftStock((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not update stock",
        "error",
      );
    }
  };

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

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void fetchProducts(session).finally(() => setIsRefreshing(false));
            }}
          />
        }
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: contentPaddingBottom },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(12) }]}>
            <VendorPageIntro
              title="Stock control"
              subtitle={`On hand, reserved (open orders), and available. Low stock is ${LOW_STOCK_THRESHOLD} units or fewer.`}
              stats={[
                { value: products.length, label: "SKUs" },
                { value: lowCount, label: "Low" },
                { value: outCount, label: "Out" },
              ]}
            />
            <VendorListSearch
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or category"
            />
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {(
                [
                  ["all", "All"],
                  ["low", "Low stock"],
                  ["out", "Out of stock"],
                ] as const
              ).map(([key, label]) => {
                const active = filter === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setFilter(key)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: active ? colors.text : colors.pill,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.textBold,
                        fontSize: rMS(12),
                        color: active ? colors.onPrimary : colors.text,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="layers-outline"
              title={isLoadingProducts ? "Loading inventory" : "No matching products"}
              message="Add products or clear search/filters to manage stock."
              actionLabel="Add product"
              onAction={() => router.push("/vendor/products/new" as any)}
            />
          </View>
        }
        renderItem={({ item }) => {
          const value = draftStock[item.id] ?? String(item.stock);
          const busy = updatingProductId === item.id;
          const reserved = item.reservedStock ?? 0;
          const available =
            item.availableStock ?? Math.max(0, item.stock - reserved);
          const tone = isOutOfStockProduct(item)
            ? colors.dangerText
            : isLowStockProduct(item)
              ? colors.warningText
              : colors.textMuted;
          return (
            <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
              <AccountListCard>
                <View style={{ gap: rV(10) }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.titleBold,
                          fontSize: rMS(14),
                          color: colors.text,
                        }}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: Fonts.text,
                          fontSize: rMS(12),
                          color: tone,
                        }}
                      >
                        {isOutOfStockProduct(item)
                          ? "Out of stock"
                          : isLowStockProduct(item)
                            ? "Low stock"
                            : "In stock"}
                        {" · "}
                        {item.status}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: Fonts.text,
                          fontSize: rMS(12),
                          color: colors.textMuted,
                        }}
                      >
                        On hand {item.stock}
                        {" · "}Reserved {reserved}
                        {" · "}Available {available}
                      </Text>
                      {item.category ? (
                        <Text
                          style={{
                            marginTop: 2,
                            fontFamily: Fonts.text,
                            fontSize: rMS(11.5),
                            color: colors.textMuted,
                          }}
                          numberOfLines={1}
                        >
                          {item.category}
                          {item.subcategory ? ` · ${item.subcategory}` : ""}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/vendor/products/new" as any,
                            params: { productId: item.id },
                          })
                        }
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.textBold,
                            fontSize: rMS(12),
                            color: colors.primary,
                          }}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => void openHistory(item)}>
                        <Text
                          style={{
                            fontFamily: Fonts.textBold,
                            fontSize: rMS(12),
                            color: colors.textMuted,
                          }}
                        >
                          History
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.textBold,
                        fontSize: rMS(12),
                        color: colors.textMuted,
                      }}
                    >
                      On-hand stock
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <TextInput
                        value={value}
                        onChangeText={(text) =>
                          setDraftStock((prev) => ({
                            ...prev,
                            [item.id]: text.replace(/[^0-9]/g, ""),
                          }))
                        }
                        keyboardType="number-pad"
                        editable={!busy}
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: colors.inputBorder,
                          backgroundColor: colors.inputBg,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontFamily: Fonts.textBold,
                          fontSize: rMS(14),
                          color: colors.text,
                        }}
                      />
                      <TouchableOpacity
                        disabled={busy}
                        onPress={() => void saveStock(item)}
                        style={{
                          backgroundColor: colors.text,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          opacity: busy ? 0.6 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.textBold,
                            fontSize: rMS(12),
                            color: colors.onPrimary,
                          }}
                        >
                          Save
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </AccountListCard>
            </View>
          );
        }}
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
                    {formatMovementReason(row.reason)}
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
    </>
  );
}
