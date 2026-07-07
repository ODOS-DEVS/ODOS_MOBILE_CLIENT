import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StoreExploreBarProps = {
  label: string;
  sublabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function StoreExploreBar({
  label,
  sublabel = "Search, filter, and shop the full catalog",
  loading = false,
  disabled = false,
  onPress,
}: StoreExploreBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const fadeColors = useMemo(
    () => [`${colors.screen}00`, colors.screen] as const,
    [colors.screen],
  );

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <LinearGradient
        colors={fadeColors}
        style={styles.fade}
        pointerEvents="none"
      />
      <View
        style={[
          styles.bar,
          {
            paddingBottom: Math.max(insets.bottom, rV(12)),
            backgroundColor: colors.screen,
            borderTopColor: colors.border,
          },
        ]}
      >
        {sublabel && !disabled ? (
          <Text style={[styles.sublabel, { color: colors.textMuted }]}>
            {sublabel}
          </Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: disabled ? colors.pill : colors.text,
              opacity: disabled ? 0.72 : 1,
            },
          ]}
          activeOpacity={0.92}
          onPress={onPress}
          disabled={loading || disabled}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {label}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={rMS(18)}
                color={colors.onPrimary}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  fade: {
    height: rV(32),
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(18),
    paddingTop: rV(8),
    gap: rV(8),
  },
  sublabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    textAlign: "center",
  },
  button: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(10),
  },
  buttonText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(15),
  },
});
