import { LAUNCH_ACCENT } from "@/components/launch/OdosLaunchChrome";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

export type OnboardingSlideData = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  headline: string;
  subhead: string;
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    key: "discover",
    icon: "storefront-outline",
    headline: "Shop stores near you",
    subhead: "Discover real vendors in your city and everything they sell, all in one market.",
  },
  {
    key: "track",
    icon: "bicycle-outline",
    headline: "Watch it arrive",
    subhead: "Track your order from checkout to your doorstep, every step of the way.",
  },
  {
    key: "chat",
    icon: "chatbubble-ellipses-outline",
    headline: "Chat with your vendor",
    subhead: "Ask a question, request a swap, or just say hi — message vendors directly, anytime.",
  },
];

type SlideProgressInputs = {
  index: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
};

function useSlideProgressStyle({ index, scrollX, pageWidth }: SlideProgressInputs, kind: "icon" | "text") {
  return useAnimatedStyle(() => {
    const input = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];
    const opacity = interpolate(scrollX.value, input, [0.25, 1, 0.25], Extrapolation.CLAMP);

    if (kind === "icon") {
      const scale = interpolate(scrollX.value, input, [0.8, 1, 0.8], Extrapolation.CLAMP);
      return { opacity, transform: [{ scale }] };
    }

    const translateY = interpolate(scrollX.value, input, [16, 0, 16], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });
}

type OnboardingFeatureSlideProps = SlideProgressInputs & OnboardingSlideData;

export function OnboardingFeatureSlide({
  index,
  scrollX,
  pageWidth,
  icon,
  headline,
  subhead,
}: OnboardingFeatureSlideProps) {
  const iconStyle = useSlideProgressStyle({ index, scrollX, pageWidth }, "icon");
  const textStyle = useSlideProgressStyle({ index, scrollX, pageWidth }, "text");

  return (
    <View style={[styles.slide, { width: pageWidth }]}>
      <Animated.View style={[styles.iconBadge, iconStyle]}>
        <Ionicons name={icon} size={rS(46)} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subhead}>{subhead}</Text>
      </Animated.View>
    </View>
  );
}

type DotProps = {
  index: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
};

function Dot({ index, scrollX, pageWidth }: DotProps) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];
    const width = interpolate(scrollX.value, input, [rS(6), rS(20), rS(6)], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, input, [0.32, 1, 0.32], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

type OnboardingDotsProps = {
  count: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
};

export function OnboardingDots({ count, scrollX, pageWidth }: OnboardingDotsProps) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, index) => (
        <Dot key={index} index={index} scrollX={scrollX} pageWidth={pageWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(36),
  },
  iconBadge: {
    width: rS(108),
    height: rS(108),
    borderRadius: rS(54),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(28),
    backgroundColor: "rgba(255, 59, 95, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 59, 95, 0.4)",
  },
  headline: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(23),
    lineHeight: rMS(29),
    color: "#FFFFFF",
    textAlign: "center",
  },
  subhead: {
    marginTop: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(14.5),
    lineHeight: rMS(21),
    color: "rgba(255,255,255,0.62)",
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  dot: {
    height: rS(6),
    borderRadius: rS(3),
    backgroundColor: LAUNCH_ACCENT,
  },
});
