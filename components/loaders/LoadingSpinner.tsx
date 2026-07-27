import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type LoadingSpinnerProps = {
  label?: string;
  sublabel?: string;
  size?: "small" | "large";
  tone?: "default" | "inverse";
  style?: StyleProp<ViewStyle>;
};

export default function LoadingSpinner({
  label,
  sublabel,
  size = "large",
  tone = "default",
  style,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const isInverse = tone === "inverse";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          alignItems: "center",
          justifyContent: "center",
          gap: rV(10),
          paddingHorizontal: rS(24),
          paddingVertical: rV(8),
        },
        label: {
          marginTop: rV(4),
          color: isInverse ? colors.inverseText : colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(15),
          textAlign: "center",
        },
        sublabel: {
          color: isInverse ? colors.mutedOnInverse : colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          textAlign: "center",
          maxWidth: rS(280),
        },
      }),
    [colors, isInverse],
  );

  return (
    <View style={[styles.wrap, style]}>
      <ActivityIndicator
        size={size}
        color={isInverse ? colors.inverseText : colors.primary}
      />
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}
