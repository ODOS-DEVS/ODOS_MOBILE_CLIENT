import { rS, rV } from "@/styles/responsive";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface SortTabsProps {
  options: string[];
  onChange?: (option: string) => void;
  defaultOption?: string;
}

const SortTabs: React.FC<SortTabsProps> = ({
  options,
  onChange,
  defaultOption,
}) => {
  const [selected, setSelected] = useState(defaultOption || options[0]);

  const handlePress = (option: string) => {
    setSelected(option);
    onChange?.(option);
  };

  return (
    <View className="mt-3" style={{ marginTop: rV(15) }}>
      <FlatList
        data={options}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: rS(16) }}
        renderItem={({ item }) => {
          const isActive = item === selected;
          return (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
              className={`px-5 py-2 mr-3 rounded-full border ${
                isActive ? "bg-black border-black" : "border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`font-montserrat-semiBold ${
                  isActive ? "text-white" : "text-black"
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default SortTabs;
