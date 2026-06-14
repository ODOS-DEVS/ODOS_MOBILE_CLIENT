import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { PromoBannerItem } from "@/hooks/usePromoBanners";
import type { StoreVoucherOffer } from "@/hooks/useVouchers";
import { useResponsive, rMS, rS, rV } from "@/styles/responsive";
import { resolveApiMediaUrl } from "@/utils/media";
import { navigateFromPromoLink } from "@/utils/promoNavigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type PromoBannerProps = {
  banners?: PromoBannerItem[];
  featuredPromotion?: StoreVoucherOffer | null;
  dealCount?: number;
  onPress?: () => void;
};

function getGradientColors(accent: PromoBannerItem["accent"], isDark: boolean) {
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
  width,
}: {
  banner?: PromoBannerItem;
  featuredPromotion?: StoreVoucherOffer | null;
  dealCount?: number;
  onPress?: () => void;
  width: number;
}) {
  const { horizontalPadding } = useResponsive();
  const { colors, isDark } = useTheme();

  const headline = banner?.title ?? featuredPromotion?.title ?? "Deals & Promotions";
  const subtitle =
    banner?.subtitle ??
    (featuredPromotion
      ? featuredPromotion.rewardText
      : dealCount && dealCount > 0
        ? `${dealCount} live offer${dealCount === 1 ? "" : "s"} across ODOS`
        : "Save on curated picks and promo codes");
  const ctaLabel = banner?.ctaLabel ?? "Browse deals";
  const imageSource = banner?.imageUrl
    ? { uri: resolveApiMediaUrl(banner.imageUrl) }
    : require("@/assets/images/promo.png");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          width: width - horizontalPadding * 2,
          marginHorizontal: horizontalPadding,
          marginTop: rV(8),
          borderRadius: rMS(22),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? colors.border : "rgba(15, 23, 42, 0.08)",
        },
        gradient: {
          minHeight: rV(168),
          paddingHorizontal: rS(18),
          paddingVertical: rV(18),
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
        codePill: {
          alignSelf: "flex-start",
          marginTop: rV(10),
          paddingHorizontal: rS(10),
          paddingVertical: rV(5),
          borderRadius: rMS(999),
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)",
        },
        codeText: {
          fontFamily: Fonts.textBold,
          fontSize: rMS(11),
          color: isDark ? "#F8FAFC" : "#111827",
          letterSpacing: 0.6,
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
          width: rS(112),
          height: rV(132),
          alignItems: "center",
          justifyContent: "center",
        },
        artImage: {
          width: rS(118),
          height: rV(138),
        },
      }),
    [colors.border, horizontalPadding, isDark, width],
  );

  const handlePress = () => {
    if (banner?.ctaLink) {
      navigateFromPromoLink(banner.ctaLink, onPress);
      return;
    }
    onPress?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={handlePress} style={styles.shell}>
      <LinearGradient
        colors={getGradientColors(banner?.accent, isDark)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.copyBlock}>
          <Text style={styles.eyebrow}>Limited-time savings</Text>
          <Text style={styles.title}>{headline}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {!banner && featuredPromotion?.code ? (
            <View style={styles.codePill}>
              <Text style={styles.codeText}>Code {featuredPromotion.code}</Text>
            </View>
          ) : null}

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
          <Image source={imageSource} style={styles.artImage} resizeMode="contain" />
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
}: PromoBannerProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const hasCmsBanners = banners.length > 0;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  if (hasCmsBanners) {
    return (
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
        >
          {banners.map((banner) => (
            <PromoBannerCard
              key={banner.id}
              banner={banner}
              onPress={onPress}
              width={width}
            />
          ))}
        </ScrollView>
        {banners.length > 1 ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: rS(6),
              marginTop: rV(8),
            }}
          >
            {banners.map((banner, index) => (
              <View
                key={banner.id}
                style={{
                  width: rS(index === activeIndex ? 18 : 6),
                  height: rV(6),
                  borderRadius: rS(999),
                  backgroundColor: index === activeIndex ? "#696969" : "#CBD5E1",
                }}
              />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <PromoBannerCard
      featuredPromotion={featuredPromotion}
      dealCount={dealCount}
      onPress={onPress}
      width={width}
    />
  );
}
