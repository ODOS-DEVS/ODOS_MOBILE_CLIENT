import TabBarIconShell from "@/components/navigation/TabBarIconShell";
import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { AppColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

type VendorTabIconProps = {
  focused: boolean;
  pendingOrders?: number;
};

export default function VendorTabIcon({ focused, pendingOrders = 0 }: VendorTabIconProps) {
  const { colors } = useTheme();
  const { iconSize } = useTabBarMetricsContext();

  return (
    <TabBarIconShell focused={focused} title="Store" badgeCount={pendingOrders}>
      <Ionicons
        name={focused ? "storefront" : "storefront-outline"}
        size={iconSize}
        color={focused ? colors.text : AppColors.subtext[100]}
      />
    </TabBarIconShell>
  );
}
