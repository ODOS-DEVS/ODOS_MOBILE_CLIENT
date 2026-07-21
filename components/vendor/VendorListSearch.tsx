import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type VendorListSearchProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export default function VendorListSearch({
  value,
  onChangeText,
  placeholder = "Search…",
}: VendorListSearchProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name="search-outline" size={rS(16)} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    minHeight: rV(44),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(12),
  },
  input: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    paddingVertical: rV(10),
  },
});
