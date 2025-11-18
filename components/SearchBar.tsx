import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

export const SearchBar = () => {
  return (
    <View className="flex-row items-center mx-8 mt-8 bg-accent rounded-full px-4 py-3 shadow-sm border border-primary">
      <TouchableOpacity
        className="ml-3 bg-accent p-2 rounded-lg"
        activeOpacity={0.7}
        onPress={() => console.log("Filter pressed")}
      >
        <Ionicons name="search-outline" size={18} color={"#696969"} />
      </TouchableOpacity>

      <TextInput
        placeholder="Search..."
        placeholderTextColor="#696969"
        className="flex-1 text-gray-800"
      />

      <TouchableOpacity
        className="ml-3 bg-accent p-2 rounded-lg"
        activeOpacity={0.7}
        onPress={() => console.log("Filter pressed")}
      >
        <Ionicons name="funnel-outline" size={18} color="#696969" />
      </TouchableOpacity>
    </View>
  );
};
