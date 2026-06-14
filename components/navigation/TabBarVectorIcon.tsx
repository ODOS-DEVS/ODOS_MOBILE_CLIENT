import TabBarIconShell from "@/components/navigation/TabBarIconShell";
import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export type TabBarVectorIconName =
  | "home"
  | "category"
  | "cart"
  | "wishlist"
  | "profile";

const ICON_MAP: Record<
  TabBarVectorIconName,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  home: { active: "home", inactive: "home-outline" },
  category: { active: "grid", inactive: "grid-outline" },
  cart: { active: "bag-handle", inactive: "bag-handle-outline" },
  wishlist: { active: "heart", inactive: "heart-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
};

const TITLE_MAP: Record<TabBarVectorIconName, string> = {
  home: "Home",
  category: "Category",
  cart: "Cart",
  wishlist: "Wishlist",
  profile: "Profile",
};

const COMPACT_TITLE_MAP: Partial<Record<TabBarVectorIconName, string>> = {
  category: "Browse",
  wishlist: "Saved",
};

type TabBarVectorIconProps = {
  name: TabBarVectorIconName;
  focused: boolean;
};

export default function TabBarVectorIcon({ name, focused }: TabBarVectorIconProps) {
  const { colors } = useTheme();
  const { iconSize, isCompact } = useTabBarMetricsContext();
  const icons = ICON_MAP[name];
  const title =
    isCompact && COMPACT_TITLE_MAP[name] ? COMPACT_TITLE_MAP[name]! : TITLE_MAP[name];

  return (
    <TabBarIconShell focused={focused} title={title}>
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={iconSize}
        color={focused ? colors.onPrimary : colors.iconMuted}
      />
    </TabBarIconShell>
  );
}
