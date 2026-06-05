import VendorTabHub from "@/components/vendor/VendorTabHub";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { normalizeVendorStatus } from "@/types/vendor";
import { Redirect, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";

export default function VendorTabScreen() {
  const { isApprovedVendor, openDashboard, vendorDashboardStats } =
    useVendorQuickAccess();
  const { session, user } = useVendorSession();
  const { fetchStoreProfile, isLoadingStore, storeProfile } = useStoreStore();
  const {
    fetchVendorDashboard,
    isLoading,
    refreshVendorState,
    vendorProfile,
  } = useVendorStore();

  const vendorStatus = useMemo(() => {
    if (!user) {
      return "approved" as const;
    }

    const authStatus = normalizeVendorStatus(user.vendorStatus, user.roles);
    return authStatus !== "none" ? authStatus : "approved";
  }, [user]);

  const isLoadingStorefront = isLoadingStore || (isLoading && !storeProfile);

  useFocusEffect(
    useCallback(() => {
      if (!isApprovedVendor) {
        return undefined;
      }

      void refreshVendorState(session);
      void fetchStoreProfile(session);
      void fetchVendorDashboard(session);

      return undefined;
    }, [
      fetchStoreProfile,
      fetchVendorDashboard,
      isApprovedVendor,
      refreshVendorState,
      session,
    ]),
  );

  if (!isApprovedVendor) {
    return <Redirect href="/(root)/(tabs)/profile" />;
  }

  return (
    <VendorTabHub
      store={storeProfile}
      businessName={vendorProfile?.businessName || user?.full_name}
      vendorStatus={vendorStatus}
      stats={vendorDashboardStats}
      isLoading={isLoadingStorefront}
      onOpenDashboard={openDashboard}
    />
  );
}
