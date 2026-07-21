import TabBarBackground from "@/components/navigation/TabBarBackground";
import TabBarButton from "@/components/navigation/TabBarButton";
import ProfileTabBarButton from "@/components/navigation/ProfileTabBarButton";
import ProfileTabIcon from "@/components/navigation/ProfileTabIcon";
import TabBarVectorIcon from "@/components/navigation/TabBarVectorIcon";
import AssistantFab from "@/components/assistant/AssistantFab";
import { TabBarMetricsProvider } from "@/components/navigation/TabBarMetricsContext";
import { useTabBarMetrics } from "@/components/navigation/tabBarMetrics";
import VendorTabIcon from "@/components/vendor/VendorTabIcon";
import CartTabIcon from "@/components/navigation/CartTabIcon";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import Fonts from "@/constants/Fonts";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { rMS } from "@/styles/responsive";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isApprovedVendor, storeTabBadgeCount } = useVendorQuickAccess();
  const workspaceMode = useWorkspaceModeStore((state) => state.mode);
  const workspaceHydrated = useWorkspaceModeStore((state) => state.hydrated);
  const sellOnly =
    workspaceHydrated && isApprovedVendor && workspaceMode === "sell_only";
  // Seller Center: Home · Orders · Products · Stock · Business
  // Shopping: Home · Category · Cart · Store(optional) · Wishlist · Profile
  const tabCount = sellOnly ? 5 : isApprovedVendor ? 6 : 5;
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
        label: {
          fontFamily: Fonts.textBold,
          fontSize: tabMetrics.labelFontSize,
          lineHeight: tabMetrics.labelLineHeight,
          marginTop: 0,
        },
      }),
    [tabMetrics.labelFontSize, tabMetrics.labelLineHeight],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      freezeOnBlur: false as const,
      lazy: true as const,
      tabBarShowLabel: sellOnly,
      tabBarHideOnKeyboard: true as const,
      tabBarAllowFontScaling: false as const,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.iconMuted,
      tabBarItemStyle: tabBarStyles.item,
      tabBarLabelStyle: tabBarStyles.label,
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
      sellOnly,
      tabBarStyles.item,
      tabBarStyles.label,
      tabMetrics.barBottomOffset,
      tabMetrics.barPaddingBottom,
      tabMetrics.barTotalHeight,
      tabMetrics.barInnerPaddingH,
      isDark,
    ],
  );

  return (
    <TabBarMetricsProvider tabCount={tabCount} bottomInset={insets.bottom}>
      <Tabs detachInactiveScreens={false} screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            href: sellOnly ? null : undefined,
            title: "Home",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="category"
          options={{
            href: sellOnly ? null : undefined,
            title: "Category",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="category" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: sellOnly ? null : undefined,
            title: "Cart",
            tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="vendor"
          options={{
            href: isApprovedVendor ? undefined : null,
            title: sellOnly ? "Home" : "Store",
            tabBarIcon: ({ focused }) =>
              sellOnly ? (
                <Ionicons
                  name={focused ? "grid" : "grid-outline"}
                  size={rMS(22)}
                  color={focused ? colors.primary : colors.iconMuted}
                />
              ) : (
                <VendorTabIcon focused={focused} badgeCount={storeTabBadgeCount} />
              ),
          }}
        />
        <Tabs.Screen
          name="seller-orders"
          options={{
            href: sellOnly ? undefined : null,
            title: "Orders",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={rMS(22)}
                color={focused ? colors.primary : colors.iconMuted}
              />
            ),
            tabBarBadge:
              sellOnly && storeTabBadgeCount > 0 ? storeTabBadgeCount : undefined,
          }}
        />
        <Tabs.Screen
          name="seller-products"
          options={{
            href: sellOnly ? undefined : null,
            title: "Products",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "cube" : "cube-outline"}
                size={rMS(22)}
                color={focused ? colors.primary : colors.iconMuted}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="seller-inventory"
          options={{
            href: sellOnly ? undefined : null,
            title: "Stock",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "layers" : "layers-outline"}
                size={rMS(22)}
                color={focused ? colors.primary : colors.iconMuted}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            href: sellOnly ? null : undefined,
            title: "Wishlist",
            tabBarIcon: ({ focused }) => <TabBarVectorIcon name="wishlist" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: sellOnly ? "Business" : "Profile",
            // Shopper: label comes from TabBarIconShell inside ProfileTabIcon.
            // Seller: label comes from React Navigation like the other sell-only tabs.
            tabBarShowLabel: sellOnly,
            tabBarIcon: ({ focused }) => (
              <ProfileTabIcon focused={focused} sellOnly={sellOnly} />
            ),
            tabBarButton: (props) => <ProfileTabBarButton {...props} />,
          }}
        />
      </Tabs>
      {sellOnly ? null : <AssistantFab />}
    </TabBarMetricsProvider>
  );
};

export default TabsLayout;
