import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type AssistantAvatarProps = {
  size?: number;
  pulse?: boolean;
};

export function AssistantAvatar({ size = rMS(32), pulse = false }: AssistantAvatarProps) {
  const { colors } = useTheme();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (!pulse) {
      ring.value = 0;
      return;
    }
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [pulse, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + ring.value * 0.22,
    transform: [{ scale: 1 + ring.value * 0.35 }],
  }));

  return (
    <View style={[styles.avatarWrap, { width: size, height: size }]}>
      {pulse ? (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size + rS(8),
              height: size + rS(8),
              borderRadius: (size + rS(8)) / 2,
              backgroundColor: colors.primary,
            },
            ringStyle,
          ]}
        />
      ) : null}
      <View
        style={[
          styles.avatarCore,
          {
            width: size,
            height: size,
            borderRadius: size * 0.32,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Ionicons name="sparkles" size={size * 0.46} color="#FFFFFF" />
      </View>
    </View>
  );
}

type AssistantStreamingCursorProps = {
  visible: boolean;
};

export function AssistantStreamingCursor({ visible }: AssistantStreamingCursorProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 420 }),
        withTiming(1, { duration: 420 }),
      ),
      -1,
      true,
    );
  }, [opacity, visible]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      style={[
        styles.cursor,
        { backgroundColor: colors.primary },
        cursorStyle,
      ]}
    />
  );
}

export function AssistantSectionLabel({ label }: { label: string }) {
  return (
    <Animated.Text entering={FadeIn.delay(80).duration(220)} style={styles.sectionLabel}>
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
  },
  avatarCore: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cursor: {
    width: rS(2),
    height: rMS(14),
    borderRadius: 1,
    marginLeft: rS(2),
    alignSelf: "flex-end",
  },
  sectionLabel: {
    marginHorizontal: rS(16),
    marginTop: rV(6),
    marginBottom: rV(4),
    fontSize: rMS(11),
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#94A3B8",
  },
});
