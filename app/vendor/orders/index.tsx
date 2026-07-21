import VendorOrdersList from "@/components/vendor/VendorOrdersList";
import { VendorScreenShell } from "@/components/vendor/VendorUi";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { rV } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function VendorOrdersScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const tabParam = getParam(params.tab);
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell title="Orders" loading loadingLabel="Loading orders..." />
    );
  }

  if (!hasVendorAccess) {
    return (
      <VendorScreenShell title="Orders" loading loadingLabel="Checking seller access..." />
    );
  }

  return (
    <VendorScreenShell title="Orders">
      <VendorOrdersList
        introTitle="Order command center"
        introSubtitle="New orders first, with wait times and full customer details one tap away."
        contentPaddingBottom={insets.bottom + rV(28)}
        tabParam={tabParam}
      />
    </VendorScreenShell>
  );
}
