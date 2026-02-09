import { useResponsive } from "@/styles/responsive";
import { rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  data: any[];
  onResults: (results: any[]) => void;
  onStartSearch?: () => void;
}

export const SearchBar = ({
  data,
  onResults,
  onStartSearch,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const { horizontalPadding } = useResponsive();

  const handleSearch = () => {
    onStartSearch?.();

    if (query.trim() === "") {
      onResults([]);
      return;
    }

    const filtered = data.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    onResults(filtered);
  };

  return (
    <View
      className="flex-row items-center bg-accent rounded-full shadow-sm border border-primary"
      style={{
        marginHorizontal: horizontalPadding,
        marginTop: rV(18),
        paddingHorizontal: rS(14),
        paddingVertical: rV(10),
      }}
    >
      <TouchableOpacity
        style={{ marginLeft: rS(12), padding: rS(8), borderRadius: rS(8) }}
        onPress={handleSearch}
      >
        <Ionicons name="search-outline" size={rS(18)} color="#696969" />
      </TouchableOpacity>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        placeholderTextColor="#696969"
        className="flex-1 text-gray-800"
        returnKeyType="search"
        onSubmitEditing={handleSearch} // press ENTER to search
      />

      <TouchableOpacity
        style={{ marginLeft: rS(12), padding: rS(8), borderRadius: rS(8) }}
      >
        <Ionicons name="funnel-outline" size={rS(18)} color="#696969" />
      </TouchableOpacity>
    </View>
  );
};
