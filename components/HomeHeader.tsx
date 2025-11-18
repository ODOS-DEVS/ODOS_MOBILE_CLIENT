import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export const HomeHeader = () => {
  return (
    <View className="flex-row justify-between items-center mx-5 pt-20">
      <View className="flex-row items-center">
        <Image
          source={{ uri: "https://i.pravatar.cc/50" }}
          className="w-10 h-10 rounded-full mr-2.5"
        />
        <View>
          <Text className="text-lg font-montserrat-semiBold text-black">
            Brooklyn Simmons
          </Text>
          <Text className="text-sm text-secondary">Hi! Good morning!</Text>
        </View>
      </View>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={22} />
      </TouchableOpacity>
    </View>
  );
};
