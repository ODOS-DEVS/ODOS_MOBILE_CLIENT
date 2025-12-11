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

  const handleSearch = () => {
    onStartSearch?.(); // notify parent to show search screen

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
        marginHorizontal: rS(18),
        marginTop: rV(18),
        paddingHorizontal: rS(10),
        paddingVertical: rV(8),
      }}
    >
      <TouchableOpacity
        className="ml-3 bg-accent p-2 rounded-lg"
        onPress={handleSearch}
      >
        <Ionicons name="search-outline" size={18} color="#696969" />
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

      <TouchableOpacity className="ml-3 bg-accent p-2 rounded-lg">
        <Ionicons name="funnel-outline" size={18} color="#696969" />
      </TouchableOpacity>
    </View>
  );
};
