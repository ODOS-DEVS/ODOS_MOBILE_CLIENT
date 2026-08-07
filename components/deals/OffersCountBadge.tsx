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
  const { colors } = useTheme();

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
          backgroundColor: colors.warningSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.warningBorder,
        },
        count: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.warningText,
        },
        label: {
          fontFamily: Fonts.title,
          fontSize: rMS(12),
          color: colors.warningText,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.pill}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
