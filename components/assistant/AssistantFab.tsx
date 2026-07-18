import { useTabBarMetricsContext } from "@/components/navigation/TabBarMetricsContext";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS } from "@/styles/responsive";
import {
  assistantContextToParams,
  buildStoreAssistantContext,
  extractStoreIdFromPath,
} from "@/utils/assistantContext";
import { deriveAssistantScreen } from "@/utils/assistantQuickPrompts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    [colors.shadow, tabMetrics.barBottomOffset, tabMetrics.barTotalHeight],
  );

  if (hidden) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={styles.wrap}>
        <Pressable
          style={styles.button}
          onPress={() => {
            const screen = deriveAssistantScreen(pathname);
            const storeContext = buildStoreAssistantContext({
              storeId: extractStoreIdFromPath(pathname),
            });
            router.push({
              pathname: "/screens/assistant",
              params: {
                screen,
                ...assistantContextToParams(storeContext),
              },
            } as any);
          }}
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
      </View>
    </View>
  );
}
