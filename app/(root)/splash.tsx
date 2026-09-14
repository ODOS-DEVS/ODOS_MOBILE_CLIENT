import {
  LaunchBackdrop,
  OdosMark,
  OdosWordmark,
  useReducedMotion,
} from "@/components/launch/OdosLaunchChrome";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  AUTH_ONBOARDING_HREF,
  exitAuthToHome,
} from "@/utils/authNavigation";
import { hasCompletedOnboarding } from "@/utils/onboardingStorage";
import { router, SplashScreen as ExpoSplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Long enough for the mark and wordmark to finish fading in before we leave.
const MIN_VISIBLE_MS = 1100;
const REDUCED_MOTION_MIN_VISIBLE_MS = 500;
const EXIT_DURATION_MS = 220;

// Startup waits on two reads: the auth session and the persisted workspace mode.
// Both are needed to pick the right landing screen -- an approved vendor in
// sell-only mode belongs on their dashboard, not the shopper home.
//
// Neither is allowed to hold the app hostage. The session read makes a network
// call, and on a weak connection that can run to the global 30s fetch timeout;
// a black screen for 30 seconds is indistinguishable from a crash. So the wait
// is budgeted: past SLOW_HINT_MS we say so, and past BOOT_BUDGET_MS we go
// anyway. Leaving early is safe because the session keeps hydrating in the
// background and every screen reads it reactively -- the same state the app is
// already in for a signed-out visitor.
const SLOW_HINT_MS = 3_500;
const BOOT_BUDGET_MS = 8_000;

export default function SplashScreen() {
  const { isHydrating, user } = useAuth();
  const workspaceHydrated = useWorkspaceModeStore((state) => state.hydrated);
  const reducedMotion = useReducedMotion();

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [minVisibleElapsed, setMinVisibleElapsed] = useState(false);
  const [bootBudgetExpired, setBootBudgetExpired] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);

  const mountedAtRef = useRef(Date.now());
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

  // Read once, and treat any failure as "not yet onboarded" rather than letting
  // it settle nothing: a screen that never resolves has no way out for the user.
  useEffect(() => {
    let cancelled = false;
    void hasCompletedOnboarding()
      .catch(() => false)
      .then((completed) => {
        if (!cancelled) {
          setOnboardingCompleted(completed);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Measured from mount rather than from when reduced-motion resolves, so the
  // brand hold is the intended length however late that preference arrives.
  useEffect(() => {
    const target = reducedMotion ? REDUCED_MOTION_MIN_VISIBLE_MS : MIN_VISIBLE_MS;
    const remaining = Math.max(0, target - (Date.now() - mountedAtRef.current));
    const timeout = setTimeout(() => setMinVisibleElapsed(true), remaining);
    return () => clearTimeout(timeout);
  }, [reducedMotion]);

  useEffect(() => {
    const hintTimeout = setTimeout(() => setShowSlowHint(true), SLOW_HINT_MS);
    const budgetTimeout = setTimeout(() => setBootBudgetExpired(true), BOOT_BUDGET_MS);
    return () => {
      clearTimeout(hintTimeout);
      clearTimeout(budgetTimeout);
    };
  }, []);

  const startupSettled = !isHydrating && workspaceHydrated;
  const canLaunch =
    onboardingCompleted !== null &&
    minVisibleElapsed &&
    (startupSettled || bootBudgetExpired);

  useEffect(() => {
    if (!canLaunch || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    const exitDuration = reducedMotion ? 0 : EXIT_DURATION_MS;
    contentOpacity.value = withTiming(0, { duration: exitDuration });
    contentScale.value = withTiming(0.96, { duration: exitDuration });

    const timeout = setTimeout(() => {
      if (onboardingCompleted) {
        exitAuthToHome(router, user);
      } else {
        router.replace(AUTH_ONBOARDING_HREF);
      }
    }, exitDuration);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLaunch, onboardingCompleted, reducedMotion, user]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  // Only while genuinely still waiting — never during the normal fast launch,
  // and never once we have decided to leave.
  const isWaitingOnStartup = showSlowHint && !startupSettled && !canLaunch;

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
        {isWaitingOnStartup ? (
          <Animated.Text
            entering={reducedMotion ? undefined : FadeIn.duration(240)}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
            style={{
              fontFamily: Fonts.text,
              fontSize: rMS(12.5),
              color: "rgba(255,255,255,0.62)",
              marginTop: rV(8),
              textAlign: "center",
            }}
          >
            Still connecting…
          </Animated.Text>
        ) : null}
      </Animated.View>
    </LaunchBackdrop>
  );
}
