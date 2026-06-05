import TabBarImageIcon from "@/components/navigation/TabBarImageIcon";
import { TabBarMetricsProvider } from "@/components/navigation/TabBarMetricsContext";
import { useTabBarMetrics } from "@/components/navigation/tabBarMetrics";
import VendorTabIcon from "@/components/vendor/VendorTabIcon";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isApprovedVendor, pendingOrders } = useVendorQuickAccess();
  const tabCount = isApprovedVendor ? 6 : 5;
  const tabMetrics = useTabBarMetrics(tabCount);

  const tabBarStyles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          flex: 1,
          minWidth: 0,
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
      tabBarItemStyle: tabBarStyles.item,
      tabBarStyle: {
        position: "absolute" as const,
        left: tabMetrics.barSideMargin,
        right: tabMetrics.barSideMargin,
        bottom: Math.max(insets.bottom * 0.0, rV(0)),
        height: rV(78) + insets.bottom * 0.18,
        paddingTop: rV(10),
        paddingBottom: Math.max(insets.bottom * 0.05, rV(4)),
        paddingHorizontal: tabMetrics.barInnerPaddingH,
        borderTopWidth: 0,
        borderRadius: rMS(24),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.tabBarBorder,
        backgroundColor: colors.tabBar,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
        elevation: 14,
      },
    }),
    [colors, insets.bottom, tabBarStyles.item, tabMetrics.barInnerPaddingH, tabMetrics.barSideMargin],
  );

  return (
    <TabBarMetricsProvider tabCount={tabCount}>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabBarImageIcon
                source={require("../../../assets/images/home.png")}
                focused={focused}
                title="Home"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="category"
          options={{
            title: "Category",
            tabBarIcon: ({ focused }) => (
              <TabBarImageIcon
                source={require("../../../assets/images/Category.png")}
                focused={focused}
                title="Category"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ focused }) => (
              <TabBarImageIcon
                source={require("../../../assets/images/bag.png")}
                focused={focused}
                title="Cart"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vendor"
          options={{
            href: isApprovedVendor ? undefined : null,
            title: "Store",
            tabBarIcon: ({ focused }) => (
              <VendorTabIcon focused={focused} pendingOrders={pendingOrders} />
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            tabBarIcon: ({ focused }) => (
              <TabBarImageIcon
                source={require("../../../assets/images/Heart.png")}
                focused={focused}
                title="Wishlist"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabBarImageIcon
                source={require("../../../assets/images/Profile.png")}
                focused={focused}
                title="Profile"
              />
            ),
          }}
        />
      </Tabs>
    </TabBarMetricsProvider>
  );
};

export default TabsLayout;
