import VerifiedSeal from "@/components/badges/VerifiedSeal";
import type { StoreItem } from "@/hooks/useCommerce";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { hasStoreSocialLinks, listStoreSocialLinks } from "@/utils/social";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { type RefObject, useMemo } from "react";
import {
  Animated,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";

export const STOREFRONT_COVER_HEIGHT = rV(280);

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
  productCount: number;
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
  productCount,
}: StorefrontHeroProps) {
  const { colors } = useTheme();
  const isVerified = store.status === "active";
  const hasRating = typeof store.rating === "number" && Number.isFinite(store.rating);
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

  const coverScale = scrollY.interpolate({
    inputRange: [-80, 0],
    outputRange: [1.12, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const coverTranslateY = scrollY.interpolate({
    inputRange: [0, coverHeight],
    outputRange: [0, -coverHeight * 0.22],
    extrapolate: "clamp",
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
      <View style={[styles.coverShell, { height: coverHeight }]}>
        <Animated.View
          style={[
            styles.coverMotion,
            {
              transform: [{ scale: coverScale }, { translateY: coverTranslateY }],
            },
          ]}
        >
          {store.imageBanner ?? store.image ? (
            <Image
              source={(store.imageBanner ?? store.image) as any}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverFallback, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="storefront" size={rS(40)} color={colors.iconMuted} />
            </View>
          )}
        </Animated.View>

        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.78)"]}
          locations={[0.2, 0.72, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={[styles.topBar, { top: headerButtonTop }]}>
          <TouchableOpacity onPress={onBack} style={styles.glassButton} activeOpacity={0.88}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={styles.glassButton} activeOpacity={0.88}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.identityBlock, { backgroundColor: colors.screen }]}>
        <View style={styles.logoFloat}>
          <View style={[styles.logoRing, { borderColor: colors.screen }]}>
            {store.image ? (
              <Image source={store.image} style={styles.logoImage} resizeMode="cover" />
            ) : (
              <View style={[styles.logoFallback, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="storefront-outline" size={rS(28)} color={colors.iconMuted} />
              </View>
            )}
          </View>
          {isVerified ? <VerifiedSeal size={rS(24)} style={styles.verifiedBadge} /> : null}
        </View>

        <View ref={nameAnchorRef} collapsable={false} onLayout={handleNameLayout}>
          <Animated.Text
            style={[styles.storeTitle, { color: colors.text, opacity: inlineNameOpacity }]}
            numberOfLines={2}
          >
            {store.title}
          </Animated.Text>
        </View>

        {trustLine ? (
          <Text style={[styles.trustLine, { color: colors.textMuted }]} numberOfLines={1}>
            {isVerified ? "Verified store  ·  " : ""}
            {trustLine}
          </Text>
        ) : null}

        {store.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {store.description}
          </Text>
        ) : null}

        {productCount > 0 ? (
          <View style={[styles.countChip, { backgroundColor: colors.pill }]}>
            <Text style={[styles.countChipText, { color: colors.textSecondary }]}>
              {productCount} product{productCount === 1 ? "" : "s"}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.text }]}
            activeOpacity={0.9}
            onPress={onChat}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={rS(17)} color={colors.onPrimary} />
            <Text style={[styles.primaryActionText, { color: colors.onPrimary }]}>Message</Text>
          </TouchableOpacity>

          {onMap ? (
            <TouchableOpacity
              style={[
                styles.secondaryAction,
                { backgroundColor: colors.card, borderColor: colors.borderStrong },
              ]}
              activeOpacity={0.9}
              onPress={onMap}
            >
              <Ionicons name="location-outline" size={rS(17)} color={colors.text} />
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>Visit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {showSocial ? (
          <View style={styles.socialRow}>
            {socialItems.map((item) => (
              <TouchableOpacity
                key={item.platform}
                style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
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

export function StorefrontSectionTitle({ title, trailing }: StorefrontSectionTitleProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  coverShell: {
    overflow: "hidden",
    backgroundColor: "#1F2937",
  },
  coverMotion: {
    ...StyleSheet.absoluteFillObject,
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
    paddingBottom: rS(8),
    marginTop: -rS(52),
  },
  logoFloat: {
    marginBottom: rS(14),
  },
  logoRing: {
    width: rS(96),
    height: rS(96),
    borderRadius: rS(30),
    borderWidth: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    right: -rS(2),
    bottom: -rS(2),
  },
  storeTitle: {
    fontFamily: Fonts.black,
    fontSize: rMS(26),
    lineHeight: rMS(32),
    letterSpacing: -0.6,
    textAlign: "center",
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
