import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import VendorProductsList from "@/components/vendor/VendorProductsList";
import { VendorScreenShell } from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { rMS } from "@/styles/responsive";
import { Redirect, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function SellerProductsTab() {
  const tabBarInset = useTabBarContentInsetFromContext();
  const { colors } = useTheme();
  const mode = useWorkspaceModeStore((state) => state.mode);
  const hydrated = useWorkspaceModeStore((state) => state.hydrated);
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();

  const addButton = (
    <TouchableOpacity
      onPress={() => router.push("/vendor/products/new" as any)}
      activeOpacity={0.82}
    >
      <Text
        style={{
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.primary,
        }}
      >
        Add
      </Text>
    </TouchableOpacity>
  );

  if (!hydrated) {
    return (
      <VendorScreenShell
        title="Products"
        showBackButton={false}
        showSettings={false}
        rightNode={addButton}
        loading
        loadingLabel="Loading products..."
      />
    );
  }

  if (isCheckingVendorAccess && !hasVendorAccess) {
    return (
      <VendorScreenShell
        title="Products"
        showBackButton={false}
        showSettings={false}
        rightNode={addButton}
        loading
        loadingLabel="Loading products..."
      />
    );
  }

  if (mode !== "sell_only") {
    return <Redirect href="/(root)/(tabs)/vendor" />;
  }

  if (!hasVendorAccess) {
    return <Redirect href="/(root)/(tabs)/profile" />;
  }

  return (
    <VendorScreenShell
      title="Products"
      showBackButton={false}
      showSettings={false}
      rightNode={addButton}
    >
      <VendorProductsList
        introTitle="Catalog"
        introSubtitle="Publish, hide, and restock products without leaving Seller Center."
        contentPaddingBottom={tabBarInset}
      />
    </VendorScreenShell>
  );
}
