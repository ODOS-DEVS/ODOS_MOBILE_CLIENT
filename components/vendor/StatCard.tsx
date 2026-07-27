import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning";
};

export function StatCard({ hint, label, tone = "default", value }: StatCardProps) {
  const { colors } = useTheme();

  const palette = useMemo(() => {
    switch (tone) {
      case "accent":
        return {
          cardBackground: colors.infoSoft,
          borderColor: colors.infoBorder,
          valueColor: colors.infoText,
          accentColor: colors.infoText,
        };
      case "success":
        return {
          cardBackground: colors.successSoft,
          borderColor: colors.successBorder,
          valueColor: colors.successText,
          accentColor: colors.successText,
        };
      case "warning":
        return {
          cardBackground: colors.warningSoft,
          borderColor: colors.warningBorder,
          valueColor: colors.warningText,
          accentColor: colors.warningText,
        };
      default:
        return {
          cardBackground: colors.card,
          borderColor: colors.cardBorder,
          valueColor: colors.text,
          accentColor: colors.borderStrong,
        };
    }
  }, [colors, tone]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          minWidth: rS(140),
          borderRadius: rMS(22),
          paddingHorizontal: rS(16),
          paddingVertical: rV(16),
          borderWidth: StyleSheet.hairlineWidth,
          overflow: "hidden",
          backgroundColor: palette.cardBackground,
          borderColor: palette.borderColor,
        },
        accentBar: {
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: rS(4),
          backgroundColor: palette.accentColor,
        },
        label: {
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(12),
        },
        value: {
          marginTop: rV(8),
          fontFamily: Fonts.titleBold,
          fontSize: rMS(24),
          color: palette.valueColor,
        },
        hint: {
          marginTop: rV(6),
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
        },
      }),
    [colors, palette],
  );

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}
