import { router, SplashScreen as ExpoSplashScreen } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { hasCompletedOnboarding } from "@/utils/onboardingStorage";

export default function SplashScreen() {
  const { isHydrating } = useAuth();
  const [launchTarget, setLaunchTarget] = useState<"tabs" | "onboarding" | null>(null);
  const hasNavigatedRef = useRef(false);

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
    if (isHydrating || !launchTarget || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;

    void (async () => {
      if (launchTarget === "onboarding") {
        router.replace("/(root)/(auth)/onboarding" as any);
      } else {
        router.replace("./(tabs)");
      }

      await ExpoSplashScreen.hideAsync();
    })();
  }, [isHydrating, launchTarget]);

  // Keep the native launch splash visible; match its black background if anything peeks through.
  return <View style={{ flex: 1, backgroundColor: "#000000" }} />;
}
