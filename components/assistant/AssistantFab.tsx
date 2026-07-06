import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS } from "@/styles/responsive";
import { deriveAssistantScreen } from "@/utils/assistantQuickPrompts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const HIDDEN_SNIPPETS = [
  "assistant",
  "Checkout",
  "support/chat",
  "signin",
  "signup",
  "onboarding",
  "verification",
  "forgotpassword",
];

export default function AssistantFab() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const tabMetrics = useTabBarMetricsContext();
  const floatY = useSharedValue(0);
  const glow = useSharedValue(0);

  const hidden = useMemo(
    () => HIDDEN_SNIPPETS.some((snippet) => pathname.includes(snippet)),
    [pathname],
  );

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
        withTiming(0.35, { duration: 1600, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [floatY, glow]);

  const animatedWrap = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.92 + glow.value * 0.12 }],
  }));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          position: "absolute",
          right: rS(16),
          bottom: tabMetrics.barBottomOffset + tabMetrics.barTotalHeight + rS(12),
          zIndex: 40,
        },
        glow: {
          position: "absolute",
          width: rMS(56),
          height: rMS(56),
          borderRadius: rMS(28),
          backgroundColor: colors.primary,
          alignSelf: "center",
          top: -rS(4),
        },
        button: {
          width: rMS(52),
          height: rMS(52),
          borderRadius: rMS(26),
          overflow: "hidden",
          shadowColor: colors.shadow,
          shadowOpacity: Platform.OS === "ios" ? 0.22 : 0.28,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
          elevation: 10,
        },
        gradient: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      }),
    [colors.primary, colors.shadow, tabMetrics.barBottomOffset, tabMetrics.barTotalHeight],
  );

  if (hidden) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.wrap, animatedWrap]}>
        <Animated.View style={[styles.glow, animatedGlow]} />
        <Pressable
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/screens/assistant",
              params: { screen: deriveAssistantScreen(pathname) },
            } as any)
          }
          accessibilityRole="button"
          accessibilityLabel="Open ODOS Assistant"
        >
          <LinearGradient
            colors={[colors.primary, "#4B5563"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Ionicons name="sparkles" size={rMS(22)} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
