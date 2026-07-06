import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StoreExploreBarProps = {
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export default function StoreExploreBar({ label, loading = false, onPress }: StoreExploreBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <LinearGradient
        colors={["rgba(245,247,250,0)", colors.screen]}
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
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.text }]}
          activeOpacity={0.92}
          onPress={onPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{label}</Text>
              <Ionicons name="arrow-forward" size={rMS(18)} color={colors.onPrimary} />
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
    height: rV(28),
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(18),
    paddingTop: rV(10),
  },
  button: {
    minHeight: rV(54),
    borderRadius: rMS(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(10),
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(15),
  },
});
