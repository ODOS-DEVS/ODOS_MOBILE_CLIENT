import { useTheme } from "@/context/ThemeContext";
import { useChatStyles } from "@/styles/themedChatStyles";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

/** Short opacity-only entrance — no slide or spring. */
export const CHAT_FADE_IN_MS = 140;
export const CHAT_FADE_OUT_MS = 100;

type TypingDotsProps = {
  color?: string;
  dotSize?: number;
};

export function TypingDots({ color = "#94A3B8", dotSize = rS(5.5) }: TypingDotsProps) {
  const dotOne = useRef(new Animated.Value(0)).current;
  const dotTwo = useRef(new Animated.Value(0)).current;
  const dotThree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const buildLoop = (value: Animated.Value, delayMs: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delayMs),
          Animated.timing(value, {
            toValue: 1,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

    const loops = [
      buildLoop(dotOne, 0),
      buildLoop(dotTwo, 160),
      buildLoop(dotThree, 320),
    ];

    loops.forEach((loop) => loop.start());
    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [dotOne, dotThree, dotTwo]);

  const renderDot = (value: Animated.Value) => (
    <Animated.View
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
        opacity: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.28, 0.95],
        }),
      }}
    />
  );

  return (
    <View style={styles.dotsRow}>
      {renderDot(dotOne)}
      {renderDot(dotTwo)}
      {renderDot(dotThree)}
    </View>
  );
}

type ChatTypingIndicatorProps = {
  visible: boolean;
  variant?: "incoming" | "outgoing";
  label?: string;
};

export function ChatTypingIndicator({
  visible,
  variant = "incoming",
  label,
}: ChatTypingIndicatorProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const isOutgoing = variant === "outgoing";
  const dotColor = isOutgoing ? "rgba(255,255,255,0.92)" : colors.textMuted;

  if (!visible) {
    return null;
  }

  return (
    <Reanimated.View
      entering={FadeIn.duration(CHAT_FADE_IN_MS)}
      exiting={FadeOut.duration(CHAT_FADE_OUT_MS)}
      style={[
        chatStyles.messageRow,
        isOutgoing ? chatStyles.messageRowMine : chatStyles.messageRowTheirs,
      ]}
    >
      <View
        style={[
          chatStyles.bubble,
          isOutgoing ? chatStyles.bubbleMine : chatStyles.bubbleTheirs,
          styles.typingBubble,
        ]}
      >
        <TypingDots color={dotColor} />
        {label ? (
          <Text
            style={[
              styles.typingLabel,
              { color: isOutgoing ? "rgba(255,255,255,0.82)" : colors.textMuted },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Reanimated.View>
  );
}

type AnimatedChatMessageWrapProps = {
  isMine: boolean;
  children: React.ReactNode;
  /** Skip entrance when re-rendering grouped follow-ups. */
  animate?: boolean;
};

export function AnimatedChatMessageWrap({
  children,
  animate = true,
}: AnimatedChatMessageWrapProps) {
  if (!animate) {
    return <View>{children}</View>;
  }

  return (
    <Reanimated.View entering={FadeIn.duration(CHAT_FADE_IN_MS)}>
      {children}
    </Reanimated.View>
  );
}

type AnimatedChatThreadWrapProps = {
  index: number;
  children: React.ReactNode;
};

export function AnimatedChatThreadWrap({ children }: AnimatedChatThreadWrapProps) {
  return <View>{children}</View>;
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(4),
    minHeight: rV(16),
    paddingHorizontal: rS(2),
  },
  typingBubble: {
    minWidth: rS(56),
    paddingVertical: rV(10),
  },
  typingLabel: {
    marginTop: rV(4),
    fontSize: rMS(10.5),
    textAlign: "center",
  },
});
