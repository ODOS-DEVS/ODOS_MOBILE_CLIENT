import TabBarBackground from "@/components/navigation/TabBarBackground";
import TabBarButton from "@/components/navigation/TabBarButton";
import TabBarVectorIcon from "@/components/navigation/TabBarVectorIcon";
import AssistantFab from "@/components/assistant/AssistantFab";
import { TabBarMetricsProvider } from "@/components/navigation/TabBarMetricsContext";
import { useTabBarMetrics } from "@/components/navigation/tabBarMetrics";
import VendorTabIcon from "@/components/vendor/VendorTabIcon";
import CartTabIcon from "@/components/navigation/CartTabIcon";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isApprovedVendor, storeTabBadgeCount } = useVendorQuickAccess();
  const tabCount = isApprovedVendor ? 6 : 5;
  const tabMetrics = useTabBarMetrics(tabCount, insets.bottom);

  const tabBarStyles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          flex: 1,
          minWidth: 0,
          alignSelf: "stretch",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 0,
          paddingHorizontal: 0,
        },
      }),
    [],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      tabBarShowLabel: false as const,
      tabBarHideOnKeyboard: true as const,
      tabBarAllowFontScaling: false as const,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.iconMuted,
      tabBarItemStyle: tabBarStyles.item,
      tabBarButton: (props: BottomTabBarButtonProps) => <TabBarButton {...props} />,
      tabBarBackground: () => <TabBarBackground />,
      tabBarStyle: {
        position: "absolute" as const,
        left: 0,
        right: 0,
        bottom: tabMetrics.barBottomOffset,
        height: tabMetrics.barTotalHeight,
        paddingTop: 0,
        paddingBottom: tabMetrics.barPaddingBottom,
        paddingHorizontal: tabMetrics.barInnerPaddingH,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.bottomBarBorder,
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: isDark ? colors.card : colors.bottomBar,
        shadowColor: colors.shadow,
        shadowOpacity: isDark ? 0.18 : 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -4 },
        elevation: Platform.OS === "android" ? 12 : 0,
        overflow: "hidden" as const,
        alignItems: "center" as const,
      },
    }),
    [
      colors.bottomBar,
      colors.card,
      colors.iconMuted,
      colors.primary,
      colors.bottomBarBorder,
      colors.shadow,
      tabBarStyles.item,
      tabMetrics.barBottomOffset,
      tabMetrics.barPaddingBottom,
      tabMetrics.barTotalHeight,
      tabMetrics.barInnerPaddingH,
      isDark,
    ],
  );

  return (
    <TabBarMetricsProvider tabCount={tabCount} bottomInset={insets.bottom}>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="category"
          options={{
            title: "Category",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="category" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="vendor"
          options={{
            href: isApprovedVendor ? undefined : null,
            title: "Store",
            tabBarIcon: ({ focused }) => (
              <VendorTabIcon focused={focused} badgeCount={storeTabBadgeCount} />
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="wishlist" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="profile" focused={focused} />,
          }}
        />
      </Tabs>
      <AssistantFab />
    </TabBarMetricsProvider>
  );
};

export default TabsLayout;
