import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

const HIDDEN_SNIPPETS = [
  "assistant",
  "Checkout",
  "support/chat",
  "signin",
  "signup",
  "onboarding",
  "verification",
  "forgotpassword",
  "/vendor",
];

export default function AssistantFab() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const tabMetrics = useTabBarMetricsContext();

  const hidden = useMemo(
    () => HIDDEN_SNIPPETS.some((snippet) => pathname.includes(snippet)),
    [pathname],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          position: "absolute",
          right: rS(16),
          bottom: tabMetrics.barBottomOffset + tabMetrics.barTotalHeight + rS(12),
          zIndex: 40,
        },
        button: {
          width: rMS(54),
          height: rMS(54),
          borderRadius: rMS(27),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primary,
          shadowColor: colors.shadow,
          shadowOpacity: Platform.OS === "ios" ? 0.18 : 0.24,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
      }),
    [colors.primary, colors.shadow, tabMetrics.barBottomOffset, tabMetrics.barTotalHeight],
  );

  if (hidden) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={styles.wrap}>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/screens/assistant" as any)}
          accessibilityRole="button"
          accessibilityLabel="Open ODOS Assistant"
        >
          <Ionicons name="sparkles" size={rMS(22)} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
