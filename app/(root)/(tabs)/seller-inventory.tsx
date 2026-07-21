import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import VendorInventoryPanel from "@/components/vendor/VendorInventoryPanel";
import { VendorScreenShell } from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { Redirect } from "expo-router";
import React from "react";

export default function SellerInventoryTab() {
  const tabBarInset = useTabBarContentInsetFromContext();
  const mode = useWorkspaceModeStore((state) => state.mode);
  const hydrated = useWorkspaceModeStore((state) => state.hydrated);
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();

  if (!hydrated) {
    return (
      <VendorScreenShell
        title="Stock"
        showBackButton={false}
        showSettings={false}
        loading
        loadingLabel="Loading stock..."
      />
    );
  }

  if (isCheckingVendorAccess && !hasVendorAccess) {
    return (
      <VendorScreenShell
        title="Stock"
        showBackButton={false}
        showSettings={false}
        loading
        loadingLabel="Loading stock..."
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
    <VendorScreenShell title="Stock" showBackButton={false} showSettings={false}>
      <VendorInventoryPanel contentPaddingBottom={tabBarInset} />
    </VendorScreenShell>
  );
}
