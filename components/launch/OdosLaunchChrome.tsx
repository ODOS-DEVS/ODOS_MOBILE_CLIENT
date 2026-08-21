import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useEffect, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

/** The one signature brand color — the red dot on the bag mark. Used sparingly. */
export const LAUNCH_ACCENT = "#FF3B5F";
export const LAUNCH_BG = "#000000";

/** Tracks the OS-level reduce-motion preference so launch chrome can stay tasteful, not disorienting. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) {
        setReduced(value);
      }
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

type LaunchBackdropProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Flat black canvas — matches the native launch screen exactly, no extra decoration. */
export function LaunchBackdrop({ children, style }: LaunchBackdropProps) {
  return <View style={[styles.backdrop, style]}>{children}</View>;
}

type OdosMarkProps = {
  size?: number;
  /** Play a single, quiet fade + scale-up entrance. Set false to render statically. */
  animate?: boolean;
  delayMs?: number;
};

/** The bag-and-dot app icon, rendered as the hero mark with one clean fade-in — nothing else. */
export function OdosMark({ size = rS(112), animate = true, delayMs = 0 }: OdosMarkProps) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;
  const opacity = useSharedValue(shouldAnimate ? 0 : 1);
  const scale = useSharedValue(shouldAnimate ? 0.94 : 1);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    opacity.value = withDelay(delayMs, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delayMs, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnimate]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={markStyle}>
      <Image source={require("@/assets/images/icon.png")} style={{ width: size, height: size }} />
    </Animated.View>
  );
}

type OdosWordmarkProps = {
  compact?: boolean;
  showTagline?: boolean;
  delayMs?: number;
};

/** "ODOS" heavy + tight, "MARKET" light + wide-tracked in the accent color, tagline beneath — one plain fade each. */
export function OdosWordmark({ compact = false, showTagline = true, delayMs = 260 }: OdosWordmarkProps) {
  const reducedMotion = useReducedMotion();

  const enter = (extraDelay: number) =>
    reducedMotion ? FadeIn.duration(160).delay(delayMs) : FadeIn.duration(360).delay(delayMs + extraDelay);

  return (
    <View style={styles.wordmarkStack}>
      <Animated.View entering={enter(0)}>
        <Text style={[styles.odos, compact && styles.odosCompact]}>ODOS</Text>
      </Animated.View>
      <Animated.View entering={enter(80)}>
        <Text style={[styles.market, compact && styles.marketCompact]}>MARKET</Text>
      </Animated.View>
      {showTagline ? (
        <Animated.View entering={enter(180)}>
          <Text style={styles.tagline}>Discover. Shop. Smile.</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: LAUNCH_BG,
  },
  wordmarkStack: {
    alignItems: "center",
  },
  odos: {
    fontFamily: Fonts.black,
    fontSize: rMS(32),
    letterSpacing: 6,
    color: "#FFFFFF",
    textAlign: "center",
  },
  odosCompact: {
    fontSize: rMS(23),
    letterSpacing: 4.5,
  },
  market: {
    marginTop: rV(2),
    fontFamily: Fonts.title,
    fontSize: rMS(12.5),
    letterSpacing: 6,
    color: LAUNCH_ACCENT,
    textAlign: "center",
  },
  marketCompact: {
    fontSize: rMS(10.5),
    letterSpacing: 5,
  },
  tagline: {
    marginTop: rV(14),
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
    color: "rgba(255,255,255,0.62)",
    textAlign: "center",
  },
});
