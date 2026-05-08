import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, type ViewStyle } from "react-native";

interface SearchBarProps {
  data?: any[];
  onResults?: (results: any[]) => void;
  onStartSearch?: () => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  searchKeys?: string[];
  containerStyle?: ViewStyle;
}

export const SearchBar = ({
  data = [],
  onResults,
  onStartSearch,
  onQueryChange,
  placeholder = "Search products, stores...",
  searchKeys = ["title", "category", "subtitle", "name", "label", "store"],
  containerStyle,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const { horizontalPadding } = useResponsive();

  const normalizedQuery = useMemo(
    () => query.trim().toLowerCase().replace(/\s+/g, " "),
    [query]
  );

  const performSearch = useCallback(
    (value: string) => {
      if (!onResults) return;
      if (value.length === 0) {
        onResults([]);
        return;
      }

      const terms = value.split(" ");
      const filtered = data.filter((item) => {
        const searchableText = searchKeys
          .map((key) => item?.[key])
          .filter((v) => typeof v === "string" || typeof v === "number")
          .map((v) => String(v).toLowerCase())
          .join(" ");
        return terms.every((term) => searchableText.includes(term));
      });
      onResults(filtered);
    },
    [data, onResults, searchKeys]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
    onQueryChange?.(normalized);
    if (normalized.length > 0) {
      onStartSearch?.();
    }
    performSearch(normalized);
  };

  return (
    <View style={[styles.wrapper, { marginHorizontal: horizontalPadding }, containerStyle]}>
      <TouchableOpacity
        style={styles.searchIconWrap}
        onPress={() => {
          if (normalizedQuery.length > 0) {
            onStartSearch?.();
            performSearch(normalizedQuery);
          }
        }}
        activeOpacity={0.75}
      >
        <Ionicons name="search-outline" size={rMS(17)} color={AppColors.secondary} />
      </TouchableOpacity>

      <TextInput
        value={query}
        onChangeText={handleQueryChange}
        placeholder={placeholder}
        placeholderTextColor={AppColors.subtext[100]}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (normalizedQuery.length > 0) {
            onStartSearch?.();
            performSearch(normalizedQuery);
          }
        }}
      />

      {query.length > 0 && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => handleQueryChange("")}
          activeOpacity={0.75}
        >
          <Ionicons name="close-circle" size={rMS(17)} color={AppColors.subtext[100]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: rV(14),
    backgroundColor: AppColors.white,
    borderRadius: rMS(12),
    borderWidth: 1,
    borderColor: "#D8DEE6",
    minHeight: rMS(44),
    paddingHorizontal: rS(10),
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconWrap: {
    paddingHorizontal: rS(4),
    paddingVertical: rV(4),
    marginRight: rS(4),
  },
  input: {
    flex: 1,
    fontSize: rMS(13),
    color: AppColors.text,
    fontFamily: Fonts.text,
    paddingVertical: rV(7),
  },
  clearBtn: {
    paddingHorizontal: rS(4),
    paddingVertical: rV(4),
    marginLeft: rS(4),
  },
});
