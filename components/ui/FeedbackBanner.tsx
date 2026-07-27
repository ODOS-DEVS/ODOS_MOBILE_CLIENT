import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export type FeedbackTone = "danger" | "warning" | "success" | "info";

type FeedbackBannerProps = {
  message: string;
  tone?: FeedbackTone;
  title?: string;
};

/**
 * Shared inline feedback strip for forms and auth screens.
 * Uses theme semantic soft/text tokens so light/dark stay consistent.
 */
export default function FeedbackBanner({
  message,
  tone = "danger",
  title,
}: FeedbackBannerProps) {
  const { colors } = useTheme();

  const palette = useMemo(() => {
    switch (tone) {
      case "success":
        return {
          bg: colors.successSoft,
          border: colors.successBorder,
          text: colors.successText,
          icon: "checkmark-circle-outline" as const,
        };
      case "warning":
        return {
          bg: colors.warningSoft,
          border: colors.warningBorder,
          text: colors.warningText,
          icon: "warning-outline" as const,
        };
      case "info":
        return {
          bg: colors.infoSoft,
          border: colors.infoBorder,
          text: colors.infoText,
          icon: "information-circle-outline" as const,
        };
      default:
        return {
          bg: colors.dangerSoft,
          border: colors.dangerText,
          text: colors.dangerText,
          icon: "alert-circle-outline" as const,
        };
    }
  }, [colors, tone]);

  if (!message.trim()) {
    return null;
  }

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={palette.icon} size={rMS(18)} color={palette.text} />
      <View style={styles.copy}>
        {title ? (
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        ) : null}
        <Text style={[styles.message, { color: palette.text }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  copy: {
    flex: 1,
    gap: rV(2),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  message: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
});
