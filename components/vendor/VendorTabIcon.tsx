import TabBarIconShell from "@/components/navigation/TabBarIconShell";
import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

type VendorTabIconProps = {
  focused: boolean;
  badgeCount?: number;
};

export default function VendorTabIcon({ focused, badgeCount = 0 }: VendorTabIconProps) {
  const { colors } = useTheme();
  const { iconSize } = useTabBarMetricsContext();

  return (
    <TabBarIconShell focused={focused} title="Store" badgeCount={badgeCount}>
      <Ionicons
        name={focused ? "storefront" : "storefront-outline"}
        size={iconSize}
        color={focused ? colors.onPrimary : colors.iconMuted}
      />
    </TabBarIconShell>
  );
}
