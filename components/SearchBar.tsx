import { rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  value?: string,
  onChangeText?: (text: string) => void,
}

export const SearchBar = ({ value, onChangeText }: SearchBarProps) => {
  return (
    <View
      className="flex-row items-center bg-accent rounded-full shadow-sm border border-primary"
      style={{
        marginHorizontal: rS(18),
        marginTop: rV(18),
        paddingHorizontal: rS(10),
        paddingVertical: rV(8),
      }}
    >
      <TouchableOpacity
        className="ml-3 bg-accent p-2 rounded-lg"
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={18} color={"#696969"} />
      </TouchableOpacity>

      <TextInput
      value={value}
      onChangeText={onChangeText}
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
