import CommerceImage from "@/components/media/CommerceImage";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

/**
 * The product showcase at the top of the detail screen.
 *
 * Built as two layers, deliberately:
 *
 *   1. A backdrop that fills the whole section edge to edge, running up
 *      behind the status bar so the screen opens on one continuous surface
 *      rather than a photo sitting in a card.
 *   2. The photograph itself, laid over that backdrop with `contain`, inset
 *      clear of the notch, never cropped.
 *
 * Keeping them separate is what lets the section be taller than the
 * photography without damaging it: a square product shot in a 3:4 frame
 * letterboxes into the backdrop instead of being scaled up and sliced, and
 * the resulting margin is where the overlays live, so nothing a shopper needs
 * to see is ever covered by a badge.
 *
 * Sizing reads from `useWindowDimensions`, not a module-scope
 * `Dimensions.get()`. The previous hero captured width once at import and
 * then used it for `getItemLayout` and the paging maths, so on a tablet,
 * a foldable, split screen, or after a rotation every swipe drifted by the
 * difference between the real width and the width at startup.
 */

/** Dots stay readable up to this many; past it a count reads better. */
const MAX_DOTS = 6;

/**
 * Height reserved at the foot of the section for the position indicator.
 *
 * Overlays cannot simply float over the image. `contain` only leaves margin
 * on one axis: a square photo in this frame letterboxes top and bottom, but a
 * 3:4 portrait fills the height exactly and letterboxes at the sides instead,
 * so a bottom-anchored badge would sit directly on the product. Taking the
 * strip out of the image box first means the indicator is always beside the
 * photograph, whatever shape it is.
 */
const INDICATOR_STRIP = 30;

export type ProductGalleryProps = {
  images: unknown[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onPressImage: () => void;
  /** Stable prefix for image tracking/recycling keys. */
  idPrefix: string;
  /** Matches the screen's content inset so thumbnails line up with the copy. */
  horizontalPadding: number;
  /** Safe-area top inset: the backdrop spans it, the product never does. */
  topInset: number;
};

export default function ProductGallery({
  images,
  activeIndex,
  onActiveIndexChange,
  onPressImage,
  idPrefix,
  horizontalPadding,
  topInset,
}: ProductGalleryProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<unknown>>(null);

  /**
   * Taller than the photography, capped against the viewport.
   *
   * The floor keeps the product dominant on short screens; the ceiling stops
   * it swallowing the whole screen on a tablet, where 1.15x of a 834pt width
   * would push the price and the buy button below the fold.
   */
  const frameHeight = useMemo(
    () =>
      Math.round(
        Math.min(Math.max(width * 1.15, height * 0.42), height * 0.56),
      ),
    [height, width],
  );

  const styles = useMemo(
    () => createStyles(colors),
    [colors],
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      if (next !== activeIndex) {
        onActiveIndexChange(next);
      }
    },
    [activeIndex, onActiveIndexChange, width],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      onActiveIndexChange(index);
      listRef.current?.scrollToIndex({ index, animated: true });
    },
    [onActiveIndexChange],
  );

  const hasMultiple = images.length > 1;
  const sectionHeight = topInset + frameHeight;
  // The strip is only taken when something will occupy it.
  const stripHeight = hasMultiple ? INDICATOR_STRIP : 0;

  return (
    <View>
      <View style={[styles.section, { height: sectionHeight }]}>
        {/* Layer 1 — fills the section, including behind the status bar. */}
        <View style={styles.backdrop} />

        {/* Layer 2 — the photography, inset below the notch. */}
        {images.length === 0 ? (
          // A seller can publish before uploading. An empty backdrop reads as
          // a failure to load, so say plainly that there is no photo yet.
          <View style={[styles.empty, { paddingTop: topInset }]}>
            <Ionicons
              name="image-outline"
              size={rMS(34)}
              color={colors.iconMuted}
            />
            <Text style={styles.emptyText}>No photo yet</Text>
          </View>
        ) : (
        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => `${idPrefix}-slide-${index}`}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumEnd}
          // A product can carry a dozen photographs; decoding them all on
          // mount delays the first paint of the one the shopper is looking at.
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={onPressImage}
              style={[
                styles.slide,
                {
                  width,
                  height: sectionHeight,
                  paddingTop: topInset,
                  paddingBottom: stripHeight,
                },
              ]}
            >
              <CommerceImage
                source={item as never}
                style={styles.image}
                // Never crop the goods: a shopper judging a product needs the
                // whole frame the seller photographed.
                contentFit="contain"
                displayWidth={width}
                imageQuality="best"
                trackingId={`${idPrefix}-hero-${index}`}
                recyclingKey={recyclingKeyFor(item, idPrefix, index)}
                placeholderColor={colors.imagePlaceholder}
              />
            </TouchableOpacity>
          )}
        />
        )}

        {hasMultiple ? (
          <View
            style={[styles.indicatorWrap, { height: stripHeight }]}
            pointerEvents="none"
          >
            {images.length <= MAX_DOTS ? (
              images.map((_, index) => (
                <View
                  key={`${idPrefix}-dot-${index}`}
                  style={[
                    styles.dot,
                    index === activeIndex && styles.dotActive,
                  ]}
                />
              ))
            ) : (
              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {activeIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        ) : null}

      </View>

      {hasMultiple ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.thumbRow,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          {images.map((item, index) => {
            const active = index === activeIndex;
            return (
              <TouchableOpacity
                key={`${idPrefix}-thumb-${index}`}
                activeOpacity={0.85}
                onPress={() => scrollToIndex(index)}
                style={[styles.thumb, active && styles.thumbActive]}
              >
                <CommerceImage
                  source={item as never}
                  style={styles.thumbImage}
                  // `contain` here too. With `cover` on the thumbnail and
                  // `contain` on the hero, the same photograph showed two
                  // different crops in the same glance.
                  contentFit="contain"
                  displayWidth={rMS(64)}
                  trackingId={`${idPrefix}-thumb-${index}`}
                  recyclingKey={recyclingKeyFor(item, idPrefix, index)}
                  placeholderColor={colors.imagePlaceholder}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

function recyclingKeyFor(item: unknown, idPrefix: string, index: number) {
  if (item && typeof item === "object" && "uri" in item) {
    const uri = (item as { uri?: string }).uri;
    if (uri) {
      return uri;
    }
  }
  return `${idPrefix}-${index}`;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    section: { position: "relative" },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.imagePlaceholder,
    },
    slide: { alignItems: "center", justifyContent: "center" },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: rV(8),
    },
    emptyText: {
      fontFamily: Fonts.title,
      fontSize: rMS(12.5),
      color: colors.textMuted,
    },
    image: { width: "100%", height: "100%" },


    indicatorWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(5),
    },
    dot: {
      width: rMS(5),
      height: rMS(5),
      borderRadius: rMS(3),
      backgroundColor: colors.iconMuted,
      opacity: 0.45,
    },
    dotActive: {
      width: rMS(16),
      opacity: 1,
      backgroundColor: colors.text,
    },
    counter: {
      paddingHorizontal: rS(10),
      paddingVertical: rV(4),
      borderRadius: 999,
      backgroundColor: colors.card,
    },
    counterText: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: colors.textSecondary,
    },


    thumbRow: { paddingTop: rV(14), gap: rS(10) },
    thumb: {
      width: rMS(64),
      height: rMS(64),
      borderRadius: rMS(12),
      padding: rMS(4),
      backgroundColor: colors.imagePlaceholder,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    thumbActive: {
      borderWidth: 1.5,
      borderColor: colors.text,
    },
    thumbImage: { width: "100%", height: "100%" },
  });
}
