import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MapUnavailablePlaceholderProps = {
  title?: string;
  message?: string;
  height?: number;
};

export default function MapUnavailablePlaceholder({
  title = "Map preview unavailable",
  message = "This build does not include Google Maps. You can still use addresses and open directions in your maps app.",
  height = rV(220),
}: MapUnavailablePlaceholderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          height,
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name="map-outline" size={rMS(28)} color={colors.iconMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(24),
    gap: rV(8),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    textAlign: "center",
  },
  message: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    textAlign: "center",
  },
});
