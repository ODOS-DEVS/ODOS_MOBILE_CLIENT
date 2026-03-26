import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

const TabsLayout = () => {
  type TabIconProps = {
    focused: boolean;
    source: ImageSourcePropType;
    title: string;
  };

  const TabIcon = ({ focused, source, title }: TabIconProps) => {
    return (
      <View className="items-center justify-center mt-10 mb-2">
        <Image
          source={source}
          style={{
            width: focused ? 28 : 24,
            height: focused ? 28 : 24,
            tintColor: focused ? "#111827" : "#9CA3AF",
            transform: [{ scale: focused ? 1.05 : 1 }],
          }}
          resizeMode="contain"
        />

        <Text
          className={`text-[10px] mt-2 w-20 text-center ${
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
          height: 83,
          paddingBottom: 80,
          paddingHorizontal: 10,
          borderRadius: 30,
          backgroundColor: "#D9D9D9",
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
