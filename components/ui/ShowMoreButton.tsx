import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";

type ShowMoreButtonProps = {
  onPress: () => void;
  remainingCount: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** Inline "reveal the next batch" row for lists capped to a default page size —
 * distinct from ViewAllButton, which navigates away to a separate screen. */
export function ShowMoreButton({ onPress, remainingCount, label = "See more" }: ShowMoreButtonProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(6),
          paddingVertical: rV(12),
          borderRadius: rS(14),
          marginTop: rV(4),
          backgroundColor: colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        text: {
          fontFamily: Fonts.textBold,
          fontSize: rMS(12.5),
          color: colors.text,
        },
      }),
    [colors],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      style={styles.row}
    >
      <Text style={styles.text}>
        {label} ({remainingCount})
      </Text>
      <Ionicons name="chevron-down" size={rMS(14)} color={colors.text} />
    </TouchableOpacity>
  );
}
