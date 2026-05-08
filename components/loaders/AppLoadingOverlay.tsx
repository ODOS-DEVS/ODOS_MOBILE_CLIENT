import LoaderPanel from "@/components/loaders/LoaderPanel";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

type AppLoadingOverlayProps = {
  label?: string;
  sublabel?: string;
};

export default function AppLoadingOverlay({
  label = "Getting ODOS ready",
  sublabel = "Please wait while we finish loading your session, storefront, and latest account updates.",
}: AppLoadingOverlayProps) {
  return (
    <View pointerEvents="auto" style={styles.overlay}>
      <View
        style={[
          StyleSheet.absoluteFill,
          Platform.OS === "ios" ? styles.iosGlass : styles.fallbackGlass,
        ]}
      />
      <View style={styles.scrim} />
      <View style={styles.contentWrap}>
        <LoaderPanel label={label} sublabel={sublabel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(241,245,249,0.72)",
  },
  iosGlass: {
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  fallbackGlass: {
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  contentWrap: {
    width: "100%",
    paddingHorizontal: 24,
  },
});
