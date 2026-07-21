import { fetchVendorAnalytics } from "@/services/vendorService";
import { useStoreStore } from "@/stores/storeStore";
import { useVendorStore } from "@/stores/vendorStore";
import type { VendorAnalytics, VendorAnalyticsPeriod } from "@/types/vendor";
import {
  buildVendorAnalyticsFromOrders,
  buildVendorAnalyticsInsights,
  mergeVendorAnalytics,
} from "@/utils/vendorAnalytics";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { VendorSessionContext } from "@/types/vendor";

export function useVendorAnalytics(
  session: VendorSessionContext,
  enabled: boolean,
) {
  const orders = useStoreStore((state) => state.orders);
  const vendorDashboardStats = useVendorStore((state) => state.vendorDashboardStats);
  const fetchOrders = useStoreStore((state) => state.fetchOrders);
  const [period, setPeriod] = useState<VendorAnalyticsPeriod>("30d");
  const [remoteAnalytics, setRemoteAnalytics] = useState<VendorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const localAnalytics = useMemo(
    () => buildVendorAnalyticsFromOrders(orders, vendorDashboardStats),
    [orders, vendorDashboardStats],
  );

  const analytics = useMemo(
    () => mergeVendorAnalytics(remoteAnalytics, localAnalytics),
    [localAnalytics, remoteAnalytics],
  );

  const insights = useMemo(
    () =>
      buildVendorAnalyticsInsights(
        orders,
        vendorDashboardStats,
        analytics,
        usedFallback,
      ),
    [analytics, orders, usedFallback, vendorDashboardStats],
  );

  const refreshAnalytics = useCallback(
    async (nextPeriod: VendorAnalyticsPeriod = period) => {
      if (!enabled || !session.accessToken) {
        return;
      }

      setIsLoading(true);
      try {
        const next = await fetchVendorAnalytics(session, nextPeriod);
        setRemoteAnalytics(next);
        setUsedFallback(false);
      } catch {
        setRemoteAnalytics(null);
        setUsedFallback(true);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, period, session],
  );

  const updatePeriod = useCallback(
    (nextPeriod: VendorAnalyticsPeriod) => {
      setPeriod(nextPeriod);
      void refreshAnalytics(nextPeriod);
    },
    [refreshAnalytics],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchOrders(session);
    void refreshAnalytics(period);
    // Intentionally refresh on enable/session only; period changes go through updatePeriod.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetchOrders, session]);

  return {
    analytics,
    insights,
    isLoading,
    usedFallback,
    period,
    setPeriod: updatePeriod,
    refreshAnalytics: () => refreshAnalytics(period),
  };
}
