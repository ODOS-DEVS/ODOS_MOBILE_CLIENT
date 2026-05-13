import ProfileHeader from "@/components/profile/ProfileHeader";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import { VendorEmptyState } from "@/components/vendor/VendorEmptyState";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
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

  if (isCheckingVendorAccess || isLoadingProducts) {
    return (
      <View style={styles.screen}>
        <ProfileHeader title="My Products" />
        <ScreenLoader label="Loading vendor products..." />
      </View>
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <ProfileHeader
        title="My Products"
        rightNode={
          <TouchableOpacity
            onPress={() => router.push("/vendor/products/new" as any)}
            activeOpacity={0.82}
          >
            <Text style={styles.headerAction}>Add</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <Text style={styles.pageTitle}>Store inventory</Text>
            <Text style={styles.pageBody}>
              Review your current vendor products, pricing, and stock snapshot.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorEmptyState
              icon="cube-outline"
              title="No products yet"
              message="Add your first product to start building the vendor catalog."
              actionLabel="Add Product"
              onAction={() => router.push("/vendor/products/new" as any)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} resizeMode="cover" />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text numberOfLines={1} style={styles.productTitle}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === "active" && styles.statusPillActive,
                      item.status === "pending" && styles.statusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillLabel,
                        item.status === "active" && styles.statusPillLabelActive,
                        item.status === "pending" && styles.statusPillLabelPending,
                      ]}
                    >
                      {item.status === "pending" ? "pending approval" : item.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
                <Text numberOfLines={2} style={styles.description}>
                  {item.description}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.category}</Text>
                  <Text style={styles.metaText}>Stock: {item.stock}</Text>
                </View>
                {item.placementTags?.includes("flash-sale") ? (
                  <View style={styles.flashSalePill}>
                    <Text style={styles.flashSalePillLabel}>Flash Sale</Text>
                  </View>
                ) : null}
                <Text style={styles.price}>GHS {item.price.toFixed(2)}</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/vendor/products/new" as any,
                      params: { productId: item.id },
                    })
                  }
                  activeOpacity={0.82}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonLabel}>Edit product</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerAction: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  listContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  pageTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
  },
  pageBody: {
    marginTop: rV(8),
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  errorText: {
    marginBottom: rV(10),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  card: {
    flexDirection: "row",
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    padding: rS(12),
    marginBottom: rV(12),
    gap: rS(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  image: {
    width: rS(88),
    height: rS(88),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(8),
  },
  productTitle: {
    flex: 1,
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
  statusPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(999),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  statusPillActive: {
    backgroundColor: "#DCFCE7",
  },
  statusPillPending: {
    backgroundColor: "#FEF3C7",
  },
  statusPillLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    textTransform: "capitalize",
  },
  statusPillLabelActive: {
    color: "#166534",
  },
  statusPillLabelPending: {
    color: "#92400E",
  },
  description: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: rV(10),
  },
  metaText: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  flashSalePill: {
    marginTop: rV(10),
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    backgroundColor: "#FFF7ED",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  flashSalePillLabel: {
    color: "#C2410C",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
  },
  price: {
    marginTop: rV(10),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
  },
  editButton: {
    marginTop: rV(12),
    alignSelf: "flex-start",
    borderRadius: rMS(999),
    backgroundColor: "#EEF4FF",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  editButtonLabel: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
});
