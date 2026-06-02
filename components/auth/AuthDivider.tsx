import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type AuthDividerProps = {
  label?: string;
};

export default function AuthDivider({ label = "or continue with" }: AuthDividerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: rV(20),
    gap: rS(12),
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    textTransform: "lowercase",
  },
});
