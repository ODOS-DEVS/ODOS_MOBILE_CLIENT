import ScreenLoader from "@/components/loaders/ScreenLoader";
import { AccountBadge } from "@/components/account/AccountUi";
import {
  AccountActionButton,
  AccountEmptyState,
  AccountListCard,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { AppColors } from "@/constants/Colors";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useStoreStore } from "@/stores/storeStore";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function productStatusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "active") return "success";
  if (status === "pending") return "warning";
  return "neutral";
}

export default function VendorProductsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const { error, fetchProducts, isLoadingProducts, products } = useStoreStore();

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    void fetchProducts(session);
  }, [fetchProducts, hasVendorAccess, session]);

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

  const showLoader = isLoadingProducts && products.length === 0;

  if (showLoader) {
    return (
      <VendorScreenShell
        title="My Products"
        rightNode={addButton}
        loading
        loadingLabel="Loading vendor products..."
      />
    );
  }

  const activeCount = products.filter((p) => p.status === "active").length;

  return (
    <VendorScreenShell title="My Products" rightNode={addButton}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title="Store inventory"
              subtitle="Review pricing, stock, and visibility for every product in your catalog."
              stats={[
                { value: products.length, label: "Products" },
                { value: activeCount, label: "Live" },
              ]}
              error={error}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountEmptyState
              icon="cube-outline"
              title="No products yet"
              message="Add your first product to start building the vendor catalog."
              actionLabel="Add Product"
              onAction={() => router.push("/vendor/products/new" as any)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountListCard style={styles.productCard}>
              <View style={styles.cardRow}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text numberOfLines={1} style={styles.productTitle}>
                      {item.name}
                    </Text>
                    <AccountBadge
                      label={
                        item.status === "pending"
                          ? "pending approval"
                          : item.status.replace(/_/g, " ")
                      }
                      tone={productStatusTone(item.status)}
                    />
                  </View>
                  <Text numberOfLines={2} style={styles.description}>
                    {item.description}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{item.category}</Text>
                    <Text style={styles.metaText}>Stock: {item.stock}</Text>
                  </View>
                  {item.placementTags?.includes("flash-sale") ? (
                    <AccountBadge label="Flash Sale" tone="info" />
                  ) : null}
                  <Text style={styles.price}>GHS {item.price.toFixed(2)}</Text>
                </View>
              </View>
              <AccountActionButton
                label="Edit product"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/vendor/products/new" as any,
                    params: { productId: item.id },
                  })
                }
              />
            </AccountListCard>
          </View>
        )}
      />
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    color: AppColors.primary,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  productCard: {
    marginBottom: rV(10),
    gap: rV(12),
  },
  cardRow: {
    flexDirection: "row",
    gap: rS(12),
  },
  image: {
    width: rS(88),
    height: rS(88),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
  },
  cardBody: {
    flex: 1,
    gap: rV(6),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(8),
  },
  productTitle: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  description: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    color: "#6B7280",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  metaText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    color: "#6B7280",
  },
  price: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: AppColors.text,
  },
});
