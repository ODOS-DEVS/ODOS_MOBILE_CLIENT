import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const SHIMMER_WIDTH = Dimensions.get("window").width;

type SkeletonBlockProps = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Stagger entry — milliseconds before shimmer starts. */
  delay?: number;
};

export function SkeletonPulse({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={style}>{children}</View>;
}

export function SkeletonBlock({
  width = "100%",
  height,
  radius = 10,
  style,
  delay = 0,
}: SkeletonBlockProps) {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const shimmerColors = useMemo(
    () =>
      [
        "rgba(255,255,255,0)",
        colors.skeletonHighlight,
        "rgba(255,255,255,0)",
      ] as const,
    [colors.skeletonHighlight],
  );

  useEffect(() => {
    let shimmerLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let mounted = true;

    const start = setTimeout(() => {
      if (!mounted) {
        return;
      }

      shimmerLoop = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      );

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      shimmerLoop.start();
      pulseLoop.start();
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(start);
      shimmerLoop?.stop();
      pulseLoop?.stop();
    };
  }, [delay, pulse, shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_WIDTH * 0.45, SHIMMER_WIDTH * 0.45],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={shimmerColors}
          locations={[0.42, 0.5, 0.58]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SHIMMER_WIDTH, height: "100%" }}
        />
      </Animated.View>
    </Animated.View>
  );
}

export function SkeletonLine({
  width = "100%",
  height = rV(10),
  radius = 6,
  style,
  delay = 0,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  return (
    <SkeletonBlock width={width} height={height} radius={radius} style={style} delay={delay} />
  );
}

export function SkeletonTile({
  width = "100%",
  height,
  radius = 12,
  style,
  delay = 0,
}: {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  return (
    <SkeletonBlock width={width} height={height} radius={radius} style={style} delay={delay} />
  );
}

/** Matches RecommendationCard proportions on home / deals lists. */
export function SkeletonProductRow({
  delay = 0,
  style,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.productRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
    >
      <SkeletonTile width={rS(106)} height={rS(118)} radius={rMS(18)} delay={delay} />
      <View style={styles.productRowCopy}>
        <SkeletonLine width="40%" height={rV(9)} delay={delay + 40} />
        <SkeletonLine width="86%" height={rV(12)} delay={delay + 80} />
        <SkeletonLine width="55%" height={rV(9)} delay={delay + 120} />
        <View style={styles.productRowFooter}>
          <SkeletonLine width="30%" height={rV(13)} delay={delay + 160} />
          <SkeletonTile width={rS(34)} height={rS(34)} radius={17} delay={delay + 160} />
        </View>
      </View>
    </View>
  );
}

/** Compact row for categories / cart lines. */
export function SkeletonListRow({
  delay = 0,
  style,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.listRow, style]}>
      <SkeletonTile width={rS(48)} height={rS(48)} radius={10} delay={delay} />
      <View style={styles.listRowCopy}>
        <SkeletonLine width="68%" height={rV(10)} delay={delay + 40} />
        <SkeletonLine width="38%" height={rV(8)} delay={delay + 80} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  listRowCopy: {
    flex: 1,
    gap: rV(7),
  },
  productRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(14),
    padding: rS(14),
    borderRadius: rMS(22),
    borderWidth: StyleSheet.hairlineWidth,
  },
  productRowCopy: {
    flex: 1,
    gap: rV(8),
    paddingTop: rV(2),
  },
  productRowFooter: {
    marginTop: rV(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
