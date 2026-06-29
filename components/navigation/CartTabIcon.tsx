import TabBarIconShell from "@/components/navigation/TabBarIconShell";
import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

type CartTabIconProps = {
  focused: boolean;
};

export default function CartTabIcon({ focused }: CartTabIconProps) {
  const { colors } = useTheme();
  const { iconSize } = useTabBarMetricsContext();
  const { cartItemCount } = useCart();

  return (
    <TabBarIconShell focused={focused} title="Cart" badgeCount={cartItemCount}>
      <Ionicons
        name={focused ? "bag-handle" : "bag-handle-outline"}
        size={iconSize}
        color={focused ? colors.onPrimary : colors.iconMuted}
      />
    </TabBarIconShell>
  );
}
