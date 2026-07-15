import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";

type EmailVerifiedBadgeProps = {
  email: string;
};

export default function EmailVerifiedBadge({ email }: EmailVerifiedBadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(8),
          borderRadius: rMS(18),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${colors.primary}55`,
        },
        inner: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          paddingHorizontal: rS(14),
          paddingVertical: rV(13),
        },
        iconShell: {
          width: rMS(44),
          height: rMS(44),
          borderRadius: rMS(15),
          backgroundColor: "rgba(255,255,255,0.92)",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        },
        checkDot: {
          position: "absolute",
          right: -rS(2),
          bottom: -rV(2),
          width: rMS(18),
          height: rMS(18),
          borderRadius: rMS(9),
          backgroundColor: colors.successText,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#FFFFFF",
        },
        copy: {
          flex: 1,
          minWidth: 0,
          gap: rV(2),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13.5),
          color: colors.primary,
        },
        email: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14.5),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(16),
          color: colors.textMuted,
        },
        badge: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(9),
          paddingVertical: rV(5),
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        badgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(9.5),
          color: colors.onPrimary,
          letterSpacing: 0.5,
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View entering={FadeInDown.duration(280)} style={styles.wrap}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.primary}08`, `${colors.successSoft}`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.iconShell}>
          <Ionicons name="mail" size={rMS(22)} color={colors.primary} />
          <View style={styles.checkDot}>
            <Ionicons name="checkmark" size={rMS(10)} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Email verified</Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
          <Text style={styles.subtitle}>
            Your account email is confirmed and secure.
          </Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={rMS(10)} color={colors.onPrimary} />
          <Text style={styles.badgeText}>VERIFIED</Text>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
}
