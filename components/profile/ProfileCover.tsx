import { rMS, rS, rV } from "@/styles/responsive";
import {
  getProfileCoverPalette,
} from "@/utils/profileCover";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type ProfileCoverProps = {
  gender?: string | null;
  height?: number;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function ProfileCover({
  gender,
  height = rV(128),
  style,
  compact = false,
}: ProfileCoverProps) {
  const palette = getProfileCoverPalette(gender);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          width: "100%",
          height,
          overflow: "hidden",
        },
        orbLarge: {
          position: "absolute",
          width: compact ? rS(88) : rS(132),
          height: compact ? rS(88) : rS(132),
          borderRadius: compact ? rS(44) : rS(66),
          backgroundColor: palette.accent,
          top: compact ? -rV(24) : -rV(36),
          right: compact ? -rS(18) : -rS(28),
        },
        orbSmall: {
          position: "absolute",
          width: compact ? rS(44) : rS(64),
          height: compact ? rS(44) : rS(64),
          borderRadius: compact ? rS(22) : rS(32),
          backgroundColor: palette.accent,
          bottom: compact ? rV(8) : rV(14),
          left: compact ? rS(12) : rS(18),
        },
        watermarkWrap: {
          ...StyleSheet.absoluteFillObject,
          alignItems: "center",
          justifyContent: "center",
        },
        stripe: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: StyleSheet.hairlineWidth,
          backgroundColor: "rgba(255, 255, 255, 0.22)",
        },
      }),
    [compact, height, palette.accent],
  );

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[...palette.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />
      <View style={styles.watermarkWrap} pointerEvents="none">
        <Ionicons
          name="person-outline"
          size={compact ? rMS(36) : rMS(56)}
          color={palette.watermark}
          style={{ opacity: 0.85 }}
        />
      </View>
      <View style={styles.stripe} />
    </View>
  );
}
