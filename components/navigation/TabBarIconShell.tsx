import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS } from "@/styles/responsive";
import React, { type ReactNode, useEffect, useMemo, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

type TabBarIconShellProps = {
  focused: boolean;
  title: string;
  children: ReactNode;
  badgeCount?: number;
};

export default function TabBarIconShell({
  focused,
  title,
  children,
  badgeCount = 0,
}: TabBarIconShellProps) {
  const { colors, isDark } = useTheme();
  const metrics = useTabBarMetricsContext();
  const showBadge = badgeCount > 0;
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 20,
      mass: 0.85,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  const animatedSurfaceStyle = useMemo(
    () => ({
      transform: [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.04],
          }),
        },
      ],
    }),
    [progress],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        slot: {
          width: metrics.slotWidth,
          alignItems: "center",
          justifyContent: "center",
        },
        stack: {
          alignItems: "center",
          justifyContent: "center",
        },
        iconWrap: {
          width: metrics.iconSurfaceSize,
          height: metrics.iconSurfaceSize,
          borderRadius: metrics.pillBorderRadius,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: metrics.showLabels ? metrics.labelGap : 0,
        },
        iconWrapIdle: {
          backgroundColor: "transparent",
        },
        iconWrapFocused: {
          backgroundColor: colors.primary,
          shadowColor: colors.shadow,
          shadowOpacity: isDark ? 0.3 : 0.14,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: Platform.OS === "android" ? 4 : 0,
        },
        label: {
          width: metrics.labelWidth,
          textAlign: "center",
          fontSize: metrics.labelFontSize,
          lineHeight: metrics.labelLineHeight,
          fontFamily: Fonts.title,
          color: colors.iconMuted,
        },
        labelFocused: {
          fontFamily: Fonts.titleBold,
          color: colors.primary,
        },
        badge: {
          position: "absolute",
          top: 0,
          right: rS(1),
          minWidth: rS(15),
          height: rS(15),
          borderRadius: rS(7.5),
          backgroundColor: "#E53935",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(2),
          borderWidth: 1.5,
          borderColor: isDark ? colors.card : colors.bottomBar,
        },
        badgeText: {
          color: "#FFFFFF",
          fontSize: rMS(7.5),
          fontFamily: Fonts.titleBold,
        },
      }),
    [colors, isDark, metrics],
  );

  return (
    <View style={styles.slot} accessibilityRole="tab" accessibilityState={{ selected: focused }}>
      <View style={styles.stack}>
        <Animated.View
          style={[
            styles.iconWrap,
            focused ? styles.iconWrapFocused : styles.iconWrapIdle,
            animatedSurfaceStyle,
          ]}
        >
          {children}

          {showBadge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? "9+" : badgeCount}</Text>
            </View>
          ) : null}
        </Animated.View>

        {metrics.showLabels ? (
          <Text
            style={[styles.label, focused && styles.labelFocused]}
            numberOfLines={1}
            allowFontScaling={false}
            {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
          >
            {title}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
