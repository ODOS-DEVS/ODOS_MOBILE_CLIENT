import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VendorStoreActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
  badgeTone?: "neutral" | "warning" | "success";
  isLast?: boolean;
};

export default function VendorStoreActionRow({
  icon,
  label,
  subtitle,
  onPress,
  badge,
  badgeTone = "neutral",
  isLast = false,
}: VendorStoreActionRowProps) {
  const { colors, isDark } = useTheme();

  const badgeColors =
    badgeTone === "warning"
      ? { bg: isDark ? "#422006" : "#FEF3C7", text: isDark ? "#FCD34D" : "#92400E" }
      : badgeTone === "success"
        ? { bg: isDark ? "#14532D" : "#DCFCE7", text: isDark ? "#86EFAC" : "#166534" }
        : { bg: isDark ? colors.pill : "#F3F4F6", text: colors.textMuted };

  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <View
        style={[
          styles.iconShell,
          { backgroundColor: isDark ? colors.pill : "#EEF2FF" },
        ]}
      >
        <Ionicons name={icon} size={rMS(18)} color={colors.primary} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
            {label}
          </Text>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
              <Text style={[styles.badgeText, { color: badgeColors.text }]}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text
          style={[styles.subtitle, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>

      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={rMS(18)} color={colors.iconMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(12),
    minHeight: rV(64),
  },
  iconShell: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(12),
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: rV(3),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  label: {
    flex: 1,
    flexShrink: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    lineHeight: rMS(18),
  },
  chevronWrap: {
    flexShrink: 0,
    marginLeft: rS(4),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(17),
  },
  badge: {
    paddingHorizontal: rS(8),
    paddingVertical: rV(2),
    borderRadius: rMS(999),
  },
  badgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10),
  },
});
