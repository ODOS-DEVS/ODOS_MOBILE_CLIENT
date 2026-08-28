import { LaunchBackdrop, OdosMark, OdosWordmark } from "@/components/launch/OdosLaunchChrome";
import { useAuth } from "@/context/AuthContext";
import { rS, rV } from "@/styles/responsive";
import {
  AUTH_ONBOARDING_HREF,
  exitAuthToHome,
} from "@/utils/authNavigation";
import { hasCompletedOnboarding } from "@/utils/onboardingStorage";
import { router, SplashScreen as ExpoSplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

// Long enough for the mark and wordmark to finish fading in before we leave.
const MIN_VISIBLE_MS = 1100;
const REDUCED_MOTION_MIN_VISIBLE_MS = 500;
const EXIT_DURATION_MS = 220;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function SplashScreen() {
  const { isHydrating, user } = useAuth();
  const [launchTarget, setLaunchTarget] = useState<"tabs" | "onboarding" | null>(null);
  const hasHiddenNativeSplashRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const contentOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);

  // Hide the native splash immediately: this screen's first frame is the same flat
  // black canvas the native splash used, so the handoff is invisible — the mark then
  // fades in on top of it instead of sitting hidden behind a static image.
  //
  // This only holds because the expo-splash-screen plugin is configured with a
  // background colour and no image. Give it an `image` again and the mark is
  // drawn twice: once statically by the native splash, then again fading in from
  // zero here, which reads as a flicker on launch.
  useEffect(() => {
    if (hasHiddenNativeSplashRef.current) {
      return;
    }
    hasHiddenNativeSplashRef.current = true;
    void ExpoSplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const reducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
      const [completed] = await Promise.all([
        hasCompletedOnboarding(),
        wait(reducedMotion ? REDUCED_MOTION_MIN_VISIBLE_MS : MIN_VISIBLE_MS),
      ]);
      if (!cancelled) {
        setLaunchTarget(completed ? "tabs" : "onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrating]);

  useEffect(() => {
    if (!launchTarget || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    contentOpacity.value = withTiming(0, { duration: EXIT_DURATION_MS });
    contentScale.value = withTiming(0.96, { duration: EXIT_DURATION_MS });

    const timeout = setTimeout(() => {
      if (launchTarget === "onboarding") {
        router.replace(AUTH_ONBOARDING_HREF);
      } else {
        exitAuthToHome(router, user);
      }
    }, EXIT_DURATION_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchTarget, user]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <LaunchBackdrop>
      <StatusBar style="light" />
      <Animated.View
        style={[
          { flex: 1, alignItems: "center", justifyContent: "center", gap: rV(20) },
          contentStyle,
        ]}
      >
        <OdosMark size={rS(112)} />
        <OdosWordmark delayMs={260} />
      </Animated.View>
    </LaunchBackdrop>
  );
}
