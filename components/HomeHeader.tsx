import { rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeHeader = () => {
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: horizontalPadding,
        paddingTop: Math.max(insets.top, rV(16)),
        paddingBottom: rV(8),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: "https://i.pravatar.cc/50" }}
          style={{
            width: rS(40),
            height: rS(40),
            borderRadius: rS(20),
            marginRight: rS(10),
          }}
        />
        <View>
          <Text
            className="font-montserrat-semiBold text-black"
            style={{ fontSize: rS(16) }}
          >
            Brooklyn Simmons
          </Text>
          <Text
            className="text-secondary"
            style={{ fontSize: rS(13) }}
          >
            Hi! Good morning!
          </Text>
        </View>
      </View>
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
