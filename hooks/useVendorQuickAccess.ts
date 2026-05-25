import { useAuth } from "@/context/AuthContext";
import { useVendorStore } from "@/stores/vendorStore";
import { canAccessVendorDashboard, normalizeVendorStatus } from "@/types/vendor";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";

export function useVendorQuickAccess() {
  const { user } = useAuth();
  const { vendorApplication, vendorDashboardStats } = useVendorStore();

  const vendorStatus = useMemo(() => {
    if (!user) {
      return "none" as const;
    }

    const authStatus = normalizeVendorStatus(user.vendorStatus, user.roles);
    return authStatus !== "none" ? authStatus : "none";
  }, [user]);

  const isApprovedVendor = useMemo(
    () => Boolean(user && canAccessVendorDashboard(user.roles, vendorStatus)),
    [user, vendorStatus],
  );

  const storeLabel =
    vendorDashboardStats?.storeName?.trim() ||
    vendorApplication?.storeName?.trim() ||
    "Your store";

  const openDashboard = useCallback(() => {
    router.push("/vendor/dashboard" as any);
  }, []);

  const openSettings = useCallback(() => {
    router.push("/vendor/settings" as any);
  }, []);

  return {
    vendorStatus,
    isApprovedVendor,
    storeLabel,
    openDashboard,
    openSettings,
  };
}
