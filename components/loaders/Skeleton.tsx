import { AppColors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
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

const SHIMMER_TRAVEL = Dimensions.get("window").width;

type SkeletonBlockProps = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
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
  radius = 16,
  style,
}: SkeletonBlockProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_TRAVEL, SHIMMER_TRAVEL],
  });

  return (
    <View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.55)",
            "rgba(255,255,255,0)",
          ]}
          locations={[0.35, 0.5, 0.65]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SHIMMER_TRAVEL, height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
  },
});
