import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type ScreenLoaderProps = {
  label?: string;
};

export default function ScreenLoader({
  label = "Loading content...",
}: ScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(24),
    paddingVertical: rV(32),
  },
  label: {
    marginTop: rV(14),
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    textAlign: "center",
  },
});
