import VendorProductsList from "@/components/vendor/VendorProductsList";
import { VendorScreenShell } from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { AppColors } from "@/constants/Colors";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { rMS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorProductsScreen() {
  const insets = useSafeAreaInsets();
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();

  const addButton = (
    <TouchableOpacity
      onPress={() => router.push("/vendor/products/new" as any)}
      activeOpacity={0.82}
    >
      <Text
        style={{
          color: AppColors.primary,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
        }}
      >
        Add
      </Text>
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
    return (
      <VendorScreenShell
        title="My Products"
        rightNode={addButton}
        loading
        loadingLabel="Checking seller access..."
      />
    );
  }

  return (
    <VendorScreenShell title="My Products" rightNode={addButton}>
      <VendorProductsList
        introTitle="Catalog control"
        introSubtitle="Hide, relist, adjust stock, or remove products without opening the full editor."
        contentPaddingBottom={insets.bottom + rV(28)}
      />
    </VendorScreenShell>
  );
}
