import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        iconWrap: {
          alignItems: "center",
          justifyContent: "center",
          minWidth: rS(58),
          minHeight: rV(46),
          paddingHorizontal: rS(8),
          paddingVertical: rV(6),
          marginTop: rV(3),
          borderRadius: rMS(18),
        },
        iconWrapFocused: {
          backgroundColor: colors.tabFocused,
        },
        label: {
          marginTop: rV(4),
          width: rS(58),
          textAlign: "center",
          fontSize: rMS(9.5),
          letterSpacing: 0,
        },
        labelFocused: {
          color: colors.text,
          fontFamily: Fonts.titleBold,
        },
        labelDefault: {
          color: AppColors.subtext[100],
          fontFamily: Fonts.title,
        },
      }),
    [colors],
  );

  type TabIconProps = {
    focused: boolean;
    source: ImageSourcePropType;
    title: string;
  };

  const TabIcon = ({ focused, source, title }: TabIconProps) => {
    return (
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Image
          source={source}
          style={{
            width: focused ? rMS(23) : rMS(21),
            height: focused ? rMS(23) : rMS(21),
            tintColor: focused ? colors.text : AppColors.subtext[100],
            transform: [{ scale: focused ? 1.02 : 1 }],
          }}
          resizeMode="contain"
        />

        <Text
          style={[styles.label, focused ? styles.labelFocused : styles.labelDefault]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingTop: rV(4),
        },
        tabBarStyle: {
          position: "absolute",
          left: rS(14),
          right: rS(14),
          bottom: Math.max(insets.bottom * 0.0, rV(0)),
          height: rV(74) + insets.bottom * 0.18,
          paddingTop: rV(10),
          paddingBottom: Math.max(insets.bottom * 0.05, rV(6)),
          paddingHorizontal: rS(10),
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
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
            <TabIcon
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
            <TabIcon
              source={require("../../../assets/images/bag.png")}
              focused={focused}
              title="Cart"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ focused }) => (
            <TabIcon
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
            <TabIcon
              source={require("../../../assets/images/Profile.png")}
              focused={focused}
              title="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
