import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { StoreItem } from "@/hooks/useCommerce";
import { rMS, rS, rV } from "@/styles/responsive";
import { hasStoreSocialLinks, listStoreSocialLinks } from "@/utils/social";
import CommerceImage from "@/components/media/CommerceImage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, type RefObject } from "react";
import {
  Animated,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";

/**
 * Cover height.
 *
 * Was rV(280), which pushed the store name, its rating and every action below
 * the fold on a small phone — the shopper arrived at a picture and had to
 * scroll to learn where they were. Bolt Food and Deliveroo both sit nearer a
 * fifth of the screen for the same reason: the cover sets the mood, the sheet
 * under it does the work.
 */
export const STOREFRONT_COVER_HEIGHT = rV(190);

type StorefrontHeroProps = {
  store: StoreItem;
  coverHeight: number;
  headerButtonTop: number;
  scrollY: Animated.Value;
  inlineNameOpacity: Animated.AnimatedInterpolation<number>;
  nameAnchorRef: RefObject<View | null>;
  onMeasureName: () => void;
  onBack: () => void;
  onShare: () => void;
  onChat: () => void;
  onMap?: () => void;
  productBadge?: string | null;
};

export function StorefrontHero({
  store,
  coverHeight,
  headerButtonTop,
  scrollY,
  inlineNameOpacity,
  nameAnchorRef,
  onMeasureName,
  onBack,
  onShare,
  onChat,
  onMap,
  productBadge,
}: StorefrontHeroProps) {
  const { colors } = useTheme();
  const isVerified = store.status === "active";
  const hasRating =
    typeof store.rating === "number" && Number.isFinite(store.rating);
  const socialItems = listStoreSocialLinks({
    instagramUrl: store.instagramUrl,
    facebookUrl: store.facebookUrl,
    tiktokUrl: store.tiktokUrl,
    twitterUrl: store.twitterUrl,
    websiteUrl: store.websiteUrl,
  });
  const showSocial = hasStoreSocialLinks({
    instagramUrl: store.instagramUrl,
    facebookUrl: store.facebookUrl,
    tiktokUrl: store.tiktokUrl,
    twitterUrl: store.twitterUrl,
    websiteUrl: store.websiteUrl,
  });

  // --- Stretchy cover -----------------------------------------------------
  //
  // Pulling down past the top pushes the whole scroll content down by `d`
  // pixels, which used to expose the screen background above the cover. The
  // photo now grows by exactly `d` and stays pinned to the top of the screen
  // instead, so the gap is always cover art -- the bounce Bolt Food and iOS
  // Photos use.
  //
  // Geometry, with H = coverHeight and d = -scrollY while pulling:
  //
  //   scale      = (H + d) / H   grows the photo by exactly the size of the gap
  //   translateY = -d / 2        scaling is centre-anchored, so half the growth
  //                              happens downwards; pushing back up by half of
  //                              it keeps the *bottom* edge exactly where the
  //                              content below begins. Without this the photo
  //                              would creep down over the store name as it
  //                              stretched.
  //
  // Both are transforms rather than a height change, because the scroll
  // handler runs on the native driver and layout props can't cross that
  // boundary -- animating `height` here would silently do nothing.
  const coverScale = scrollY.interpolate({
    // At d = H the photo is twice its height, which is the (H + d) / H above.
    inputRange: [-coverHeight, 0],
    outputRange: [2, 1],
    // "extend" so a hard fling keeps stretching instead of snapping to a
    // ceiling mid-pull; "clamp" so scrolling *down* never zooms the photo.
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const coverTranslateY = scrollY.interpolate({
    // Left of 0 is the stretch anchor (-d/2); right of 0 is the parallax drift
    // the cover already had as it scrolls away.
    inputRange: [-coverHeight, 0, coverHeight],
    outputRange: [-coverHeight / 2, 0, -coverHeight * 0.22],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const trustLine = useMemo(() => {
    const parts: string[] = [];
    if (hasRating) {
      parts.push(`★ ${store.rating!.toFixed(1)}`);
    }
    if (store.category) {
      parts.push(store.category);
    }
    if (store.city) {
      parts.push(store.city);
    }
    return parts.join("  ·  ");
  }, [hasRating, store.category, store.city, store.rating]);

  const handleNameLayout = (_event: LayoutChangeEvent) => {
    onMeasureName();
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.screen }]}>
      <View
        style={[
          styles.coverShell,
          { height: coverHeight, backgroundColor: colors.inverseSurface },
        ]}
      >
        <Animated.View
          style={[
            styles.coverMotion,
            {
              // Translate before scale, so the translation stays in unscaled
              // screen pixels. Reversed, React Native multiplies it by the
              // scale factor and the photo drifts as it stretches.
              transform: [
                { translateY: coverTranslateY },
                { scale: coverScale },
              ],
            },
          ]}
        >
          {(store.imageBanner ?? store.image) ? (
            <CommerceImage
              source={(store.imageBanner ?? store.image) as any}
              style={styles.coverImage}
              contentFit="cover"
              trackingId={`storefront-cover-${store.id}`}
              recyclingKey={store.imageBannerKey || store.imageBannerUrl || store.imageKey || store.imageUrl || store.id}
            />
          ) : (
            <View
              style={[
                styles.coverFallback,
                { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <Ionicons
                name="storefront"
                size={rS(40)}
                color={colors.iconMuted}
              />
            </View>
          )}
        </Animated.View>

        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.78)"]}
          locations={[0.2, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.topBar, { top: headerButtonTop }]}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.glassButton}
            activeOpacity={0.88}
          >
            <Ionicons name="arrow-back" size={22} color={colors.onInverseSurface} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            style={styles.glassButton}
            activeOpacity={0.88}
          >
            <Ionicons name="share-outline" size={20} color={colors.onInverseSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.identityBlock, { backgroundColor: colors.screen }]}>
        {/*
          The logo medallion is gone on purpose.

          The cover and the logo were two photographs of the same shop stacked
          on top of each other, and the medallion punched a hole through the
          one that was actually chosen as artwork. Bolt Food shows a single
          image for the same reason: one picture reads as a place, two read as
          a template with slots.

          Verification follows the name instead, which is where trust belongs —
          attached to the shop's identity rather than floating over its photo.
        */}
        <View
          ref={nameAnchorRef}
          collapsable={false}
          onLayout={handleNameLayout}
        >
          <Animated.View style={{ opacity: inlineNameOpacity }}>
            <Text style={[styles.storeTitle, { color: colors.text }]} numberOfLines={2}>
              {store.title}
            </Text>
          </Animated.View>
        </View>

        {trustLine ? (
          <Text
            style={[styles.trustLine, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {isVerified ? "Verified store  ·  " : ""}
            {trustLine}
          </Text>
        ) : null}

        {store.description ? (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {store.description}
          </Text>
        ) : null}

        {/*
          The three things a shopper does *to* a shop, rather than inside it.

          They were scattered: share hid in the cover's glass bar, chat lived
          further down the page, and directions were only reachable from the
          info panel. Collecting them under the name makes the sheet a header
          for the shop rather than a caption for its photo.

          Each is gated on being possible — a shop with no coordinates gets no
          Directions button rather than one that apologises when tapped.
        */}
        <View style={styles.quickActions}>
          <StorefrontQuickAction icon="chatbubble-ellipses-outline" label="Message" onPress={onChat} />
          {onMap ? (
            <StorefrontQuickAction icon="navigate-outline" label="Directions" onPress={onMap} />
          ) : null}
          <StorefrontQuickAction icon="share-social-outline" label="Share" onPress={onShare} />
        </View>

        {productBadge ? (
          <View style={[styles.countChip, { backgroundColor: colors.pill }]}>
            <Ionicons
              name="bag-handle-outline"
              size={rMS(13)}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.countChipText, { color: colors.textSecondary }]}
            >
              {productBadge}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.inverseSurface }]}
            activeOpacity={0.9}
            onPress={onChat}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={rS(17)}
              color={colors.onInverseSurface}
            />
            <Text
              style={[styles.primaryActionText, { color: colors.onInverseSurface }]}
            >
              Message
            </Text>
          </TouchableOpacity>

          {onMap ? (
            <TouchableOpacity
              style={[
                styles.secondaryAction,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.borderStrong,
                },
              ]}
              activeOpacity={0.9}
              onPress={onMap}
            >
              <Ionicons
                name="location-outline"
                size={rS(17)}
                color={colors.text}
              />
              <Text
                style={[styles.secondaryActionText, { color: colors.text }]}
              >
                Visit
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {showSocial ? (
          <View style={styles.socialRow}>
            {socialItems.map((item) => (
              <TouchableOpacity
                key={item.platform}
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
                activeOpacity={0.86}
                onPress={() => void Linking.openURL(item.url)}
              >
                <Ionicons name={item.icon} size={rS(18)} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

type StorefrontSectionTitleProps = {
  title: string;
  trailing?: React.ReactNode;
};

export function StorefrontSectionTitle({
  title,
  trailing,
}: StorefrontSectionTitleProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {trailing}
    </View>
  );
}

/** One quick action: icon over label, sized to share a row evenly. */
function StorefrontQuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={{ flex: 1 }}>
      <View
        style={[
          styles.quickAction,
          { borderColor: colors.cardBorder, backgroundColor: colors.surfaceSubtle },
        ]}
      >
        <Ionicons name={icon} size={rMS(17)} color={colors.text} />
        <Text style={[styles.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // Deliberately not clipped: the cover has to be free to grow *above* its
    // own box when the user pulls down. The ScrollView's own frame still clips
    // anything that travels off the top of the screen.
    overflow: "visible",
  },
  coverShell: {
    overflow: "visible",
  },
  coverMotion: {
    ...StyleSheet.absoluteFill,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    left: rS(16),
    right: rS(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 4,
  },
  glassButton: {
    width: rS(44),
    height: rS(44),
    borderRadius: rS(22),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
  },
  identityBlock: {
    alignItems: "center",
    paddingHorizontal: rS(24),
    paddingTop: rS(18),
    paddingBottom: rS(8),
    // A small lift, so the sheet reads as sitting over the cover rather than
    // butting against it. The old -52 existed only to host the logo; with the
    // medallion gone, that much overlap would have eaten the artwork.
    marginTop: -rS(20),
    borderTopLeftRadius: rS(22),
    borderTopRightRadius: rS(22),
  },
  storeTitle: {
    fontFamily: Fonts.black,
    fontSize: rMS(24),
    lineHeight: rMS(30),
    letterSpacing: -0.6,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    gap: rS(9),
    marginTop: rV(14),
    alignSelf: "stretch",
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: rV(5),
    paddingVertical: rV(10),
    borderRadius: rMS(13),
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickActionLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11.5),
  },
  trustLine: {
    marginTop: rS(8),
    fontFamily: Fonts.title,
    fontSize: rMS(12.5),
    textAlign: "center",
  },
  description: {
    marginTop: rS(14),
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(21),
    textAlign: "center",
  },
  countChip: {
    marginTop: rS(14),
    borderRadius: rS(999),
    paddingHorizontal: rS(14),
    paddingVertical: rS(6),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  countChipText: {
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(10),
    marginTop: rS(20),
    width: "100%",
  },
  primaryAction: {
    flex: 1,
    minHeight: rV(48),
    borderRadius: rS(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
  },
  primaryActionText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
  secondaryAction: {
    flex: 1,
    minHeight: rV(48),
    borderRadius: rS(14),
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
  },
  secondaryActionText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(14),
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(10),
    marginTop: rS(18),
  },
  socialButton: {
    width: rS(44),
    height: rS(44),
    borderRadius: rS(22),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    marginTop: rV(28),
    marginBottom: rS(12),
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    letterSpacing: -0.3,
  },
});
