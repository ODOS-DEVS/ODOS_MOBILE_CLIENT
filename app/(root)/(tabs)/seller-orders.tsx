import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import VendorOrdersList from "@/components/vendor/VendorOrdersList";
import { VendorScreenShell } from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";

export default function SellerOrdersTab() {
  const tabBarInset = useTabBarContentInsetFromContext();
  const mode = useWorkspaceModeStore((state) => state.mode);
  const hydrated = useWorkspaceModeStore((state) => state.hydrated);
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();

  if (!hydrated) {
    return (
      <VendorScreenShell
        title="Orders"
        showBackButton={false}
        showSettings={false}
        loading
        loadingLabel="Loading orders..."
      />
    );
  }

  if (isCheckingVendorAccess && !hasVendorAccess) {
    return (
      <VendorScreenShell
        title="Orders"
        showBackButton={false}
        showSettings={false}
        loading
        loadingLabel="Loading orders..."
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
    <VendorScreenShell title="Orders" showBackButton={false} showSettings={false}>
      <VendorOrdersList
        introTitle="Order inbox"
        introSubtitle="Confirm, prepare, and complete fulfillment from one place."
        contentPaddingBottom={tabBarInset}
        tabParam={tabParam}
      />
    </VendorScreenShell>
  );
}
