import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { rS, rV } from "@/styles/responsive";
import { hasCompletedOnboarding } from "@/utils/onboardingStorage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";

const SPLASH_HOLD_MS = 700;

export default function SplashScreen() {
  const { isHydrating } = useAuth();
  const { colors } = useTheme();
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.screen,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: rS(32),
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{
          width: rS(188),
          height: rV(156),
          resizeMode: "contain",
        }}
      />

      <View style={{ marginTop: rV(48), minHeight: rV(88) }}>
        <LoadingSpinner
          label={isHydrating ? "Starting ODOS" : "Welcome"}
          sublabel={
            isHydrating
              ? "Connecting to your account"
              : launchTarget === "onboarding"
                ? "Setting up your experience"
                : "Opening your storefront"
          }
        />
      </View>
    </View>
  );
}
