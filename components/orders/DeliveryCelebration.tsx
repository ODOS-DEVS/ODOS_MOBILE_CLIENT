import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo } from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONFETTI_COLORS = ["#F59E0B", "#34D399", "#60A5FA", "#F472B6", "#A78BFA", "#FBBF24"];
const CONFETTI_COUNT = 26;
const AUTO_DISMISS_MS = 2600;

type DeliveryCelebrationProps = {
  visible: boolean;
  onDone: () => void;
};

function ConfettiPiece({ index }: { index: number }) {
  const translateY = useSharedValue(-40);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const config = useMemo(() => {
    const startX = Math.random() * SCREEN_WIDTH;
    const drift = (Math.random() - 0.5) * 120;
    const duration = 1400 + Math.random() * 900;
    const delay = Math.random() * 260;
    const size = 6 + Math.random() * 6;
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const isCircle = Math.random() > 0.5;
    return { startX, drift, duration, delay, size, color, isCircle };
  }, [index]);

  useEffect(() => {
    translateY.value = withDelay(
      config.delay,
      withTiming(720, { duration: config.duration, easing: Easing.in(Easing.quad) }),
    );
    translateX.value = withDelay(
      config.delay,
      withTiming(config.drift, { duration: config.duration, easing: Easing.inOut(Easing.sin) }),
    );
    rotate.value = withDelay(
      config.delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: config.duration }),
    );
    opacity.value = withDelay(
      config.delay + config.duration * 0.6,
      withTiming(0, { duration: config.duration * 0.4 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: config.startX,
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: config.isCircle ? config.size : 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function DeliveryCelebration({ visible, onDone }: DeliveryCelebrationProps) {
  const { colors } = useTheme();
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0.5);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    checkScale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 180 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    ringScale.value = withTiming(2.1, { duration: 700, easing: Easing.out(Easing.quad) });
    ringOpacity.value = withTiming(0, { duration: 700 });

    const timeout = setTimeout(onDone, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <Pressable
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.backdrop }}
        onPress={onDone}
      >
        {Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
          <ConfettiPiece key={index} index={index} />
        ))}

        <View style={{ alignItems: "center", gap: rV(16) }}>
          <View style={{ alignItems: "center", justifyContent: "center", width: rMS(96), height: rMS(96) }}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: rMS(96),
                  height: rMS(96),
                  borderRadius: rMS(48),
                  backgroundColor: colors.successSoft,
                },
                ringStyle,
              ]}
            />
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark-circle" size={rMS(88)} color={colors.successText} />
            </Animated.View>
          </View>
          <Text
            style={{
              fontFamily: Fonts.titleBold,
              fontSize: rMS(20),
              color: colors.onInverseSurface,
              textAlign: "center",
            }}
          >
            Delivered!
          </Text>
          <Text
            style={{
              fontFamily: Fonts.text,
              fontSize: rMS(13),
              color: colors.mutedOnInverse,
              textAlign: "center",
              paddingHorizontal: rS(32),
            }}
          >
            Your order has arrived. Tap anywhere to continue.
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}
