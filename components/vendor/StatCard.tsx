import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning";
};

const toneMap = {
  default: {
    cardBackground: "#FFFFFF",
    borderColor: "#E5E7EB",
    valueColor: AppColors.text,
    accentColor: "#CBD5E1",
  },
  accent: {
    cardBackground: "#EEF4FF",
    borderColor: "#C7D7F6",
    valueColor: "#1D4ED8",
    accentColor: "#3B82F6",
  },
  success: {
    cardBackground: "#ECFDF3",
    borderColor: "#B7E4C7",
    valueColor: "#166534",
    accentColor: "#22C55E",
  },
  warning: {
    cardBackground: "#FFF7ED",
    borderColor: "#F8D5AE",
    valueColor: "#B45309",
    accentColor: "#F59E0B",
  },
} as const;

export function StatCard({ hint, label, tone = "default", value }: StatCardProps) {
  const palette = toneMap[tone];
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.cardBackground,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: palette.accentColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: palette.valueColor }]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: rS(140),
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: rS(4),
  },
  label: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  value: {
    marginTop: rV(8),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
  },
  hint: {
    marginTop: rV(6),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
});
