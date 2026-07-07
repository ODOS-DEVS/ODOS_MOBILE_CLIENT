import { CarouselDots } from "@/components/ui/CarouselDots";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useCarouselAutoPlay } from "@/hooks/useCarouselAutoPlay";
import type { PromoBannerItem } from "@/hooks/usePromoBanners";
import type { StoreVoucherOffer } from "@/hooks/useVouchers";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import { resolveApiMediaUrl } from "@/utils/media";
import { navigateFromPromoBanner } from "@/utils/promoNavigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const CARD_HEIGHT = rV(156);
const CAROUSEL_HEIGHT = CARD_HEIGHT + rV(34);
const AUTO_PLAY_INTERVAL_MS = 5000;

type PromoBannerProps = {
  banners?: PromoBannerItem[];
  featuredPromotion?: StoreVoucherOffer | null;
  dealCount?: number;
  onPress?: () => void;
  /** When false, carousel fits a parent that already applies horizontal padding. */
  inset?: boolean;
};

function getGradientColors(
  accent: PromoBannerItem["accent"],
  isDark: boolean,
): readonly [string, string, string] {
  if (accent === "teal") {
    return isDark
      ? ["#0F172A", "#134E4A", "#1F2937"]
      : ["#ECFEFF", "#CCFBF1", "#F8FAFC"];
  }
  if (accent === "default") {
    return isDark
      ? ["#111827", "#1F2937", "#374151"]
      : ["#F8FAFC", "#EEF2FF", "#FFFFFF"];
  }
  return isDark
    ? ["#1A2234", "#243044", "#1F2937"]
    : ["#FFF7ED", "#FFEDD5", "#F8FAFC"];
}

