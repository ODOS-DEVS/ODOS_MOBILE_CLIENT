import { useOptionalImageReadyGate } from "@/context/ImageReadyGateContext";
import { Image, type ImageContentFit, type ImageProps } from "expo-image";
import { cloudinaryImageUrl, type ImageQuality } from "@/utils/cloudinaryImage";
import React, { useEffect, useId, useMemo, useState } from "react";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from "react-native";

type CommerceImageProps = {
  /**
   * Accepts either expo-image's source or React Native's.
   *
   * RN 0.88 widened `ImageSourcePropType` to include a *readonly* array of
   * `ImageURISource`, which expo-image's mutable `ImageSource[]` refuses. The
   * two describe the same runtime values -- a uri object, a required() module
   * id, or a list of those -- so the mismatch is purely in the type. Callers
   * across the app hand us whichever their source helper returns, and
   * normalising once here beats casting at every call site.
   */
  source: ImageProps["source"] | ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  /** Stable id for readiness tracking. Defaults to an auto id. */
  trackingId?: string;
  /** When false, skips gate registration (e.g. decorative/off-screen). */
  participateInReadyGate?: boolean;
  recyclingKey?: string;
  transition?: number;
  placeholderColor?: string;
  /** Optional extra error callback, called in addition to ready-gate settling. */
  onError?: () => void;
  /**
   * Layout width in points, when the caller already knows it. Saves the
   * measure pass below; pass it for fixed-size tiles and avatars.
   */
  displayWidth?: number;
  /**
   * "best" for imagery a shopper inspects closely — product detail, galleries,
   * full-screen. Everything else keeps the cheaper perceptual default.
   */
  imageQuality?: ImageQuality;
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
  onError,
  displayWidth,
  imageQuality = "auto",
}: CommerceImageProps) {
  const autoId = useId();
  const id = trackingId || autoId;
  const gate = useOptionalImageReadyGate();
  const hasSource = Boolean(source);

  // Remote images used to be fetched at their stored original size whatever the
  // box they land in — a ~235KB product JPEG for a 160pt card. Measuring the
  // box lets every call site request a right-sized, modern-format variant
  // without passing anything, while `displayWidth` skips the measure when the
  // caller already knows. Width only: Cloudinary's c_limit keeps the aspect.
  const [measuredWidth, setMeasuredWidth] = useState(0);
  // Safety net: a container that never reports a width (zero-sized parent, a
  // layout pass that never runs) would otherwise sit on the placeholder
  // forever. After a beat, fall back to a full-width variant and show
  // something — a slightly oversized image beats no image.
  const [measureTimedOut, setMeasureTimedOut] = useState(false);
  const effectiveWidth =
    displayWidth ?? (measuredWidth || (measureTimedOut ? FALLBACK_WIDTH : 0));

  useEffect(() => {
    if (displayWidth || measuredWidth) {
      return;
    }
    const timer = setTimeout(() => setMeasureTimedOut(true), MEASURE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [displayWidth, measuredWidth]);

  const resolvedSource = useMemo(() => {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return source;
    }
    const uri = (source as { uri?: string }).uri;
    if (!uri || !effectiveWidth) {
      return source;
    }
    const optimized = cloudinaryImageUrl(uri, effectiveWidth, imageQuality);
    return optimized === uri ? source : { ...(source as object), uri: optimized };
  }, [source, effectiveWidth, imageQuality]);

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

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    // Only ever grow: a transient narrow measurement during layout must not
    // pin the image to a blurry variant for the rest of its life.
    if (next > 0 && next > measuredWidth) {
      setMeasuredWidth(next);
    }
  };

  if (!hasSource) {
    return <View style={[styles.fill, style, placeholderColor ? { backgroundColor: placeholderColor } : null]} />;
  }

  // Measuring takes one frame. Showing the placeholder for that frame avoids
  // fetching a wrongly-sized image and immediately replacing it.
  if (!effectiveWidth) {
    return (
      <View
        onLayout={onLayout}
        style={[styles.fill, style, placeholderColor ? { backgroundColor: placeholderColor } : null]}
      />
    );
  }

  return (
    <Image
      onLayout={onLayout}
      source={resolvedSource as ImageProps["source"]}
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
        onError?.();
      }}
    />
  );
}

/** Widest layout the app renders into, used only when measurement never happens. */
const FALLBACK_WIDTH = Dimensions.get("window").width;
const MEASURE_TIMEOUT_MS = 500;

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
});
