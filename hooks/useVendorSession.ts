import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export function useVendorSession() {
  const { accessToken, isHydrating, isRefreshingSession, user } = useAuth();

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

  return {
    accessToken,
    isHydrating,
    isRefreshingSession,
    session,
    user,
  };
}
