import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type DiscoveryFilterChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function DiscoveryFilterChip({
  label,
  active = false,
  onPress,
}: DiscoveryFilterChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipDefault]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelDefault]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    chip: {
      borderRadius: 999,
      paddingHorizontal: rS(12),
      paddingVertical: rV(7),
      borderWidth: StyleSheet.hairlineWidth,
    },
    chipDefault: {
      backgroundColor: colors.surfaceSubtle,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    label: {
      fontSize: rMS(11.5),
      fontFamily: Fonts.title,
    },
    labelDefault: {
      color: colors.text,
    },
    labelActive: {
      color: colors.onPrimary,
    },
  });
}