function PromoBannerCard({
  banner,
  featuredPromotion,
  dealCount,
  onPress,
}: {
  banner?: PromoBannerItem;
  featuredPromotion?: StoreVoucherOffer | null;
  dealCount?: number;
  onPress?: () => void;
}) {
  const { colors, isDark } = useTheme();

  const headline = banner?.title ?? "Hot Deals on ODOS";
  const subtitle =
    banner?.subtitle ??
    (dealCount && dealCount > 0
      ? `${dealCount} product deal${dealCount === 1 ? "" : "s"} live right now`
      : "Discover flash sales and price drops across ODOS");
  const ctaLabel = banner?.ctaLabel ?? "Browse deals";
  const imageSource = banner?.imageUrl
    ? { uri: resolveApiMediaUrl(banner.imageUrl) }
    : require("@/assets/images/promo.png");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          flex: 1,
          borderRadius: rMS(22),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? colors.border : "rgba(15, 23, 42, 0.08)",
          shadowColor: colors.shadow,
          shadowOpacity: isDark ? 0.18 : 0.08,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 14,
          elevation: 3,
        },
        gradient: {
          minHeight: CARD_HEIGHT,
          paddingHorizontal: rS(16),
          paddingVertical: rV(16),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        copyBlock: {
          flex: 1,
          paddingRight: rS(12),
        },
        eyebrow: {
          fontFamily: Fonts.title,
          fontSize: rMS(11),
          color: isDark ? "#FCD34D" : "#92400E",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        },
        title: {
          marginTop: rV(6),
          fontFamily: Fonts.titleBold,
          fontSize: rMS(24),
          lineHeight: rMS(28),
          color: isDark ? "#F8FAFC" : "#111827",
        },
        subtitle: {
          marginTop: rV(8),
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(18),
          color: isDark ? "#CBD5E1" : "#475569",
        },
        cta: {
          marginTop: rV(16),
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          backgroundColor: isDark ? "#F8FAFC" : "#111827",
          paddingHorizontal: rS(16),
          paddingVertical: rV(11),
          borderRadius: rMS(999),
        },
        ctaText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12.5),
          color: isDark ? "#111827" : "#FFFFFF",
        },
        artWrap: {
          width: rS(96),
          height: rV(112),
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        },
        artImage: {
          width: rS(96),
          height: rV(112),
        },
      }),
    [colors.border, colors.shadow, isDark],
  );

  const handlePress = () => {
    if (banner) {
      navigateFromPromoBanner(banner, onPress);
      return;
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={styles.shell}
    >
      <LinearGradient
        colors={getGradientColors(banner?.accent, isDark)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.copyBlock}>
          <Text style={styles.eyebrow}>Today's deals</Text>
          <Text style={styles.title} numberOfLines={2}>
            {headline}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>

          <View style={styles.cta}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
            <Ionicons
              name="arrow-forward"
              size={rMS(14)}
              color={isDark ? "#111827" : "#FFFFFF"}
            />
          </View>
        </View>

        <View style={styles.artWrap}>
          <Image
            source={imageSource}
            style={styles.artImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function PromoBanner({
  banners = [],
  featuredPromotion,
  dealCount = 0,
  onPress,
  inset = true,
}: PromoBannerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { horizontalPadding } = useResponsive();
  const listRef = useRef<FlatList<PromoBannerItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const slideWidth = inset ? screenWidth : screenWidth - horizontalPadding * 2;
  const cardPadding = inset ? horizontalPadding : 0;

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, banners.length - 1));
      listRef.current?.scrollToOffset({
        offset: clamped * slideWidth,
        animated: true,
      });
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [banners.length, slideWidth],
  );

  const { pauseAutoPlay, resumeAutoPlay } = useCarouselAutoPlay({
    count: banners.length,
    intervalMs: AUTO_PLAY_INTERVAL_MS,
    enabled: banners.length > 1,
    getActiveIndex: () => activeIndexRef.current,
    onAdvance: scrollToIndex,
  });

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / slideWidth,
      );
      const clamped = Math.max(0, Math.min(nextIndex, banners.length - 1));
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      resumeAutoPlay();
    },
    [banners.length, resumeAutoPlay, slideWidth],
  );

  const renderBannerSlide = useCallback(
    ({ item }: { item: PromoBannerItem }) => (
      <View
        style={{
          width: slideWidth,
          height: CARD_HEIGHT,
          paddingHorizontal: cardPadding,
        }}
      >
        <PromoBannerCard banner={item} onPress={onPress} />
      </View>
    ),
    [cardPadding, onPress, slideWidth],
  );

  const carouselStyles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(8),
        },
        counter: {
          position: "absolute",
          top: rV(18),
          right: cardPadding + rS(14),
          zIndex: 2,
          paddingHorizontal: rS(8),
          paddingVertical: rV(4),
          borderRadius: rMS(999),
          backgroundColor: "rgba(15, 23, 42, 0.42)",
        },
        counterText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: "#F8FAFC",
          letterSpacing: 0.4,
        },
      }),
    [cardPadding],
  );

  if (banners.length > 0) {
    return (
      <View style={carouselStyles.wrap}>
        {banners.length > 1 ? (
          <View style={carouselStyles.counter} pointerEvents="none">
            <Text style={carouselStyles.counterText}>
              {activeIndex + 1}/{banners.length}
            </Text>
          </View>
        ) : null}

        <FlatList
          ref={listRef}
          data={banners}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          scrollEnabled={banners.length > 1}
          directionalLockEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={banners.length > 1}
          keyExtractor={(item) => item.id}
          renderItem={renderBannerSlide}
          getItemLayout={(_, index) => ({
            length: slideWidth,
            offset: slideWidth * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollBeginDrag={pauseAutoPlay}
          style={{ width: slideWidth, height: CAROUSEL_HEIGHT }}
          contentContainerStyle={{
            alignItems: "flex-start",
          }}
        />

        <CarouselDots
          count={banners.length}
          activeIndex={activeIndex}
          onSelectIndex={scrollToIndex}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        marginTop: rV(8),
        paddingHorizontal: cardPadding,
      }}
    >
      <PromoBannerCard
        featuredPromotion={featuredPromotion}
        dealCount={dealCount}
        onPress={onPress}
      />
    </View>
  );
}
