import { View, Text } from "react-native";
import React from "react";

export default function Divider() {
  return (
    <View className="flex-row items-center my-4 mx-14">
      <View className="flex-1 h-[1px] bg-gray-300" />
      <Text className="mx-3 text-gray-500 text-sm font-poppins">
        or sign in with
      </Text>
      <View className="flex-1 h-[1px] bg-gray-300" />
    </View>
  );
}
