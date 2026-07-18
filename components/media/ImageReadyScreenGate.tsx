import {
  ImageReadyGateProvider,
  useImageReadyGate,
} from "@/context/ImageReadyGateContext";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";

type ImageReadyScreenGateProps = {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  resetKey: string;
  enabled?: boolean;
  timeoutMs?: number;
};

function ImageReadyScreenGateInner({
  children,
  skeleton,
}: {
  children: React.ReactNode;
  skeleton: React.ReactNode;
}) {
  const { ready } = useImageReadyGate();
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View
        style={[styles.content, { opacity: ready ? 1 : 0 }]}
        pointerEvents={ready ? "auto" : "none"}
        collapsable={false}
      >
        {children}
      </View>
      {!ready ? (
        <View
          style={[styles.overlay, { backgroundColor: colors.screen }]}
          pointerEvents="auto"
        >
          {skeleton}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Keeps a commerce screen non-interactive until tracked product images settle
 * (or a timeout fires). Content mounts underneath so images can load.
 */
export default function ImageReadyScreenGate({
  children,
  skeleton,
  resetKey,
  enabled = true,
  timeoutMs,
}: ImageReadyScreenGateProps) {
  return (
    <ImageReadyGateProvider resetKey={resetKey} enabled={enabled} timeoutMs={timeoutMs}>
      <ImageReadyScreenGateInner skeleton={skeleton}>{children}</ImageReadyScreenGateInner>
    </ImageReadyGateProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
