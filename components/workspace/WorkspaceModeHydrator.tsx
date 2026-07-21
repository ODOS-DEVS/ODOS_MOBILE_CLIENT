import { useAuth } from "@/context/AuthContext";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { canAccessVendorDashboard, normalizeVendorStatus } from "@/types/vendor";
import { useEffect, useMemo } from "react";

/** Hydrates persisted workspace mode and resets sell-only when the user can't use it. */
export default function WorkspaceModeHydrator() {
  const { user } = useAuth();
  const hydrate = useWorkspaceModeStore((state) => state.hydrate);
  const mode = useWorkspaceModeStore((state) => state.mode);
  const setMode = useWorkspaceModeStore((state) => state.setMode);

  const isApprovedVendor = useMemo(() => {
    if (!user) return false;
    const status = normalizeVendorStatus(user.vendorStatus, user.roles);
    return canAccessVendorDashboard(user.roles, status);
  }, [user]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user || !isApprovedVendor) {
      if (mode === "sell_only") {
        void setMode("shop_and_sell");
      }
    }
  }, [isApprovedVendor, mode, setMode, user]);

  return null;
}
