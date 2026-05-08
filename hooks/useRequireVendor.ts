import { useAuth } from "@/context/AuthContext";
import { useVendorStore } from "@/stores/vendorStore";
import { canAccessVendorDashboard } from "@/types/vendor";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

export function useRequireVendor() {
  const {
    accessToken,
    isHydrating,
    isRefreshingSession,
    refreshCurrentUser,
    user,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const {
    error,
    isLoading,
    lastLoadedUserId,
    refreshVendorState,
    vendorApplication,
    vendorProfile,
    vendorStatus,
  } = useVendorStore();
  const [hasSyncedAuthUser, setHasSyncedAuthUser] = useState(false);

  const session = useMemo(
    () => ({
      accessToken,
      userId: user?.id ?? null,
      fullName: user?.full_name ?? null,
      email: user?.email ?? null,
      phoneNumber: user?.phone_number ?? null,
      roles: user?.roles,
      vendorId: user?.vendorId ?? null,
      vendorStatus: user?.vendorStatus,
      vendorRejectionReason: user?.vendorRejectionReason ?? null,
    }),
    [accessToken, user],
  );

  useEffect(() => {
    setHasSyncedAuthUser(false);
  }, [user?.id]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!user?.id) {
      setHasSyncedAuthUser(true);
      return;
    }

    let isCancelled = false;

    const syncCurrentUser = async () => {
      await refreshCurrentUser();
      if (!isCancelled) {
        setHasSyncedAuthUser(true);
      }
    };

    void syncCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, [isHydrating, refreshCurrentUser, user?.id]);

  useEffect(() => {
    if (isHydrating || !hasSyncedAuthUser || !user?.id) {
      return;
    }

    if (
      lastLoadedUserId === user.id &&
      (vendorProfile || vendorApplication) &&
      vendorStatus === user.vendorStatus
    ) {
      return;
    }

    void refreshVendorState(session);
  }, [
    hasSyncedAuthUser,
    isHydrating,
    lastLoadedUserId,
    refreshVendorState,
    session,
    user?.id,
    user?.vendorStatus,
    vendorApplication,
    vendorProfile,
    vendorStatus,
  ]);

  useEffect(() => {
    if (isHydrating || !hasSyncedAuthUser || isRefreshingSession) {
      return;
    }

    if (!user) {
      if (pathname !== "/(root)/(auth)/signin") {
        router.replace("/(root)/(auth)/signin");
      }
      return;
    }

    if (isLoading) {
      return;
    }

    if (canAccessVendorDashboard(user.roles, user.vendorStatus)) {
      return;
    }

    if (
      user.vendorStatus === "suspended" ||
      user.vendorStatus === "pending" ||
      user.vendorStatus === "under_review" ||
      user.vendorStatus === "rejected"
    ) {
      if (pathname !== "/vendor/application-status") {
        router.replace("/vendor/application-status" as any);
      }
      return;
    }

    if (pathname !== "/vendor/apply") {
      router.replace("/vendor/apply" as any);
    }
  }, [
    hasSyncedAuthUser,
    isHydrating,
    isLoading,
    isRefreshingSession,
    pathname,
    router,
    user,
  ]);

  return {
    error,
    isCheckingVendorAccess:
      isHydrating || isRefreshingSession || !hasSyncedAuthUser || isLoading,
    session,
    user,
    vendorApplication,
    vendorProfile,
    vendorStatus,
    hasVendorAccess: Boolean(
      user && canAccessVendorDashboard(user.roles, user.vendorStatus),
    ),
  };
}
