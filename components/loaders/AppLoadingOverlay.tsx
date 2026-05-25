import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import Colors from "@/constants/Colors";
import { rS, rV } from "@/styles/responsive";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

type AppLoadingOverlayProps = {
  label?: string;
  sublabel?: string;
};

export default function AppLoadingOverlay({
  label = "Starting ODOS",
  sublabel = "Restoring your session",
}: AppLoadingOverlayProps) {
  return (
    <View pointerEvents="auto" style={styles.overlay}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/splash.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <LoadingSpinner label={label} sublabel={sublabel} tone="inverse" />
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
    backgroundColor: Colors.primary,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(32),
    gap: rV(28),
  },
  logo: {
    width: rS(168),
    height: rV(140),
  },
});
