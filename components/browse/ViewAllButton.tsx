import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ViewAllButtonProps = {
  onPress: () => void;
  label?: string;
  count?: number;
  showArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function ViewAllButton({
  onPress,
  label = "View All",
  count,
  showArrow = true,
  style,
  accessibilityLabel,
}: ViewAllButtonProps) {
  const { colors, isDark } = useTheme();

  const displayLabel = count != null ? `${label} (${count})` : label;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pill: {
          flexDirection: "row",
          alignItems: "center",
          flexShrink: 0,
          gap: rS(5),
          paddingHorizontal: rS(14),
          paddingVertical: rS(7),
          borderRadius: rS(999),
          backgroundColor: isDark ? "#2A2A2A" : colors.surfaceMuted,
          borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "transparent",
        },
        label: {
          fontFamily: Fonts.title,
          fontSize: rMS(12),
          color: colors.text,
          letterSpacing: 0.15,
        },
        arrow:
          Platform.OS === "ios"
            ? ({
                marginTop: 0.5,
              } as const)
            : ({} as const),
      }),
    [colors, isDark],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      style={[styles.pill, style]}
    >
      <Text style={styles.label}>{displayLabel}</Text>
      {showArrow ? (
        <Ionicons
          name="arrow-forward"
          size={rMS(13)}
          color={colors.text}
          style={styles.arrow}
        />
      ) : null}
    </TouchableOpacity>
  );
}
