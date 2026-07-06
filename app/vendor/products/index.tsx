import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AccountEmptyState } from "@/components/account/AccountUi";
import VendorProductCard from "@/components/vendor/VendorProductCard";
import VendorProductQueueTabs from "@/components/vendor/VendorProductQueueTabs";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import type { VendorProductCatalogTab } from "@/types/store";
import {
  countVendorProductsByCatalogTab,
  filterVendorProductsByCatalogTab,
} from "@/utils/vendorProductCatalog";
import { rV, useResponsive } from "@/styles/responsive";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fonts from "@/constants/Fonts";
import { AppColors } from "@/constants/Colors";
import { rMS } from "@/styles/responsive";

export default function VendorProductsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [activeTab, setActiveTab] = useState<VendorProductCatalogTab>("live");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
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
      if (!hasVendorAccess) {
        return undefined;
      }
      void fetchProducts(session);
      return undefined;
    }, [fetchProducts, hasVendorAccess, session]),
  );

  const counts = useMemo(() => countVendorProductsByCatalogTab(products), [products]);
  const filteredProducts = useMemo(
    () => filterVendorProductsByCatalogTab(products, activeTab),
    [activeTab, products],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts(session);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProducts, session]);

  const addButton = (
    <TouchableOpacity
      onPress={() => router.push("/vendor/products/new" as any)}
      activeOpacity={0.82}
    >
      <Text style={styles.headerAction}>Add</Text>
    </TouchableOpacity>
  );

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell
        title="My Products"
        rightNode={addButton}
        loading
        loadingLabel="Loading vendor products..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  if (isLoadingProducts && products.length === 0) {
    return (
      <VendorScreenShell
        title="My Products"
        rightNode={addButton}
        loading
        loadingLabel="Loading vendor products..."
      />
    );
  }

  return (
    <VendorScreenShell title="My Products" rightNode={addButton}>
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
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth, gap: rV(14) }]}>
            <VendorPageIntro
              title="Catalog control"
              subtitle="Hide, relist, adjust stock, or remove products without opening the full editor."
              stats={[
                { value: counts.live, label: "Live" },
                { value: counts.pending, label: "Pending" },
                { value: counts.hidden, label: "Hidden" },
              ]}
              error={error}
            />
            <VendorProductQueueTabs
              activeTab={activeTab}
              counts={counts}
              onChange={setActiveTab}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="cube-outline"
              title={
                activeTab === "live"
                  ? "No live products"
                  : activeTab === "pending"
                    ? "Nothing awaiting approval"
                    : activeTab === "hidden"
                      ? "No hidden products"
                      : "No products yet"
              }
              message={
                activeTab === "all"
                  ? "Add your first product to start building the vendor catalog."
                  : "Switch tabs or add a new listing for your store."
              }
              actionLabel={activeTab === "all" ? "Add Product" : undefined}
              onAction={
                activeTab === "all"
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
              isUpdating={updatingProductId === item.id}
              onEdit={() =>
                router.push({
                  pathname: "/vendor/products/new" as any,
                  params: { productId: item.id },
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
                  );
                }
              }}
              onDelete={async () => {
                try {
                  await deleteProduct(session, item.id);
                  showToast("Product removed.");
                } catch (deleteError) {
                  showToast(
                    deleteError instanceof Error
                      ? deleteError.message
                      : "We couldn't delete that product.",
                  );
                }
              }}
              onAdjustStock={async (nextStock) => {
                if (nextStock === item.stock) {
                  return;
                }
                try {
                  await patchProductStock(session, item.id, nextStock);
                } catch (stockError) {
                  showToast(
                    stockError instanceof Error
                      ? stockError.message
                      : "We couldn't update stock.",
                  );
                }
              }}
            />
          </View>
        )}
      />
    </VendorScreenShell>
  );
}

const styles = {
  headerAction: {
    color: AppColors.primary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
};
