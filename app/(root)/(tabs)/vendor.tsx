import VendorTabHub from "@/components/vendor/VendorTabHub";
import { useChat } from "@/context/ChatContext";
import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import { normalizeVendorStatus, type VendorDashboardStats } from "@/types/vendor";
import { buildVendorDashboardStatsFallback } from "@/utils/vendorAnalytics";
import { Redirect, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";

export default function VendorTabScreen() {
  const { isApprovedVendor, openDashboard, openSettings, vendorDashboardStats } =
    useVendorQuickAccess();
  const { session, user } = useVendorSession();
  const { fetchStoreProfile, fetchOrders, isLoadingStore, orders, storeProfile } = useStoreStore();
  const {
    fetchVendorDashboard,
    isLoading,
    refreshVendorState,
    vendorProfile,
  } = useVendorStore();
  const { loadVendorThreads, vendorThreads } = useChat();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { insights, refreshAnalytics } = useVendorAnalytics(
    session,
    isApprovedVendor,
  );

  const unreadChats = useMemo(
    () => vendorThreads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    [vendorThreads],
  );

  const vendorStatus = useMemo(() => {
    if (!user) {
      return "approved" as const;
    }

    const authStatus = normalizeVendorStatus(user.vendorStatus, user.roles);
    return authStatus !== "none" ? authStatus : "approved";
  }, [user]);

  const resolvedDashboardStats = useMemo<VendorDashboardStats | null>(() => {
    if (vendorDashboardStats) {
      return vendorDashboardStats;
    }

    if (orders.length === 0 && !storeProfile?.name && !vendorProfile?.storeName) {
      return null;
    }

    return buildVendorDashboardStatsFallback(
      orders,
      storeProfile?.name || vendorProfile?.storeName,
    );
  }, [orders, storeProfile?.name, vendorDashboardStats, vendorProfile?.storeName]);

  const isLoadingStorefront =
    isLoadingStore || (isLoading && !storeProfile && !resolvedDashboardStats);

  const handleRefresh = useCallback(async () => {
    if (!isApprovedVendor) {
      return;
    }

    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshVendorState(session, { force: true }),
        fetchStoreProfile(session),
        fetchVendorDashboard(session),
        loadVendorThreads({ silent: true }),
        refreshAnalytics(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    fetchStoreProfile,
    fetchVendorDashboard,
    isApprovedVendor,
    loadVendorThreads,
    refreshAnalytics,
    refreshVendorState,
    session,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!isApprovedVendor) {
        return undefined;
      }

      void refreshVendorState(session);
      void fetchStoreProfile(session);
      void fetchVendorDashboard(session);
      void fetchOrders(session);
      void loadVendorThreads({ silent: true });

      return undefined;
    }, [
      fetchOrders,
      fetchStoreProfile,
      fetchVendorDashboard,
      isApprovedVendor,
      loadVendorThreads,
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
      stats={resolvedDashboardStats}
      insights={insights}
      unreadChats={unreadChats}
      isLoading={isLoadingStorefront}
      isRefreshing={isRefreshing}
      onRefresh={() => void handleRefresh()}
      onOpenDashboard={openDashboard}
      onOpenSettings={openSettings}
    />
  );
}
