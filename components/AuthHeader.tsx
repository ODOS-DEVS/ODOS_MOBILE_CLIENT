import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AuthHeaderProps {
  title?: string;
  header?: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, header, subtitle }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const gradientColors = isDark
    ? (["#52525B", "#3F3F46", "#27272A"] as const)
    : (["#78716C", "#57534E", "#44403C"] as const);

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: insets.top + rV(16) }]}
      >
        <View style={styles.brandMark}>
          <Text style={styles.brandText}>ODOS</Text>
        </View>

        {title ? <Text style={styles.eyebrow}>{title}</Text> : null}

        {header ? <Text style={styles.header}>{header}</Text> : null}

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </LinearGradient>

      <View
        style={[
          styles.fade,
          { backgroundColor: colors.screen },
        ]}
      />
    </View>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    zIndex: 2,
  },
  gradient: {
    paddingHorizontal: rS(24),
    paddingBottom: rV(32),
  },
  brandMark: {
    alignSelf: "flex-start",
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
    borderRadius: rMS(10),
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.28)",
    marginBottom: rV(16),
  },
  brandText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: "#FFFFFF",
    letterSpacing: 2.4,
  },
  eyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(12.5),
    color: "rgba(255, 255, 255, 0.78)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: rV(6),
  },
  header: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(27),
    lineHeight: rMS(34),
    color: "#FFFFFF",
    maxWidth: rS(320),
  },
  subtitle: {
    marginTop: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(14.5),
    lineHeight: rMS(22),
    color: "rgba(255, 255, 255, 0.88)",
    maxWidth: rS(340),
  },
  fade: {
    height: rV(20),
    borderTopLeftRadius: rMS(22),
    borderTopRightRadius: rMS(22),
    marginTop: -rV(20),
  },
});
