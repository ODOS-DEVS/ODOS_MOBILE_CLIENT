import { useAuth } from "@/context/AuthContext";
import { useVendorStore } from "@/stores/vendorStore";
import { canAccessVendorDashboard } from "@/types/vendor";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";

/** One auth sync per user id per app session — avoids remount blinks. */
let syncedAuthUserId: string | null = null;

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
  const hasSyncedAuthUser = Boolean(user?.id && syncedAuthUserId === user.id);
  const syncStartedRef = useRef(false);

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

  const hasCachedVendorAccess = Boolean(
    user && canAccessVendorDashboard(user.roles, user.vendorStatus),
  );

  useEffect(() => {
    if (user?.id && syncedAuthUserId && syncedAuthUserId !== user.id) {
      syncedAuthUserId = null;
      syncStartedRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!user?.id) {
      syncedAuthUserId = null;
      syncStartedRef.current = false;
      return;
    }

    if (syncedAuthUserId === user.id || syncStartedRef.current) {
      return;
    }

    syncStartedRef.current = true;
    let isCancelled = false;

    const syncCurrentUser = async () => {
      await refreshCurrentUser();
      if (!isCancelled) {
        syncedAuthUserId = user.id;
      }
    };

    void syncCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, [isHydrating, refreshCurrentUser, user?.id]);

  useEffect(() => {
    if (isHydrating || !user?.id) {
      return;
    }

    // Approved vendors with a cached session can load vendor state without waiting
    // for the one-time auth refresh to finish.
    if (!hasSyncedAuthUser && !hasCachedVendorAccess) {
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
    hasCachedVendorAccess,
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
    if (isHydrating || isRefreshingSession) {
      return;
    }

    if (!hasSyncedAuthUser && !hasCachedVendorAccess) {
      return;
    }

    if (!user) {
      if (pathname !== "/(root)/(auth)/signin") {
        router.replace("/(root)/(auth)/signin");
      }
      return;
    }

    // Don't block navigation redirects on background vendorStore refreshes when
    // auth already proves dashboard access.
    if (isLoading && !hasCachedVendorAccess) {
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
    hasCachedVendorAccess,
    hasSyncedAuthUser,
    isHydrating,
    isLoading,
    isRefreshingSession,
    pathname,
    router,
    user,
  ]);

  const isCheckingVendorAccess =
    isHydrating ||
    (!hasCachedVendorAccess &&
      (isRefreshingSession || !hasSyncedAuthUser || isLoading));

  return {
    error,
    isCheckingVendorAccess,
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
