import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { type ReactNode, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

type TabBarIconShellProps = {
  focused: boolean;
  title: string;
  children: ReactNode;
  badgeCount?: number;
};

/**
 * Custom tab item: fixed footprint per slot (no jump on change), full titles,
 * active pill only changes fill — not size.
 */
export default function TabBarIconShell({
  focused,
  title,
  children,
  badgeCount = 0,
}: TabBarIconShellProps) {
  const { colors } = useTheme();
  const metrics = useTabBarMetricsContext();
  const showBadge = badgeCount > 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        slot: {
          width: metrics.slotWidth,
          alignItems: "center",
          justifyContent: "center",
          marginTop: rV(5),
        },
        pill: {
          width: metrics.pillWidth,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: metrics.pillPaddingHorizontal,
          paddingVertical: metrics.pillPaddingVertical,
          borderRadius: metrics.pillBorderRadius,
        },
        pillFocused: {
          backgroundColor: colors.tabFocused,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          shadowColor: colors.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        },
        iconBox: {
          width: metrics.iconBoxSize,
          height: metrics.iconBoxSize,
          alignItems: "center",
          justifyContent: "center",
        },
        label: {
          marginTop: rV(2),
          width: metrics.labelWidth,
          textAlign: "center",
          fontSize: metrics.labelFontSize,
          lineHeight: metrics.labelLineHeight,
          fontFamily: Fonts.title,
          color: AppColors.subtext[100],
        },
        labelFocused: {
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        badge: {
          position: "absolute",
          top: rMS(1),
          right: rS(4),
          minWidth: rS(14),
          height: rS(14),
          borderRadius: rS(7),
          backgroundColor: "#E53935",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(2),
          borderWidth: 1.5,
          borderColor: colors.tabBar,
        },
        badgeText: {
          color: "#FFFFFF",
          fontSize: rMS(8),
          fontFamily: Fonts.titleBold,
        },
      }),
    [colors, metrics],
  );

  return (
    <View style={styles.slot}>
      <View style={[styles.pill, focused && styles.pillFocused]}>
        <View style={styles.iconBox}>{children}</View>

        <Text
          style={[styles.label, focused && styles.labelFocused]}
          numberOfLines={1}
          allowFontScaling={false}
          {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
        >
          {title}
        </Text>

        {showBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? "9+" : badgeCount}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
