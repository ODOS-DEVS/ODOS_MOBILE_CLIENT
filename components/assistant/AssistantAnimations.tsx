import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type AssistantAvatarProps = {
  size?: number;
  /** Soft breathing ring — use only while assistant is thinking. */
  pulse?: boolean;
};

export function AssistantAvatar({ size = rMS(32), pulse = false }: AssistantAvatarProps) {
  const { colors } = useTheme();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (!pulse) {
      ring.value = withTiming(0, { duration: 200 });
      return;
    }
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + ring.value * 0.14,
    transform: [{ scale: 1 + ring.value * 0.12 }],
  }));

  return (
    <View style={[styles.avatarWrap, { width: size, height: size }]}>
      {pulse ? (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size + rS(6),
              height: size + rS(6),
              borderRadius: (size + rS(6)) / 2,
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
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 520, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
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
      style={[
        styles.cursor,
        { backgroundColor: colors.primary },
        cursorStyle,
      ]}
    />
  );
}

export function AssistantSectionLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
      {label}
    </Text>
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cursor: {
    width: rS(2),
    height: rMS(14),
    borderRadius: 1,
    marginLeft: rS(2),
    alignSelf: "flex-end",
    marginBottom: rMS(2),
  },
  sectionLabel: {
    marginHorizontal: rS(16),
    marginTop: rV(8),
    marginBottom: rV(4),
    fontSize: rMS(11.5),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
