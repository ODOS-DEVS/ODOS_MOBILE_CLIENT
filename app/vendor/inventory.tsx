import VendorInventoryPanel from "@/components/vendor/VendorInventoryPanel";
import { VendorScreenShell } from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { rV } from "@/styles/responsive";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return (
      <VendorScreenShell title="Inventory" loading loadingLabel="Loading inventory..." />
    );
  }

  return (
    <VendorScreenShell title="Inventory">
      <VendorInventoryPanel contentPaddingBottom={insets.bottom + rV(28)} />
    </VendorScreenShell>
  );
}
