import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const TabsLayout = () => {
  type TabIconProps = {
    focused: boolean;
    name: keyof typeof Ionicons.glyphMap;
    title: string;
  };

  const TabIcon = ({ focused, name, title }: TabIconProps) => {
    return (
      <View className="items-center justify-center mt-12">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            focused ? "bg-gray-700" : "bg-transparent"
          }`}
        >
          <Ionicons
            name={name}
            size={19}
            color={focused ? "#fff" : "#8E8E93"}
          />
        </View>

        <Text
          className={`text-sm w-20 text-center ${
            focused
              ? "text-text font-montserrat-extraBold"
              : "text-subtext-200 font-montserrat-semiBold"
          }`}
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
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 20,
          height: 88,
          paddingBottom: 30,
          paddingHorizontal: 10,
          borderRadius: 30,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.6,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" focused={focused} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid-outline" focused={focused} title="Category" />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="cart-outline" focused={focused} title="Cart" />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="pricetags-outline"
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
              name="person"
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
