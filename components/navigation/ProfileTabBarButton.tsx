import TabBarButton from "@/components/navigation/TabBarButton";
import { useToast } from "@/context/ToastContext";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { toggleWorkspaceMode } from "@/utils/workspaceNavigation";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";

const DOUBLE_TAP_MS = 280;

export default function ProfileTabBarButton(props: BottomTabBarButtonProps) {
  const { onPress, accessibilityState, ...rest } = props;
  const { isApprovedVendor, storeLabel } = useVendorQuickAccess();
  const { showToast } = useToast();
  const lastTapAtRef = useRef(0);

  const handlePress: NonNullable<BottomTabBarButtonProps["onPress"]> = (event) => {
    if (!isApprovedVendor) {
      onPress?.(event);
      return;
    }

    const now = Date.now();
    const isDoubleTap = now - lastTapAtRef.current < DOUBLE_TAP_MS;
    lastTapAtRef.current = now;

    if (isDoubleTap) {
      void (async () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const next = await toggleWorkspaceMode();
        if (next === "sell_only") {
          showToast(`Switched to ${storeLabel}`, "success");
        } else {
          showToast("Switched to shopping", "success");
        }
      })();
      return;
    }

    if (!accessibilityState?.selected) {
      onPress?.(event);
    }
  };

  return (
    <TabBarButton
      {...rest}
      accessibilityState={accessibilityState}
      onPress={handlePress}
    />
  );
}
