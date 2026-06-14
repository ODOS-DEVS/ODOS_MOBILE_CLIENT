import { useTheme } from "@/context/ThemeContext";
import { rMS } from "@/styles/responsive";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";

export default function TabBarBackground() {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          ...StyleSheet.absoluteFillObject,
          borderTopLeftRadius: rMS(18),
          borderTopRightRadius: rMS(18),
          overflow: "hidden",
          backgroundColor: isDark ? colors.card : colors.bottomBar,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: colors.bottomBarBorder,
        },
        topHighlight: {
          position: "absolute",
          top: 0,
          left: rMS(18),
          right: rMS(18),
          height: StyleSheet.hairlineWidth,
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)",
        },
      }),
    [colors.bottomBar, colors.bottomBarBorder, colors.card, isDark],
  );

  return (
    <View style={styles.shell}>
      {!isDark && Platform.OS === "ios" ? <View style={styles.topHighlight} /> : null}
    </View>
  );
}
