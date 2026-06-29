import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode } from "react";
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

export function getLaunchGradient(isDark: boolean): readonly [string, string, string] {
  return isDark
    ? (["#52525B", "#3F3F46", "#18181B"] as const)
    : (["#78716C", "#57534E", "#44403C"] as const);
}

type OdosBrandGradientProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function OdosBrandGradient({ children, style, contentStyle }: OdosBrandGradientProps) {
  const { isDark } = useTheme();
  const gradientColors = getLaunchGradient(isDark);

  return (
    <View style={[styles.gradientShell, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.gradientContent, contentStyle]}>{children}</View>
    </View>
  );
}

type OdosBrandMarkProps = {
  size?: "splash" | "onboarding";
  showTagline?: boolean;
};

export function OdosBrandMark({ size = "splash", showTagline = true }: OdosBrandMarkProps) {
  const iconSize = size === "splash" ? rS(88) : rS(72);
  const shellRadius = size === "splash" ? rMS(24) : rMS(22);

  return (
    <View style={styles.brandStack}>
      <View
        style={[
          styles.iconShell,
          {
            width: iconSize + rS(18),
            height: iconSize + rS(18),
            borderRadius: shellRadius,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/icon.png")}
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: shellRadius - rMS(4),
          }}
        />
      </View>

      <Text style={[styles.wordmark, size === "onboarding" && styles.wordmarkCompact]}>
        ODOS
      </Text>

      {showTagline ? (
        <Text style={[styles.tagline, size === "onboarding" && styles.taglineCompact]}>
          Shop local. Delivered fast.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientShell: {
    flex: 1,
    overflow: "hidden",
  },
  gradientContent: {
    flex: 1,
  },
  brandStack: {
    alignItems: "center",
    gap: rV(14),
  },
  iconShell: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  wordmark: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  wordmarkCompact: {
    fontSize: rMS(22),
    letterSpacing: 3.2,
  },
  tagline: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
    color: "rgba(255, 255, 255, 0.86)",
    textAlign: "center",
    maxWidth: rS(260),
  },
  taglineCompact: {
    fontSize: rMS(13),
  },
});
