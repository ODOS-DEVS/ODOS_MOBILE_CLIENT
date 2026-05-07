import LoaderPanel from "@/components/loaders/LoaderPanel";
import { rS, rV } from "@/styles/responsive";
import React from "react";
import { StyleSheet, View } from "react-native";

type ScreenLoaderProps = {
  label?: string;
  sublabel?: string;
};

export default function ScreenLoader({
  label = "Loading content...",
  sublabel,
}: ScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <LoaderPanel label={label} sublabel={sublabel} />
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
  },
});
