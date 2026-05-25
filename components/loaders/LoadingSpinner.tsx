import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type LoadingSpinnerProps = {
  label?: string;
  sublabel?: string;
  size?: "small" | "large";
  tone?: "default" | "inverse";
  style?: StyleProp<ViewStyle>;
};

export default function LoadingSpinner({
  label,
  sublabel,
  size = "large",
  tone = "default",
  style,
}: LoadingSpinnerProps) {
  const isInverse = tone === "inverse";

  return (
    <View style={[styles.wrap, style]}>
      <ActivityIndicator
        size={size}
        color={isInverse ? "#FFFFFF" : AppColors.primary}
      />
      {label ? (
        <Text style={[styles.label, isInverse && styles.labelInverse]}>
          {label}
        </Text>
      ) : null}
      {sublabel ? (
        <Text style={[styles.sublabel, isInverse && styles.sublabelInverse]}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: rV(10),
    paddingHorizontal: rS(24),
    paddingVertical: rV(8),
  },
  label: {
    marginTop: rV(4),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    textAlign: "center",
  },
  labelInverse: {
    color: "#FFFFFF",
  },
  sublabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    textAlign: "center",
    maxWidth: rS(280),
  },
  sublabelInverse: {
    color: "rgba(255,255,255,0.82)",
  },
});
