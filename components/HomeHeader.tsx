import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeHeader = () => {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();

  const displayName = user?.full_name?.trim() || "Guest";
  const greeting = user ? "Welcome back" : "Hi! Good morning!";
  const handleProfilePress = () => {
    if (
      !requireAuth({
        title: "Sign in to view your profile",
        message:
          "Create an account or log in to access your profile, saved preferences, and order history.",
      })
    ) {
      return;
    }

    router.push("/(root)/(tabs)/profile");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: horizontalPadding,
        paddingTop: Math.max(insets.top, rV(66)),
        paddingBottom: rV(8),
      }}
    >
      <TouchableOpacity
        onPress={handleProfilePress}
        activeOpacity={0.8}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <UserAvatar
          avatarUrl={user?.avatar_url}
          size={rS(40)}
          style={{ marginRight: rS(10) }}
        />
        <View>
          <Text
            className="font-montserrat-semiBold text-black"
            style={{ fontSize: rS(16) }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text className="text-secondary" style={{ fontSize: rS(13) }}>
            {greeting}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.push("/(root)/screens/Notification");
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="notifications-outline" size={rS(22)} color="#000" />
      </TouchableOpacity>
    </View>
  );
};
