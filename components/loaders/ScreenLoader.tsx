import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import { AppColors } from "@/constants/Colors";
import { rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, View } from "react-native";

type ScreenLoaderProps = {
  label?: string;
  sublabel?: string;
};

export default function ScreenLoader({
  label = "Loading",
  sublabel,
}: ScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <LoadingSpinner label={label} sublabel={sublabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(24),
    paddingVertical: rV(40),
    minHeight: rV(280),
    backgroundColor: "#F5F7FA",
  },
});
