import {
  fetchVendorPromoOverview,
  type VendorPromoOverview,
} from "@/services/vendorService";
import type { VendorAnalyticsPeriod, VendorSessionContext } from "@/types/vendor";
import { useCallback, useEffect, useState } from "react";

const PERIOD_DAYS: Record<VendorAnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/**
 * How this store's campaigns and vouchers are performing.
 *
 * Deliberately separate from useVendorAnalytics: that hook merges server data
 * with an orders-derived local fallback, which only works because orders are
 * already cached on the device. Promo impressions and clicks exist solely on
 * the server, so there is nothing to fall back to — an empty result here means
 * "nobody has seen these promotions yet", which is a real answer worth showing
 * rather than hiding behind a spinner.
 */
export function useVendorPromoPerformance(
  session: VendorSessionContext,
  enabled: boolean,
  period: VendorAnalyticsPeriod = "30d",
) {
  const [overview, setOverview] = useState<VendorPromoOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The server predates this feature — distinct from a real failure.
  const [isUnavailable, setIsUnavailable] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    // Reset alongside the error: a stale `true` here would hide the panel and
    // take a genuine failure down with it.
    setIsUnavailable(false);
    try {
      const result = await fetchVendorPromoOverview(session, PERIOD_DAYS[period]);
      setIsUnavailable(result === null);
      setOverview(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load promo performance.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled, period, session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { overview, isLoading, error, isUnavailable, refresh };
}
