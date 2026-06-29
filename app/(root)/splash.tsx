import { OdosBrandGradient, OdosBrandMark } from "@/components/launch/OdosLaunchChrome";
import { useAuth } from "@/context/AuthContext";
import { rV } from "@/styles/responsive";
import { hasCompletedOnboarding } from "@/utils/onboardingStorage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPLASH_HOLD_MS = 900;

export default function SplashScreen() {
  const { isHydrating } = useAuth();
  const insets = useSafeAreaInsets();
  const [launchTarget, setLaunchTarget] = useState<"tabs" | "onboarding" | null>(null);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const completed = await hasCompletedOnboarding();
      if (!cancelled) {
        setLaunchTarget(completed ? "tabs" : "onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrating]);

  useEffect(() => {
    if (isHydrating || !launchTarget) {
      return;
    }

    const timer = setTimeout(() => {
      if (launchTarget === "onboarding") {
        router.replace("/(root)/(auth)/onboarding" as any);
        return;
      }

      router.replace("./(tabs)");
    }, SPLASH_HOLD_MS);

    return () => clearTimeout(timer);
  }, [isHydrating, launchTarget]);

  const statusLabel = isHydrating
    ? "Preparing your account"
    : launchTarget === "onboarding"
      ? "First-time setup"
      : "Opening marketplace";

  return (
    <OdosBrandGradient>
      <StatusBar style="light" />
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + rV(24),
            paddingBottom: Math.max(insets.bottom, rV(24)),
          },
        ]}
      >
        <View style={styles.center}>
          <OdosBrandMark />
        </View>

        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.status}>{statusLabel}</Text>
        </View>
      </View>
    </OdosBrandGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    gap: rV(10),
    minHeight: rV(56),
  },
  status: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
