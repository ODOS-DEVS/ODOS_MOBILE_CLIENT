import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorListSearch from "@/components/vendor/VendorListSearch";
import VendorProductCard from "@/components/vendor/VendorProductCard";
import VendorProductQueueTabs from "@/components/vendor/VendorProductQueueTabs";
import {
  VendorPageIntro,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import type { VendorProduct, VendorProductCatalogTab } from "@/types/store";
import {
  countVendorProductsByCatalogTab,
  filterVendorProductsByCatalogTab,
} from "@/utils/vendorProductCatalog";
import { rMS, rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ProductSort = "name" | "stock" | "price";

function matchesProductQuery(product: VendorProduct, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [product.id, product.name, product.category, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortProducts(products: VendorProduct[], sort: ProductSort) {
  return [...products].sort((left, right) => {
    if (sort === "stock") {
      return left.stock - right.stock;
    }
    if (sort === "price") {
      return left.price - right.price;
    }
    return left.name.localeCompare(right.name);
  });
}

type VendorProductsListProps = {
  introTitle: string;
  introSubtitle: string;
  contentPaddingBottom: number;
};

export default function VendorProductsList({
  introTitle,
  introSubtitle,
  contentPaddingBottom,
}: VendorProductsListProps) {
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { session } = useRequireVendor();
  const [activeTab, setActiveTab] = useState<VendorProductCatalogTab>("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<ProductSort>("name");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStockDraft, setBulkStockDraft] = useState("");
  const {
    bulkUpdateProducts,
    deleteProduct,
    error,
    fetchProducts,
    isLoadingProducts,
    patchProductStock,
    products,
    setProductStatus,
    updatingProductId,
  } = useStoreStore();

  useFocusEffect(
    useCallback(() => {
      void fetchProducts(session);
      return undefined;
    }, [fetchProducts, session]),
  );

  const counts = useMemo(() => countVendorProductsByCatalogTab(products), [products]);
  const filteredProducts = useMemo(() => {
    const byTab = filterVendorProductsByCatalogTab(products, activeTab).filter((product) =>
      matchesProductQuery(product, searchQuery),
    );
    return sortProducts(byTab, sortMode);
  }, [activeTab, products, searchQuery, sortMode]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts(session);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProducts, session]);

  const cycleSort = () => {
    setSortMode((current) =>
      current === "name" ? "stock" : current === "stock" ? "price" : "name",
    );
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
    setBulkStockDraft("");
  };

  const toggleSelect = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const runBulk = async (input: {
    stock?: number;
    status?: "active" | "hidden";
  }) => {
    if (selectedIds.length === 0) {
      showToast("Select at least one product.", "error");
      return;
    }
    try {
      await bulkUpdateProducts(session, {
        productIds: selectedIds,
        ...input,
      });
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

  return (
    <FlatList
      data={filteredProducts}
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
              { value: counts.live, label: "Live" },
              { value: counts.pending, label: "Pending" },
              { value: counts.hidden, label: "Hidden" },
            ]}
            error={error}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (selectionMode) {
                  exitSelection();
                } else {
                  setSelectionMode(true);
                }
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.textBold,
                  fontSize: rMS(13),
                  color: colors.primary,
                }}
              >
                {selectionMode ? "Cancel select" : "Select"}
              </Text>
            </TouchableOpacity>
            {selectionMode ? (
              <Text
                style={{
                  fontFamily: Fonts.text,
                  fontSize: rMS(12),
                  color: colors.textMuted,
                }}
              >
                {selectedIds.length} selected
              </Text>
            ) : null}
          </View>
          {selectionMode ? (
            <View
              style={{
                gap: rV(10),
                padding: 12,
                borderRadius: 14,
                backgroundColor: colors.pill,
              }}
            >
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <TouchableOpacity
                  onPress={() => void runBulk({ status: "hidden" })}
                  style={{
                    backgroundColor: colors.text,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.textBold,
                      fontSize: rMS(12),
                      color: colors.onPrimary,
                    }}
                  >
                    Hide
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void runBulk({ status: "active" })}
                  style={{
                    backgroundColor: colors.text,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.textBold,
                      fontSize: rMS(12),
                      color: colors.onPrimary,
                    }}
                  >
                    Relist
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput
                  value={bulkStockDraft}
                  onChangeText={(text) => setBulkStockDraft(text.replace(/[^0-9]/g, ""))}
                  placeholder="Set stock"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.inputBg,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontFamily: Fonts.textBold,
                    fontSize: rMS(13),
                    color: colors.text,
                  }}
                />
                <TouchableOpacity
                  onPress={confirmBulkStock}
                  style={{
                    backgroundColor: colors.text,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.textBold,
                      fontSize: rMS(12),
                      color: colors.onPrimary,
                    }}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <VendorListSearch
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products by name or category"
          />
          <VendorProductQueueTabs
            activeTab={activeTab}
            counts={counts}
            onChange={setActiveTab}
            sortLabel={
              sortMode === "name" ? "Name" : sortMode === "stock" ? "Stock" : "Price"
            }
            onSortPress={cycleSort}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <AccountEmptyState
            icon="cube-outline"
            title={
              isLoadingProducts
                ? "Loading products"
                : searchQuery.trim()
                  ? "No matching products"
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
                : activeTab === "all"
                  ? "Add your first product to start building the vendor catalog."
                  : "Switch tabs or add a new listing for your store."
            }
            actionLabel={!searchQuery.trim() ? "Add product" : undefined}
            onAction={
              !searchQuery.trim()
                ? () => router.push("/vendor/products/new" as any)
                : undefined
            }
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <VendorProductCard
            product={item}
            isUpdating={updatingProductId === item.id || updatingProductId === "bulk"}
            selectionMode={selectionMode}
            selected={selectedIds.includes(item.id)}
            onToggleSelect={() => toggleSelect(item.id)}
            onEdit={() =>
              router.push({
                pathname: "/vendor/products/new" as any,
                params: { productId: item.id },
              })
            }
            onDuplicate={() =>
              router.push({
                pathname: "/vendor/products/new" as any,
                params: { duplicateFrom: item.id },
              })
            }
            onHide={async () => {
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
            }}
            onUnhide={async () => {
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
            }}
            onDelete={async () => {
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
            }}
            onAdjustStock={async (nextStock) => {
              if (nextStock === item.stock) return;
              try {
                await patchProductStock(session, item.id, nextStock);
              } catch (stockError) {
                showToast(
                  stockError instanceof Error
                    ? stockError.message
                    : "We couldn't update stock.",
                  "error",
                );
              }
            }}
          />
        </View>
      )}
    />
  );
}
