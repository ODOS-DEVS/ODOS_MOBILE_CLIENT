import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type OffersCountBadgeProps = {
  count: number;
  label?: string;
};

export function OffersCountBadge({ count, label = "offers" }: OffersCountBadgeProps) {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pill: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(12),
          paddingVertical: rV(6),
          borderRadius: rS(999),
          backgroundColor: isDark ? "#3F2E12" : "#FFF7ED",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? "rgba(252, 211, 77, 0.25)" : "#FED7AA",
        },
        count: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: isDark ? "#FCD34D" : "#C2410C",
        },
        label: {
          fontFamily: Fonts.title,
          fontSize: rMS(12),
          color: isDark ? "#FDE68A" : "#9A3412",
        },
      }),
    [isDark],
  );

  return (
    <View style={styles.pill}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
