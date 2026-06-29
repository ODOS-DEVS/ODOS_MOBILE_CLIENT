import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { exitAuthToHome } from "@/utils/authNavigation";
import { markOnboardingComplete } from "@/utils/onboardingStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type OnboardingSlide = {
  id: string;
  image: ImageSourcePropType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
};

const slides: OnboardingSlide[] = [
  {
    id: "discover",
    image: require("@/assets/images/onboarding1.png"),
    icon: "storefront-outline",
    title: "Shop local, all in one place",
    text: "Browse groceries, fashion, and everyday essentials from trusted vendors near you.",
  },
  {
    id: "order",
    image: require("@/assets/images/onboarding2.png"),
    icon: "checkmark-circle-outline",
    title: "Order with confidence",
    text: "Track deliveries, get real-time updates, and pay your way — card, mobile money, or wallet.",
  },
  {
    id: "start",
    image: require("@/assets/images/onboarding4.png"),
    icon: "sparkles-outline",
    title: "Ready when you are",
    text: "Create an account to save favourites, checkout faster, and keep every order in one place.",
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { requireAuth, user } = useRequireAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  useBlockBackNavigation(true);

  const finishOnboarding = useCallback(async () => {
    await markOnboardingComplete();
    exitAuthToHome(router);
  }, [router]);

  const handleSkip = useCallback(() => {
    void finishOnboarding();
  }, [finishOnboarding]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      return;
    }

    void (async () => {
      await markOnboardingComplete();

      if (user) {
        exitAuthToHome(router);
        return;
      }

      requireAuth({
        title: "Create your ODOS account",
        message: "Sign up or sign in to checkout, track orders, and save your favourites.",
        cancelLabel: "Browse first",
        onCancel: () => exitAuthToHome(router),
      });
    })();
  }, [currentIndex, finishOnboarding, requireAuth, router, user]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length) {
      setCurrentIndex(index);
    }
  }, []);

  const renderSlide: ListRenderItem<OnboardingSlide> = useCallback(
    ({ item }) => (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: isDark ? colors.surfaceMuted : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View style={styles.copyBlock}>
          <View style={[styles.iconBadge, { backgroundColor: colors.pill }]}>
            <Ionicons name={item.icon} size={rMS(22)} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>{item.text}</Text>
        </View>
      </View>
    ),
    [colors, isDark],
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + rV(8),
            borderBottomColor: colors.headerBorder,
          },
        ]}
      >
        <Text style={[styles.brand, { color: colors.text }]}>ODOS</Text>
        <Pressable onPress={handleSkip} hitSlop={12} accessibilityRole="button">
          <Text style={[styles.skip, { color: colors.textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, rV(16)),
            backgroundColor: colors.bottomBar,
            borderTopColor: colors.bottomBarBorder,
          },
        ]}
      >
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                {
                  width: index === currentIndex ? rS(22) : rS(8),
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={[styles.cta, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
            {isLastSlide ? "Get started" : "Continue"}
          </Text>
          <Ionicons
            name={isLastSlide ? "arrow-forward" : "chevron-forward"}
            size={rMS(18)}
            color={colors.onPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(20),
    paddingBottom: rV(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    letterSpacing: 1.4,
  },
  skip: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
  slide: {
    flex: 1,
    paddingHorizontal: rS(20),
    paddingTop: rV(16),
  },
  hero: {
    flex: 1,
    borderRadius: rMS(24),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: rV(280),
  },
  heroImage: {
    width: "92%",
    height: "88%",
  },
  copyBlock: {
    paddingTop: rV(24),
    paddingBottom: rV(8),
    gap: rV(10),
  },
  iconBadge: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(14),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
    lineHeight: rMS(30),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(15),
    lineHeight: rMS(23),
  },
  footer: {
    paddingHorizontal: rS(20),
    paddingTop: rV(14),
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: rV(14),
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rS(6),
  },
  dot: {
    height: rS(8),
    borderRadius: rS(4),
  },
  cta: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    paddingHorizontal: rS(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
  },
  ctaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
  },
});
