import { useOptionalImageReadyGate } from "@/context/ImageReadyGateContext";
import { Image, type ImageContentFit, type ImageProps } from "expo-image";
import React, { useEffect, useId } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type CommerceImageProps = {
  source: ImageProps["source"];
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  /** Stable id for readiness tracking. Defaults to an auto id. */
  trackingId?: string;
  /** When false, skips gate registration (e.g. decorative/off-screen). */
  participateInReadyGate?: boolean;
  recyclingKey?: string;
  transition?: number;
  placeholderColor?: string;
};

/**
 * Product/commerce image with expo-image caching and optional screen-ready gating.
 * Load and error both count as settled so failed images never block interaction forever.
 */
export default function CommerceImage({
  source,
  style,
  contentFit = "cover",
  trackingId,
  participateInReadyGate = true,
  recyclingKey,
  transition = 160,
  placeholderColor,
}: CommerceImageProps) {
  const autoId = useId();
  const id = trackingId || autoId;
  const gate = useOptionalImageReadyGate();
  const hasSource = Boolean(source);

  useEffect(() => {
    if (!participateInReadyGate || !gate) {
      return;
    }

    if (!hasSource) {
      gate.settle(id);
      return;
    }

    gate.track(id);
    return () => {
      gate.untrack(id);
    };
  }, [gate, hasSource, id, participateInReadyGate]);

  if (!hasSource) {
    return <View style={[styles.fill, style, placeholderColor ? { backgroundColor: placeholderColor } : null]} />;
  }

  return (
    <Image
      source={source}
      style={[styles.fill, style as any]}
      contentFit={contentFit}
      transition={transition}
      recyclingKey={recyclingKey || id}
      cachePolicy="memory-disk"
      onLoad={() => {
        if (participateInReadyGate) {
          gate?.settle(id);
        }
      }}
      onError={() => {
        if (participateInReadyGate) {
          gate?.settle(id);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
});
